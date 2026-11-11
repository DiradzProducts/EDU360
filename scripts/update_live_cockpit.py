import os

content = r"""'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  Volume2, 
  Bell, 
  CheckCircle2, 
  X, 
  Play, 
  Pause,
  Camera, 
  Video, 
  Filter, 
  Sparkles,
  Radio,
  FileCheck,
  RefreshCw,
  Mic,
  MessageSquare,
  Ban,
  UserX,
  PhoneCall,
  Lock,
  Flame,
  VolumeX
} from 'lucide-react';

export interface ProctorCandidate {
  id: number;
  studentId?: number;
  name: string;
  rollNo: string;
  grade: string;
  section: string;
  subject: string;
  avatar: string;
  status: 'normal' | 'warning' | 'critical' | 'uploading' | 'completed' | 'paused' | 'disqualified';
  examMode?: 'MODE_CBT' | 'MODE_HYBRID_SCAN';
  anomalyType?: string;
  suspicionScore: number; // 0 to 100
  strikes: number; // 0, 1, 2, 3
  tabSwitches: number;
  cameraActive: boolean;
  isPaused?: boolean;
  isDisqualified?: boolean;
  isNudged?: boolean;
  nudgeMessage?: string;
  scriptPagesUploaded: number;
  sealVerified: boolean;
  lastAnomalyTime?: string;
}

const INITIAL_CANDIDATES: ProctorCandidate[] = [
  {
    id: 1,
    studentId: 1,
    name: 'Aarav Sharma',
    rollNo: '14',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    status: 'normal',
    examMode: 'MODE_CBT',
    suspicionScore: 12,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false
  },
  {
    id: 2,
    studentId: 2,
    name: 'Rohan Deshmukh',
    rollNo: '22',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'critical',
    examMode: 'MODE_CBT',
    anomalyType: 'Multiple Faces',
    suspicionScore: 84,
    strikes: 2,
    tabSwitches: 3,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false,
    lastAnomalyTime: '2 mins ago'
  },
  {
    id: 3,
    studentId: 3,
    name: 'Diya Sen',
    rollNo: '09',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'warning',
    examMode: 'MODE_CBT',
    anomalyType: 'Off-Screen Gaze',
    suspicionScore: 48,
    strikes: 1,
    tabSwitches: 1,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false,
    lastAnomalyTime: '4 mins ago'
  },
  {
    id: 4,
    studentId: 4,
    name: 'Kabir Mehta',
    rollNo: '18',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'uploading',
    examMode: 'MODE_HYBRID_SCAN',
    suspicionScore: 18,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 4,
    sealVerified: true,
    lastAnomalyTime: 'Scanning script'
  },
  {
    id: 5,
    studentId: 5,
    name: 'Ananya Rao',
    rollNo: '03',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'normal',
    examMode: 'MODE_CBT',
    suspicionScore: 8,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false
  },
  {
    id: 6,
    studentId: 6,
    name: 'Vikram Joshi',
    rollNo: '31',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'warning',
    examMode: 'MODE_HYBRID_SCAN',
    anomalyType: 'Writing in Scan Window',
    suspicionScore: 62,
    strikes: 1,
    tabSwitches: 2,
    cameraActive: true,
    scriptPagesUploaded: 1,
    sealVerified: false,
    lastAnomalyTime: 'Just now'
  },
  {
    id: 7,
    studentId: 7,
    name: 'Tanvi Patel',
    rollNo: '27',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'completed',
    examMode: 'MODE_HYBRID_SCAN',
    suspicionScore: 5,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: false,
    scriptPagesUploaded: 6,
    sealVerified: true
  },
  {
    id: 8,
    studentId: 8,
    name: 'Aditya Nair',
    rollNo: '02',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    status: 'normal',
    examMode: 'MODE_CBT',
    suspicionScore: 15,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false
  }
];

export function LiveInvigilatorCockpit() {
  const [candidates, setCandidates] = useState<ProctorCandidate[]>(INITIAL_CANDIDATES);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'paused' | 'completed'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active Interactive States
  const [activeIntercomCandidateId, setActiveIntercomCandidateId] = useState<number | null>(null);
  const [warningModalCandidate, setWarningModalCandidate] = useState<ProctorCandidate | null>(null);
  const [customWarningText, setCustomWarningText] = useState('');
  const [evictModalCandidate, setEvictModalCandidate] = useState<ProctorCandidate | null>(null);
  const [evictReason, setEvictReason] = useState('Malpractice confirmed by invigilator');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Poll backend candidates for live sync
  const loadCandidates = async () => {
    try {
      const res = await api.getExamCandidates();
      if (res && res.success && res.candidates && res.candidates.length > 0) {
        setCandidates(res.candidates);
      }
    } catch {
      // Keep initial candidates on error
    }
  };

  useEffect(() => {
    loadCandidates();
    const interval = setInterval(loadCandidates, 3500);
    return () => clearInterval(interval);
  }, []);

  // 1. Push-To-Talk 1-on-1 Audio Intercom
  const handleToggleIntercom = (candidate: ProctorCandidate) => {
    if (activeIntercomCandidateId === candidate.id) {
      setActiveIntercomCandidateId(null);
      triggerToast(`Ended private intercom with ${candidate.name}. Audio channel closed.`);
    } else {
      setActiveIntercomCandidateId(candidate.id);
      triggerToast(`🎙️ 1-on-1 Intercom Active with ${candidate.name}. Speaking directly to candidate.`);
      api.sendProctorAction({
        candidate_id: candidate.id,
        action: 'INTERCOM',
        reason: '1-on-1 push-to-talk audio intercom established.'
      }).catch(console.error);
    }
  };

  // 2. Direct Warning Chat (HUD Alert)
  const handleSendWarning = (candidateId: number, message: string) => {
    const cand = candidates.find(c => c.id === candidateId);
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, isNudged: true, nudgeMessage: message } : c));
    triggerToast(`HUD Alert dispatched to ${cand?.name || 'Student'}: "${message}"`);
    setWarningModalCandidate(null);
    setCustomWarningText('');

    api.sendProctorAction({
      candidate_id: candidateId,
      action: 'NUDGE',
      reason: message
    }).catch(console.error);

    setTimeout(() => {
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, isNudged: false } : c));
    }, 4000);
  };

  // 3. Pause / Resume Candidate Exam
  const handleTogglePause = (candidate: ProctorCandidate) => {
    const willPause = !candidate.isPaused;
    const action = willPause ? 'PAUSE' : 'RESUME';

    setCandidates(prev => prev.map(c => {
      if (c.id === candidate.id) {
        return {
          ...c,
          isPaused: willPause,
          status: willPause ? 'paused' : (c.strikes >= 2 ? 'critical' : c.strikes === 1 ? 'warning' : 'normal')
        };
      }
      return c;
    }));

    triggerToast(willPause 
      ? `⏸️ Exam Paused for ${candidate.name}. Candidate screen frozen & timer locked.`
      : `▶️ Exam Resumed for ${candidate.name}. Timer & canvas unlocked.`
    );

    api.sendProctorAction({
      candidate_id: candidate.id,
      action,
      reason: willPause ? 'Invigilator paused session for desk verification' : 'Invigilator resumed exam'
    }).catch(console.error);
  };

  // 4. Force Eviction & Disqualification
  const handleConfirmEvict = () => {
    if (!evictModalCandidate) return;
    const cand = evictModalCandidate;

    setCandidates(prev => prev.map(c => {
      if (c.id === cand.id) {
        return {
          ...c,
          isDisqualified: true,
          isPaused: true,
          status: 'disqualified',
          suspicionScore: 100
        };
      }
      return c;
    }));

    triggerToast(`🚫 Candidate ${cand.name} EVICTED for malpractice. Disqualification synced with Principal.`);
    setEvictModalCandidate(null);

    api.sendProctorAction({
      candidate_id: cand.id,
      action: 'EVICT',
      reason: evictReason
    }).catch(console.error);
  };

  // Add Formal Strike (Incrementing 1, 2, 3)
  const handleAddStrike = (candidate: ProctorCandidate) => {
    const nextStrikes = Math.min(3, (candidate.strikes || 0) + 1);
    const nextScore = Math.min(100, (candidate.suspicionScore || 0) + 25);
    const willPause = nextStrikes >= 3;

    setCandidates(prev => prev.map(c => {
      if (c.id === candidate.id) {
        return {
          ...c,
          strikes: nextStrikes,
          suspicionScore: nextScore,
          isPaused: willPause,
          status: nextStrikes >= 2 ? 'critical' : 'warning'
        };
      }
      return c;
    }));

    triggerToast(nextStrikes >= 3 
      ? `🚨 STRIKE #3 issued to ${candidate.name}! Screen locked. Critical malpractice triage alert sent to Principal.`
      : `Formal Strike #${nextStrikes}/3 issued to ${candidate.name}. Suspicion: ${nextScore}%.`
    );

    api.sendProctorAction({
      candidate_id: candidate.id,
      action: 'STRIKE',
      reason: `Formal strike #${nextStrikes} issued for telemetry violations.`
    }).catch(console.error);
  };

  // Broadcast to all students in room
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    triggerToast(`Room Announcement Broadcasted: "${broadcastMessage}"`);
    setBroadcastMessage('');
  };

  // Dynamic Priority Auto-Triage: Flagged, Critical & Strike candidates sort to the top-left!
  const sortedCandidates = [...candidates].sort((a, b) => {
    // 1. Highest strikes first
    if ((b.strikes || 0) !== (a.strikes || 0)) {
      return (b.strikes || 0) - (a.strikes || 0);
    }
    // 2. Highest suspicion score next
    if ((b.suspicionScore || 0) !== (a.suspicionScore || 0)) {
      return (b.suspicionScore || 0) - (a.suspicionScore || 0);
    }
    // 3. Paused / critical status
    if (a.status === 'critical' && b.status !== 'critical') return -1;
    if (b.status === 'critical' && a.status !== 'critical') return 1;
    return a.id - b.id;
  });

  const filteredCandidates = sortedCandidates.filter(c => {
    if (filter === 'flagged') return c.status === 'warning' || c.status === 'critical' || (c.strikes || 0) > 0;
    if (filter === 'paused') return c.isPaused || c.status === 'paused' || c.status === 'disqualified';
    if (filter === 'completed') return c.status === 'completed';
    return true;
  });

  const criticalCount = candidates.filter(c => c.status === 'critical' || (c.strikes || 0) >= 2).length;
  const warningCount = candidates.filter(c => c.status === 'warning' || (c.strikes || 0) === 1).length;
  const pausedCount = candidates.filter(c => c.isPaused || c.status === 'paused').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Cockpit Command Header */}
      <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 px-3 py-1 text-[11px] font-black">
              <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
              LIVE PROCTOR SFU STREAM
            </span>
            <span className="text-xs text-violet-300/80 font-mono">
              Virtual Room Alpha &bull; LiveKit WebRTC Mesh Active
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Live Invigilator Command Cockpit &bull; Class 8-B
          </h2>
          <p className="text-xs text-violet-200/70 max-w-2xl">
            Real-time Edge YOLO &amp; Audio Telemetry. Dynamic Auto-Triage elevates flagged candidates to top-left. Push-to-Talk 1-on-1 private voice and instant exam pause controls active.
          </p>
        </div>

        {/* Real-time Telemetry Stats Pill */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-3 text-center min-w-[90px]">
            <span className="text-[10px] text-violet-300 uppercase font-bold block">Critical</span>
            <span className="text-xl font-black text-rose-400">{criticalCount}</span>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-3 text-center min-w-[90px]">
            <span className="text-[10px] text-violet-300 uppercase font-bold block">Warnings</span>
            <span className="text-xl font-black text-amber-400">{warningCount}</span>
          </div>
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-3 text-center min-w-[90px]">
            <span className="text-[10px] text-violet-300 uppercase font-bold block">Paused</span>
            <span className="text-xl font-black text-blue-400">{pausedCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar & Broadcast Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Candidates ({candidates.length})
          </button>
          <button
            onClick={() => setFilter('flagged')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'flagged'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>High Priority Flagged ({criticalCount + warningCount})</span>
          </button>
          <button
            onClick={() => setFilter('paused')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'paused'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
            }`}
          >
            <Pause className="h-3.5 w-3.5" />
            <span>Paused / Under Review ({pausedCount})</span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Submitted ({candidates.filter(c => c.status === 'completed').length})
          </button>
        </div>

        {/* Live Broadcast to Candidates */}
        <form onSubmit={handleBroadcast} className="flex items-center gap-2 flex-1 max-w-md">
          <input
            type="text"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Broadcast voice/HUD announcement to all candidates..."
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1"
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Push HUD Alert</span>
          </button>
        </form>
      </div>

      {/* CANDIDATES VIDEO MATRIX (16-Grid Responsive Mosaic with Dynamic Auto-Triage) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCandidates.map((candidate) => {
          const isCritical = candidate.status === 'critical' || (candidate.strikes || 0) >= 2;
          const isWarning = candidate.status === 'warning' || (candidate.strikes || 0) === 1;
          const isPaused = candidate.isPaused || candidate.status === 'paused';
          const isDisqualified = candidate.isDisqualified || candidate.status === 'disqualified';
          const isIntercomActive = activeIntercomCandidateId === candidate.id;

          return (
            <div
              key={candidate.id}
              className={`relative rounded-3xl overflow-hidden bg-slate-900 border-2 transition-all duration-300 shadow-md ${
                isDisqualified
                  ? 'border-rose-900 opacity-60'
                  : isPaused
                  ? 'border-amber-400 shadow-amber-500/20 ring-2 ring-amber-400/40'
                  : isCritical
                  ? 'border-rose-500 shadow-rose-500/30 ring-4 ring-rose-500/20 animate-pulse'
                  : isWarning
                  ? 'border-amber-400 shadow-amber-500/10'
                  : 'border-slate-700/80 hover:border-slate-500'
              }`}
            >
              {/* Top Status Bar on Video */}
              <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between text-[10px] font-bold">
                <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-full">
                  <span className={`h-2 w-2 rounded-full ${candidate.cameraActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <span>Roll #{candidate.rollNo}</span>
                  <span className="text-slate-400 font-normal">&bull; {candidate.name.split(' ')[0]}</span>
                </div>

                {/* Violation Tag & Strike Counter */}
                {isDisqualified ? (
                  <span className="bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full font-black text-[9px] border border-rose-700">
                    EVICTED
                  </span>
                ) : isPaused ? (
                  <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black text-[9px] shadow-sm flex items-center gap-1">
                    <Pause className="h-2.5 w-2.5" />
                    PAUSED
                  </span>
                ) : isCritical ? (
                  <span className="bg-rose-600 text-white px-2 py-0.5 rounded-full font-black text-[9px] shadow-sm flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    STRIKE {candidate.strikes}/3
                  </span>
                ) : isWarning ? (
                  <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black text-[9px] shadow-sm">
                    CAUTION 1/3
                  </span>
                ) : (
                  <span className="bg-emerald-600/80 text-white px-2 py-0.5 rounded-full font-bold text-[9px]">
                    NORMAL
                  </span>
                )}
              </div>

              {/* Simulated Live Video Tile with YOLO Bounding Box */}
              <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className={`w-full h-full object-cover filter brightness-90 contrast-105 ${
                    isDisqualified ? 'grayscale' : ''
                  }`}
                />

                {/* YOLO Bounding Box Overlay */}
                {isCritical && !isDisqualified && (
                  <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-rose-500 rounded-2xl flex flex-col justify-between p-1.5 pointer-events-none bg-rose-500/10">
                    <span className="self-start text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">
                      YOLO: {candidate.anomalyType || 'Multiple Persons Detected'} (0.91)
                    </span>
                    <span className="self-end text-[8px] font-mono text-rose-300 bg-black/60 px-1 rounded">
                      Strike Active
                    </span>
                  </div>
                )}

                {isWarning && !isCritical && !isDisqualified && (
                  <div className="absolute inset-x-12 inset-y-8 border-2 border-dashed border-amber-400 rounded-2xl flex flex-col justify-between p-1.5 pointer-events-none bg-amber-400/10">
                    <span className="self-start text-[9px] font-mono font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                      {candidate.anomalyType || 'Off-Screen Gaze'}
                    </span>
                  </div>
                )}

                {/* Intercom Active Audio Waves */}
                {isIntercomActive && (
                  <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex items-center justify-center p-3 text-center text-white animate-in zoom-in-95">
                    <div className="space-y-1">
                      <Mic className="h-7 w-7 text-emerald-400 mx-auto animate-pulse" />
                      <span className="text-xs font-black block text-emerald-300">1-on-1 Voice Intercom Active</span>
                      <span className="text-[10px] text-emerald-200">Other candidates cannot hear this call</span>
                    </div>
                  </div>
                )}

                {/* Soft Audio Nudge Notification Overlay */}
                {candidate.isNudged && !isIntercomActive && (
                  <div className="absolute inset-0 bg-violet-950/80 backdrop-blur-xs flex items-center justify-center p-3 text-center text-white animate-in zoom-in-95">
                    <div className="space-y-1">
                      <Volume2 className="h-6 w-6 text-violet-400 mx-auto animate-bounce" />
                      <span className="text-xs font-black block">HUD Alert Dispatched</span>
                      <span className="text-[10px] text-violet-200">{candidate.nudgeMessage || 'Maintain focus'}</span>
                    </div>
                  </div>
                )}

                {/* Disqualified Watermark */}
                {isDisqualified && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-2 text-center text-rose-400">
                    <div className="space-y-1">
                      <Ban className="h-8 w-8 mx-auto text-rose-500" />
                      <span className="text-xs font-black uppercase tracking-wider block">DISQUALIFIED</span>
                      <span className="text-[9px] text-slate-400">Malpractice Terminated</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Tile Controls & Telemetry */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight">
                      {candidate.name}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {candidate.grade}-{candidate.section} &bull; Roll #{candidate.rollNo}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">Suspicion</span>
                    <span className={`text-xs font-black ${
                      candidate.suspicionScore > 60 ? 'text-rose-600' : candidate.suspicionScore > 30 ? 'text-amber-500' : 'text-emerald-500'
                    }`}>
                      {candidate.suspicionScore}%
                    </span>
                  </div>
                </div>

                {/* 4 DYNAMIC INTERACTIVE CONTROLS */}
                <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {/* 1. Speak 1-on-1 Push-to-Talk Intercom */}
                  <button 
                    disabled={isDisqualified}
                    onClick={() => handleToggleIntercom(candidate)} 
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      isIntercomActive
                        ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                    }`}
                    title="Speak privately to this candidate"
                  >
                    <Mic className="h-3.5 w-3.5 mb-0.5" />
                    <span>{isIntercomActive ? 'Active' : 'Speak'}</span>
                  </button>

                  {/* 2. Direct Warning Chat */}
                  <button 
                    disabled={isDisqualified}
                    onClick={() => setWarningModalCandidate(candidate)} 
                    className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 text-[10px] font-bold transition-all cursor-pointer"
                    title="Send immediate warning message to student's screen"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mb-0.5" />
                    <span>Warn</span>
                  </button>

                  {/* 3. Pause / Resume Candidate Exam */}
                  <button 
                    disabled={isDisqualified}
                    onClick={() => handleTogglePause(candidate)} 
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      isPaused 
                        ? 'bg-amber-500 text-slate-950 font-black' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                    }`}
                    title="Freeze candidate timer & canvas"
                  >
                    {isPaused ? <Play className="h-3.5 w-3.5 mb-0.5" /> : <Pause className="h-3.5 w-3.5 mb-0.5" />}
                    <span>{isPaused ? 'Resume' : 'Pause'}</span>
                  </button>

                  {/* 4. Force Disqualify / Evict */}
                  <button 
                    disabled={isDisqualified}
                    onClick={() => setEvictModalCandidate(candidate)} 
                    className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-[10px] font-bold transition-all cursor-pointer disabled:opacity-30"
                    title="Terminate examination attempt for malpractice"
                  >
                    <Ban className="h-3.5 w-3.5 mb-0.5" />
                    <span>Evict</span>
                  </button>
                </div>

                {/* Strike action button */}
                <div className="pt-1">
                  <button
                    disabled={isDisqualified}
                    onClick={() => handleAddStrike(candidate)}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 py-1 text-[10px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <ShieldAlert className="h-3 w-3 text-rose-500" />
                    <span>Issue Strike #{Math.min(3, (candidate.strikes || 0) + 1)} / 3</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* DIRECT WARNING HUD CHAT MODAL                             */}
      {/* ========================================================= */}
      {warningModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Send Warning HUD Alert &bull; {warningModalCandidate.name}
                </h3>
              </div>
              <button 
                onClick={() => setWarningModalCandidate(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a quick preset directive or type a custom instruction to be displayed on the student&apos;s active exam canvas:
            </p>

            {/* Quick Warning Presets */}
            <div className="grid grid-cols-1 gap-2">
              {[
                "Please keep your eyes centered on the exam screen.",
                "Multiple faces detected. Please ensure you are alone in the room.",
                "Please lower background noise and maintain silence.",
                "Please adjust your webcam so your full desk is clearly visible.",
                "Integrity Warning: Alt-tabbing or window switching is recorded."
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendWarning(warningModalCandidate.id, preset)}
                  className="text-left text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-500/10 hover:border-blue-400 transition-all font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  &bull; {preset}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5 pt-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Custom Warning Message
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customWarningText}
                  onChange={(e) => setCustomWarningText(e.target.value)}
                  placeholder="Type custom proctor alert..."
                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  disabled={!customWarningText.trim()}
                  onClick={() => handleSendWarning(warningModalCandidate.id, customWarningText)}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FORCE EVICTION & DISQUALIFICATION MODAL                   */}
      {/* ========================================================= */}
      {evictModalCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-rose-200 dark:border-rose-900/60 shadow-2xl space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Ban className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Candidate Disqualification?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Candidate: <b>{evictModalCandidate.name}</b> &bull; Roll #{evictModalCandidate.rollNo}
                <br />
                Terminating the exam attempt will immediately evict the student from the portal, log an irrevocable malpractice event, and escalate to the Principal.
              </p>
            </div>

            <div className="text-left space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Official Malpractice Justification *
              </label>
              <textarea
                value={evictReason}
                onChange={(e) => setEvictReason(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEvictModalCandidate(null)}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEvict}
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white py-2.5 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Ban className="h-4 w-4" />
                <span>Confirm Eviction</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"""

with open('frontend/src/components/proctor/live-invigilator-cockpit.tsx', 'w', encoding='utf-8') as f:
    f.write(content.replace('\n', '\r\n'))

print("Updated frontend/src/components/proctor/live-invigilator-cockpit.tsx successfully.")
