import React, { useState, useEffect } from 'react';
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
  Camera, 
  Video, 
  Filter, 
  Sparkles,
  Radio,
  FileCheck,
  RefreshCw
} from 'lucide-react';

export interface ProctorCandidate {
  id: number;
  name: string;
  rollNo: string;
  grade: string;
  section: string;
  subject: string;
  avatar: string;
  status: 'normal' | 'warning' | 'critical' | 'uploading' | 'completed';
  anomalyType?: 'Multiple Faces' | 'Phone Detected' | 'Off-Screen Gaze' | 'Writing in Scan Window' | 'Audio Anomaly';
  suspicionScore: number; // 0 to 100
  strikes: number; // 0, 1, 2, 3
  tabSwitches: number;
  cameraActive: boolean;
  scriptPagesUploaded: number;
  sealVerified: boolean;
  lastAnomalyTime?: string;
  isNudged?: boolean;
}

const INITIAL_CANDIDATES: ProctorCandidate[] = [
  {
    id: 1,
    name: 'Aarav Sharma',
    rollNo: '14',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    status: 'normal',
    suspicionScore: 12,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false
  },
  {
    id: 2,
    name: 'Rohan Deshmukh',
    rollNo: '22',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'critical',
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
    name: 'Diya Sen',
    rollNo: '09',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'warning',
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
    name: 'Kabir Mehta',
    rollNo: '18',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'uploading',
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
    name: 'Ananya Rao',
    rollNo: '03',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'normal',
    suspicionScore: 8,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false
  },
  {
    id: 6,
    name: 'Vikram Joshi',
    rollNo: '31',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    status: 'warning',
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
    name: 'Tanvi Patel',
    rollNo: '27',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'completed',
    suspicionScore: 5,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: false,
    scriptPagesUploaded: 6,
    sealVerified: true
  },
  {
    id: 8,
    name: 'Aditya Nair',
    rollNo: '02',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    status: 'normal',
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
  const [filter, setFilter] = useState<'all' | 'flagged' | 'uploading' | 'completed'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<ProctorCandidate | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1-Click Audio Nudge
  const handleNudge = (id: number, name: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, isNudged: true } : c));
    triggerToast(`Sent chime audio-nudge to ${name}: "Invigilator requests desk focus."`);
    setTimeout(() => {
      setCandidates(prev => prev.map(c => c.id === id ? { ...c, isNudged: false } : c));
    }, 4000);
  };

  // Add Formal Strike
  const handleAddStrike = (id: number, name: string) => {
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const nextStrikes = Math.min(3, c.strikes + 1);
        return { 
          ...c, 
          strikes: nextStrikes, 
          status: nextStrikes >= 2 ? 'critical' : 'warning',
          suspicionScore: Math.min(100, c.suspicionScore + 25)
        };
      }
      return c;
    }));
    triggerToast(`Formal strike issued to ${name}. Telemetry synced with Principal exam record.`);
  };

  // Broadcast to all students in room
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    triggerToast(`Room Announcement Broadcasted: "${broadcastMessage}"`);
    setBroadcastMessage('');
  };

  // Candidate sorting: Critical candidates bubble to the top!
  const sortedCandidates = [...candidates].sort((a, b) => b.suspicionScore - a.suspicionScore);

  const filteredCandidates = sortedCandidates.filter(c => {
    if (filter === 'flagged') return c.status === 'warning' || c.status === 'critical';
    if (filter === 'uploading') return c.status === 'uploading';
    if (filter === 'completed') return c.status === 'completed';
    return true;
  });

  const criticalCount = candidates.filter(c => c.status === 'critical').length;
  const warningCount = candidates.filter(c => c.status === 'warning').length;
  const uploadingCount = candidates.filter(c => c.status === 'uploading').length;

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
      <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-950 p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30 px-3 py-1 text-[11px] font-black">
              <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
              LIVE PROCTOR STREAM
            </span>
            <span className="text-xs text-violet-300/80 font-mono">
              Virtual Room Alpha (Camera AI Session)
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Live Invigilator Command Cockpit &bull; Class 8-B
          </h2>
          <p className="text-xs text-violet-200/70 max-w-2xl">
            Real-time YOLO &amp; MediaPipe telemetry monitoring 38 candidates. Anomaly events auto-bubble to top. Camera remains locked through 15-min upload seal.
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
            <span className="text-[10px] text-violet-300 uppercase font-bold block">Scanning</span>
            <span className="text-xl font-black text-blue-400">{uploadingCount}</span>
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
            <span>High Anomaly ({criticalCount + warningCount})</span>
          </button>
          <button
            onClick={() => setFilter('uploading')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'uploading'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Scanning Window ({uploadingCount})</span>
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Sealed &amp; Submitted ({candidates.filter(c => c.status === 'completed').length})
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

      {/* CANDIDATES VIDEO MATRIX (16-Grid Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCandidates.map((candidate) => {
          const isCritical = candidate.status === 'critical';
          const isWarning = candidate.status === 'warning';
          const isUploading = candidate.status === 'uploading';
          const isCompleted = candidate.status === 'completed';

          return (
            <div
              key={candidate.id}
              className={`relative rounded-3xl overflow-hidden bg-slate-900 border-2 transition-all duration-300 shadow-md ${
                isCritical
                  ? 'border-rose-500 shadow-rose-500/20 ring-4 ring-rose-500/20 animate-pulse'
                  : isWarning
                  ? 'border-amber-400 shadow-amber-500/10'
                  : isUploading
                  ? 'border-blue-500'
                  : isCompleted
                  ? 'border-emerald-500/60 opacity-85'
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

                {/* Violation Tag */}
                {isCritical && (
                  <span className="bg-rose-600 text-white px-2 py-0.5 rounded-full font-black text-[9px] shadow-sm flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    STRIKE {candidate.strikes}/3
                  </span>
                )}
                {isWarning && (
                  <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-black text-[9px] shadow-sm">
                    CAUTION
                  </span>
                )}
                {isUploading && (
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full font-black text-[9px] shadow-sm flex items-center gap-1">
                    <Camera className="h-3 w-3" />
                    SCANNING (4p)
                  </span>
                )}
                {isCompleted && (
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold text-[9px]">
                    SEALED ✓
                  </span>
                )}
              </div>

              {/* Simulated Live Video Tile with YOLO Bounding Box */}
              <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="w-full h-full object-cover filter brightness-90 contrast-105"
                />

                {/* YOLO Bounding Box Simulation */}
                {isCritical && (
                  <div className="absolute inset-x-8 inset-y-6 border-2 border-dashed border-rose-500 rounded-2xl flex flex-col justify-between p-1.5 pointer-events-none bg-rose-500/10">
                    <span className="self-start text-[9px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded">
                      YOLO: {candidate.anomalyType || 'Multiple Faces'} (0.89)
                    </span>
                    <span className="self-end text-[8px] font-mono text-rose-300 bg-black/60 px-1 rounded">
                      Strike Assigned
                    </span>
                  </div>
                )}

                {isWarning && (
                  <div className="absolute inset-x-12 inset-y-8 border-2 border-dashed border-amber-400 rounded-2xl flex flex-col justify-between p-1.5 pointer-events-none bg-amber-400/10">
                    <span className="self-start text-[9px] font-mono font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                      {candidate.anomalyType || 'Gaze Anomaly'}
                    </span>
                  </div>
                )}

                {/* Unbroken Camera Banner during Scan Window */}
                {isUploading && (
                  <div className="absolute inset-x-0 bottom-0 bg-blue-900/80 backdrop-blur-xs p-1 text-center text-[10px] text-white font-bold">
                    Pose: Holding Mobile to Scan (Writing: Idle ✓)
                  </div>
                )}

                {/* Soft Audio Nudge Notification Overlay */}
                {candidate.isNudged && (
                  <div className="absolute inset-0 bg-violet-950/80 backdrop-blur-xs flex items-center justify-center p-3 text-center text-white animate-in zoom-in-95">
                    <div className="space-y-1">
                      <Volume2 className="h-6 w-6 text-violet-400 mx-auto animate-bounce" />
                      <span className="text-xs font-black block">Audio Chime Sent</span>
                      <span className="text-[10px] text-violet-200">Alerted on student headphones</span>
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

                {/* 1-Click Invigilator Actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    onClick={() => handleNudge(candidate.id, candidate.name)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-1.5 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="h-3 w-3 text-violet-500" />
                    <span>Nudge</span>
                  </button>

                  <button
                    onClick={() => handleAddStrike(candidate.id, candidate.name)}
                    className="rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 py-1.5 text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldAlert className="h-3 w-3" />
                    <span>Strike</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
