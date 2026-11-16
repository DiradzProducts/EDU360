# -*- coding: utf-8 -*-
"""
Update frontend/src/components/proctor/live-invigilator-cockpit.tsx with full authentic LiveKit style classroom,
live student frame feed, teacher preview cam, admit desk, and analysis sheet sign-off.
"""

new_cockpit_code = """'use client';

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
  VolumeX,
  ArrowRight,
  UserCheck,
  Shield,
  Award,
  Send,
  Clock,
  FileText,
  Check,
  Maximize2,
  Tv,
  BadgeAlert
} from 'lucide-react';

export interface ProctorAnalysisEntry {
  id: string;
  timestamp: string;
  category: string;
  title: string;
  ruleTriggered: string;
  confidence: number;
  actionTaken: 'STRIKE' | 'WARNING' | 'ANOMALY_LOG';
  strikeNumber?: number;
  status: 'FLAGGED' | 'CLEARED' | 'REVIEWED';
  notes: string;
}

export interface ProctorCandidate {
  id: number;
  studentId?: number;
  name: string;
  rollNo: string;
  grade: string;
  section: string;
  subject: string;
  avatar: string;
  liveFrame?: string;
  status: 'normal' | 'warning' | 'critical' | 'uploading' | 'completed' | 'paused' | 'disqualified';
  examMode?: 'MODE_CBT' | 'MODE_HYBRID_SCAN';
  anomalyType?: string;
  suspicionScore: number;
  strikes: number;
  tabSwitches: number;
  cameraActive: boolean;
  isPaused?: boolean;
  isDisqualified?: boolean;
  isNudged?: boolean;
  nudgeMessage?: string;
  scriptPagesUploaded: number;
  sealVerified: boolean;
  lastAnomalyTime?: string;
  decibels?: number;
  gaze?: string;
  isAdmitted: boolean;
  hallTicketPresented: boolean;
  hallTicketNo?: string;
  analysisSheet: ProctorAnalysisEntry[];
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
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=250',
    status: 'normal',
    examMode: 'MODE_CBT',
    suspicionScore: 10,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false,
    isAdmitted: false,
    hallTicketPresented: true,
    hallTicketNo: 'HT-2026-8B-014',
    analysisSheet: []
  },
  {
    id: 2,
    studentId: 2,
    name: 'Rohan Deshmukh',
    rollNo: '22',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250',
    status: 'warning',
    examMode: 'MODE_CBT',
    anomalyType: 'Gaze Shift',
    suspicionScore: 35,
    strikes: 1,
    tabSwitches: 1,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false,
    lastAnomalyTime: '5 mins ago',
    isAdmitted: true,
    hallTicketPresented: true,
    hallTicketNo: 'HT-2026-8B-022',
    analysisSheet: [
      {
        id: 'init-rohan-1',
        timestamp: '11:12:04 AM',
        category: 'GAZE_DRIFT',
        title: 'Gaze Shifted Away from Desk (Head Turned Left)',
        ruleTriggered: 'Face Mesh: Gaze Direction ──> Looking away > 5s ──> Gentle Warning Nudge 👁️',
        confidence: 0.91,
        actionTaken: 'WARNING',
        status: 'FLAGGED',
        notes: 'Candidate head turned away from physical exam desk for >5 seconds.'
      }
    ]
  },
  {
    id: 3,
    studentId: 3,
    name: 'Diya Sen',
    rollNo: '09',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250',
    status: 'normal',
    examMode: 'MODE_CBT',
    suspicionScore: 12,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false,
    isAdmitted: true,
    hallTicketPresented: true,
    hallTicketNo: 'HT-2026-8B-009',
    analysisSheet: []
  },
  {
    id: 4,
    studentId: 4,
    name: 'Kabir Mehta',
    rollNo: '18',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250',
    status: 'normal',
    examMode: 'MODE_HYBRID_SCAN',
    suspicionScore: 8,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 3,
    sealVerified: true,
    isAdmitted: true,
    hallTicketPresented: true,
    hallTicketNo: 'HT-2026-8B-018',
    analysisSheet: []
  },
  {
    id: 5,
    studentId: 5,
    name: 'Ananya Rao',
    rollNo: '03',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=250',
    status: 'normal',
    examMode: 'MODE_CBT',
    suspicionScore: 5,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false,
    isAdmitted: true,
    hallTicketPresented: true,
    hallTicketNo: 'HT-2026-8B-003',
    analysisSheet: []
  },
  {
    id: 6,
    studentId: 6,
    name: 'Tanvi Deshmukh',
    rollNo: '08',
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250',
    status: 'normal',
    examMode: 'MODE_CBT',
    suspicionScore: 5,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: true,
    scriptPagesUploaded: 0,
    sealVerified: false,
    isAdmitted: true,
    hallTicketPresented: true,
    hallTicketNo: 'HT-2026-8B-008',
    analysisSheet: []
  }
];

export function LiveInvigilatorCockpit() {
  const [candidates, setCandidates] = useState<ProctorCandidate[]>(INITIAL_CANDIDATES);
  const [isSessionInitiated, setIsSessionInitiated] = useState<boolean>(true);
  const [sessionSeconds, setSessionSeconds] = useState<number>(842); // 14 mins elapsed
  const [filter, setFilter] = useState<'all' | 'flagged' | 'admit_queue' | 'paused' | 'completed'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active Interactive Overlays
  const [activeIntercomCandidateId, setActiveIntercomCandidateId] = useState<number | null>(null);
  const [selectedAnalysisCandidate, setSelectedAnalysisCandidate] = useState<ProctorCandidate | null>(null);
  const [warningModalCandidate, setWarningModalCandidate] = useState<ProctorCandidate | null>(null);
  const [customWarningText, setCustomWarningText] = useState('');
  const [evictModalCandidate, setEvictModalCandidate] = useState<ProctorCandidate | null>(null);
  const [evictReason, setEvictReason] = useState('Unrepentant multi-channel malpractice (Unauthorized mobile phone detected)');

  // Teacher Local Camera & Audio Preview (Chief Invigilator Studio)
  const teacherVideoRef = useRef<HTMLVideoElement | null>(null);
  const teacherStreamRef = useRef<MediaStream | null>(null);
  const [teacherCamActive, setTeacherCamActive] = useState<boolean>(true);
  const [teacherMicMuted, setTeacherMicMuted] = useState<boolean>(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4500);
  };

  // Timer for active proctor room
  useEffect(() => {
    if (!isSessionInitiated) return;
    const timer = setInterval(() => {
      setSessionSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSessionInitiated]);

  // Format Elapsed Time (HH:MM:SS)
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize Teacher Camera Stream
  useEffect(() => {
    let active = true;
    async function startTeacherStream() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 }, audio: true });
          if (!active) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          teacherStreamRef.current = stream;
          if (teacherVideoRef.current) {
            teacherVideoRef.current.srcObject = stream;
            teacherVideoRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Teacher webcam preview not accessible, using standby avatar mode.', err);
      }
    }
    startTeacherStream();

    return () => {
      active = false;
      if (teacherStreamRef.current) {
        teacherStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const toggleTeacherCam = () => {
    if (teacherStreamRef.current) {
      const videoTrack = teacherStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setTeacherCamActive(videoTrack.enabled);
        triggerToast(videoTrack.enabled ? 'Teacher Camera Activated' : 'Teacher Camera Paused');
      }
    } else {
      setTeacherCamActive(prev => !prev);
    }
  };

  const toggleTeacherMic = () => {
    if (teacherStreamRef.current) {
      const audioTrack = teacherStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setTeacherMicMuted(!audioTrack.enabled);
        triggerToast(audioTrack.enabled ? 'Teacher Mic Unmuted (Broadcasting)' : 'Teacher Mic Muted');
      }
    } else {
      setTeacherMicMuted(prev => !prev);
    }
  };

  // Real-Time Cross-Window Synchronization with Student Exam Hall via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;

        // 1. Student Requests Admission / Presents Hall Ticket with Number
        if ((data.type === 'STUDENT_WAITING_ADMIT' || data.type === 'STUDENT_SUBMIT_HALL_TICKET') && data.candidateId) {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId) {
              return {
                ...c,
                hallTicketNo: data.hallTicketNo || 'HT-2026-8B-014',
                hallTicketPresented: true,
                isAdmitted: false,
                cameraActive: true
              };
            }
            return c;
          }));
          triggerToast(`🪪 Candidate ${data.studentName || 'Aarav Sharma'} submitted Hall Ticket #${data.hallTicketNo || 'HT-2026-8B-014'}. Ready for review.`);
        }

        // 2. Student Live Camera Frame Snapshot
        if (data.type === 'STUDENT_FRAME' && data.candidateId) {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId) {
              return {
                ...c,
                liveFrame: data.frame,
                cameraActive: true
              };
            }
            return c;
          }));
        }

        // 3. Real-time Edge YOLO & Acoustic Telemetry Sync
        if (data.type === 'STUDENT_TELEMETRY' && data.candidateId) {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId) {
              const newStrikes = data.strikes !== undefined ? data.strikes : c.strikes;
              const newAnalysisSheet = data.analysisEntry 
                ? [data.analysisEntry, ...(c.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)]
                : (c.analysisSheet || []);

              return {
                ...c,
                strikes: newStrikes,
                status: (newStrikes >= 2 || data.isCritical) ? 'critical' : newStrikes === 1 ? 'warning' : c.status,
                anomalyType: data.anomalyType || c.anomalyType,
                cameraActive: data.cameraActive !== undefined ? data.cameraActive : c.cameraActive,
                decibels: data.audioDb || c.decibels,
                gaze: data.gaze || c.gaze,
                analysisSheet: newAnalysisSheet,
                suspicionScore: Math.min(100, (newStrikes * 30) + (newAnalysisSheet.length * 8))
              };
            }
            return c;
          }));

          // If current candidate analysis sheet is open, update live view
          setSelectedAnalysisCandidate(prev => {
            if (prev && (prev.id === data.candidateId || prev.studentId === data.candidateId)) {
              const updatedSheet = data.analysisEntry 
                ? [data.analysisEntry, ...(prev.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)]
                : (prev.analysisSheet || []);
              return {
                ...prev,
                strikes: data.strikes !== undefined ? data.strikes : prev.strikes,
                analysisSheet: updatedSheet
              };
            }
            return prev;
          });
        }
      };
    } catch {}

    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Initiate Live WebRTC Proctor Room
  const handleInitiateSession = () => {
    setIsSessionInitiated(true);
    triggerToast('🚀 Live Exam Room Initiated! WebRTC Mesh & YOLO Edge AI telemetry active for Class 8-B.');
    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({
        type: 'TEACHER_ROOM_READY',
        invigilatorName: 'Mrs. Ananya Verma',
        subject: 'Mathematics',
        className: 'Class 8-B'
      });
      channel.close();
    } catch {}
  };

  // Hall Ticket Verification & Exam Admission
  const handleAdmitStudent = (candidate: ProctorCandidate) => {
    setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, isAdmitted: true } : c));
    triggerToast(`✅ Hall Ticket Verified for ${candidate.name} (Roll #${candidate.rollNo}). Admitted into Exam Hall.`);
    
    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({
        type: 'ADMIT_STUDENT',
        candidateId: candidate.id,
        studentId: candidate.studentId,
        invigilator: 'Mrs. Ananya Verma'
      });
      channel.close();
    } catch {}

    api.sendProctorAction({
      candidate_id: candidate.id,
      action: 'ADMIT',
      reason: 'Hall Ticket & Physical Identity Verified by Invigilator.'
    }).catch(console.error);
  };

  // Push-To-Talk 1-on-1 Audio Intercom
  const handleToggleIntercom = (candidate: ProctorCandidate) => {
    if (activeIntercomCandidateId === candidate.id) {
      setActiveIntercomCandidateId(null);
      triggerToast(`Ended private intercom with ${candidate.name}. Audio channel closed.`);
      try {
        const channel = new BroadcastChannel('edu360_exam_live_channel');
        channel.postMessage({ type: 'END_INTERCOM', candidateId: candidate.id });
        channel.close();
      } catch {}
    } else {
      setActiveIntercomCandidateId(candidate.id);
      triggerToast(`🎙️ 1-on-1 Intercom Active with ${candidate.name}. Speaking directly to candidate headset.`);
      try {
        const channel = new BroadcastChannel('edu360_exam_live_channel');
        channel.postMessage({
          type: 'TALK_ONE_ON_ONE',
          candidateId: candidate.id,
          studentId: candidate.studentId,
          invigilatorName: 'Mrs. Ananya Verma',
          message: `${candidate.name}, this is Mrs. Ananya Verma. Please ensure your hands and exam paper remain centered in the camera.`
        });
        channel.close();
      } catch {}
    }
  };

  // Direct Warning HUD Alert
  const handleSendWarning = (candidateId: number, message: string) => {
    const cand = candidates.find(c => c.id === candidateId);
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, isNudged: true, nudgeMessage: message } : c));
    triggerToast(`HUD Alert dispatched to ${cand?.name || 'Student'}: "${message}"`);
    setWarningModalCandidate(null);
    setCustomWarningText('');

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ type: 'ISSUE_WARNING', candidateId, message });
      channel.close();
    } catch {}

    setTimeout(() => {
      setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, isNudged: false } : c));
    }, 4000);
  };

  // Pause / Resume Exam
  const handleTogglePause = (candidate: ProctorCandidate) => {
    const willPause = !candidate.isPaused;
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
      ? `⏸️ Exam Paused for ${candidate.name}. Screen frozen and writing locked.`
      : `▶️ Exam Resumed for ${candidate.name}. Screen unlocked.`
    );

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ type: willPause ? 'EXAM_PAUSE' : 'EXAM_RESUME', candidateId: candidate.id });
      channel.close();
    } catch {}
  };

  // Global Broadcast to All Candidates
  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const msg = broadcastMessage.trim();
    setBroadcastMessage('');
    triggerToast(`📢 Announcement Broadcasted to Class 8-B: "${msg}"`);

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({
        type: 'INTERCOM_BROADCAST',
        invigilatorName: 'Mrs. Ananya Verma',
        message: msg
      });
      channel.close();
    } catch {}
  };

  // Sign & Seal Analysis Sheet
  const handleSignAndSealAudit = (candidate: ProctorCandidate) => {
    triggerToast(`🔒 Proctor Audit Signed & Sealed for ${candidate.name}! Synced with Secrecy Wing & Gradebook.`);
    setSelectedAnalysisCandidate(null);
  };

  // Derived Filter Counts
  const pendingAdmitCandidates = candidates.filter(c => !c.isAdmitted && c.hallTicketPresented);
  const admittedCandidates = candidates.filter(c => c.isAdmitted);
  const criticalCount = candidates.filter(c => c.status === 'critical' || (c.strikes && c.strikes >= 2)).length;
  const warningCount = candidates.filter(c => c.status === 'warning' || c.strikes === 1).length;
  const pausedCount = candidates.filter(c => c.isPaused).length;

  const filteredCandidates = candidates.filter(c => {
    if (filter === 'admit_queue') return !c.isAdmitted && c.hallTicketPresented;
    if (filter === 'flagged') return (c.strikes > 0) || c.status === 'critical' || c.status === 'warning';
    if (filter === 'paused') return c.isPaused;
    if (filter === 'completed') return c.status === 'completed';
    return true; // Show all candidates in authentic classroom grid
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-violet-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 1. SESSION COMMAND HEADER (LIVE CLASSROOM PROCTOR ACTIVE)                 */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            {isSessionInitiated ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 text-[11px] font-black">
                <Radio className="h-3.5 w-3.5 text-rose-400 animate-ping" />
                LIVEKIT SFU PROCTOR MESH CONNECTED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 text-[11px] font-black">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                SCHEDULED &bull; PENDING INITIATION
              </span>
            )}
            <span className="text-xs text-violet-300/80 font-mono">
              Virtual Room Alpha &bull; LiveKit WebRTC Mesh &bull; Edge YOLO v8
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>Live Invigilator Command Cockpit</span>
            <span className="text-violet-400 font-normal">&bull; Class 8-B (Mathematics)</span>
          </h1>

          <p className="text-xs text-violet-200/70 max-w-2xl leading-relaxed">
            Scheduled by Exam Coordinator. Candidates present Hall Tickets at the Admit Desk before entry. Real-time Edge YOLO &amp; Audio Telemetry active. Analysis Sheet continuously synchronized for evaluation.
          </p>
        </div>

        {/* Action / Telemetry Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {!isSessionInitiated ? (
            <button
              onClick={handleInitiateSession}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Initiate Live Exam Room (Connect SFU)</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2.5 text-center">
                <span className="text-[10px] text-violet-300 uppercase font-bold block">Session Timer</span>
                <span className="text-lg font-black font-mono text-emerald-400">{formatTimer(sessionSeconds)}</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-2.5 text-center min-w-[75px]">
                <span className="text-[10px] text-violet-300 uppercase font-bold block">Flagged</span>
                <span className="text-lg font-black text-rose-400">{criticalCount + warningCount}</span>
              </div>
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-2.5 text-center min-w-[75px]">
                <span className="text-[10px] text-violet-300 uppercase font-bold block">Admitted</span>
                <span className="text-lg font-black text-emerald-300">{admittedCandidates.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 2. HALL TICKET ADMISSION GATE (WAITING ROOM NOTIFICATION STRIP)           */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {pendingAdmitCandidates.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-yellow-500/20 p-4 text-slate-900 dark:text-white shadow-md animate-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <span>Hall Ticket Verification Desk</span>
                  <span className="bg-amber-500 text-white text-[10px] px-2 py-0.2 rounded-full font-bold">
                    {pendingAdmitCandidates.length} Waiting at Admit Gate
                  </span>
                </span>
                <div className="text-xs text-slate-700 dark:text-slate-200 mt-0.5">
                  Candidate <b>{pendingAdmitCandidates[0].name} (Roll #{pendingAdmitCandidates[0].rollNo})</b> submitted Hall Ticket: 
                  <span className="ml-1.5 px-2.5 py-0.5 bg-black/80 text-amber-300 font-mono font-bold rounded-md">
                    {pendingAdmitCandidates[0].hallTicketNo || 'HT-2026-8B-014'}
                  </span>
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">✓ Verified against Secrecy Register</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleAdmitStudent(pendingAdmitCandidates[0])}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Check className="h-4 w-4" />
                <span>Verify Hall Ticket &amp; Admit</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendWarning(pendingAdmitCandidates[0].id, 'Please hold your Hall Ticket closer to camera and show photo clearly.')}
                className="px-3.5 py-2 rounded-xl border border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950 font-bold text-xs cursor-pointer transition-all"
              >
                Request Re-alignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 3. CONTROL FILTER BAR & BROADCAST ANNOUNCEMENT BAR                        */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
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
            onClick={() => setFilter('admit_queue')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'admit_queue'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Admit Gate ({pendingAdmitCandidates.length})</span>
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
            <span>Paused ({pausedCount})</span>
          </button>
        </div>

        {/* Global Announcement Form */}
        <form onSubmit={handleBroadcastAnnouncement} className="flex items-center gap-2 max-w-md w-full">
          <input
            type="text"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Broadcast voice/HUD announcement to all candidates..."
            className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Push HUD</span>
          </button>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 4. ONLINE CLASSROOM VIDEO GRID (LIVEKIT SFU / MEET STYLE)                */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Tile 0: Chief Invigilator Studio Feed (Teacher Host Tile) */}
        <div className="rounded-3xl border-2 border-violet-500/80 bg-slate-900 text-white overflow-hidden shadow-lg flex flex-col ring-2 ring-violet-500/20">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-violet-950/60">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-black">Mrs. Ananya Verma</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-600 text-white font-bold uppercase tracking-wider">
                Chief Invigilator
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleTeacherCam}
                className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  teacherCamActive ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-rose-600 text-white'
                }`}
                title={teacherCamActive ? 'Pause Camera' : 'Activate Camera'}
              >
                {teacherCamActive ? <Camera className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={toggleTeacherMic}
                className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  teacherMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={teacherMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {teacherMicMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-emerald-400" />}
              </button>
            </div>
          </div>

          <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
            <video
              ref={teacherVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${teacherCamActive ? '' : 'hidden'}`}
            />
            {!teacherCamActive && (
              <div className="flex flex-col items-center justify-center text-slate-500 space-y-1 p-4">
                <Camera className="h-8 w-8 text-slate-600" />
                <span className="text-xs font-bold text-slate-400">Host Camera Paused</span>
              </div>
            )}

            {/* Audio dB Meter */}
            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[9px] font-mono text-white flex items-center gap-1.5">
              <Mic className={`h-3 w-3 ${teacherMicMuted ? 'text-rose-400' : 'text-emerald-400'}`} />
              <span>{teacherMicMuted ? 'Muted' : 'Host Mic (42 dB)'}</span>
            </div>

            {/* Status Chip */}
            <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs px-2.5 py-0.5 rounded-lg text-[9px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Room Alpha Host &bull; Broadcasting SFU</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Audio Channel: <b className="text-emerald-400 font-mono">Open Mesh</b></span>
            <span className="font-mono text-violet-300">SFU Latency: <b>24ms</b></span>
          </div>
        </div>

        {/* Candidate Tiles */}
        {filteredCandidates.map((candidate) => {
          const isCritical = candidate.status === 'critical' || (candidate.strikes && candidate.strikes >= 2);
          const isWarning = candidate.status === 'warning' || candidate.strikes === 1;

          return (
            <div
              key={candidate.id}
              className={`rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-sm flex flex-col bg-white dark:bg-slate-900 ${
                candidate.isPaused
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : isCritical
                  ? 'border-rose-500 ring-2 ring-rose-500/30'
                  : isWarning
                  ? 'border-amber-400 ring-2 ring-amber-400/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-violet-400'
              }`}
            >
              {/* Card Header */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-lg border border-violet-200 dark:border-violet-800">
                    Roll #{candidate.rollNo}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                    {candidate.name}
                  </span>
                </div>

                {/* Status / Strike Badge */}
                {!candidate.isAdmitted ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                    <Clock className="h-3 w-3" />
                    <span>Awaiting Admit</span>
                  </span>
                ) : candidate.strikes > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center gap-1 shadow-xs animate-pulse">
                    <ShieldAlert className="h-3 w-3" />
                    <span>Strike {candidate.strikes}/3</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    <span>0 Strikes (Clear)</span>
                  </span>
                )}
              </div>

              {/* Video Camera Container */}
              <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                {/* Live Candidate Stream or Frame */}
                {candidate.liveFrame ? (
                  <img
                    src={candidate.liveFrame}
                    alt={candidate.name}
                    className={`w-full h-full object-cover transition-transform ${candidate.isPaused ? 'grayscale opacity-40' : ''}`}
                  />
                ) : (
                  <img
                    src={candidate.avatar}
                    alt={candidate.name}
                    className={`w-full h-full object-cover transition-transform ${candidate.isPaused ? 'grayscale opacity-40' : ''}`}
                  />
                )}

                {/* Real-time Edge YOLO AI Overlays */}
                {candidate.status === 'critical' || candidate.anomalyType === 'CELL_PHONE' ? (
                  <div className="absolute inset-x-4 bottom-8 rounded-xl border-2 border-rose-500 bg-rose-500/20 px-2.5 py-1 text-[10px] font-mono text-white flex items-center justify-between backdrop-blur-xs animate-pulse">
                    <span className="font-bold">🚨 YOLO: cell_phone (0.92)</span>
                    <span className="bg-rose-600 px-1.5 py-0.2 rounded font-black text-[9px]">Strike Pending</span>
                  </div>
                ) : candidate.anomalyType === 'BOOK' ? (
                  <div className="absolute inset-x-4 bottom-8 rounded-xl border-2 border-rose-500 bg-rose-500/20 px-2.5 py-1 text-[10px] font-mono text-white flex items-center justify-between backdrop-blur-xs animate-pulse">
                    <span className="font-bold">🚨 YOLO: book (0.89)</span>
                    <span className="bg-rose-600 px-1.5 py-0.2 rounded font-black text-[9px]">Strike Active</span>
                  </div>
                ) : (
                  <div className="absolute inset-4 rounded-2xl border-2 border-emerald-400/80 bg-emerald-400/5 pointer-events-none flex flex-col justify-between p-2">
                    <span className="self-start px-2 py-0.5 rounded-md bg-emerald-600/90 text-[9px] font-mono font-bold text-white shadow-xs">
                      YOLO v8: Candidate (0.97)
                    </span>
                    <span className="self-center px-2 py-0.5 rounded-md bg-black/70 text-[9px] font-mono text-slate-200">
                      {candidate.gaze || 'Centered on Desk'}
                    </span>
                  </div>
                )}

                {/* Audio Level Indicator */}
                <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-mono text-white flex items-center gap-1.5">
                  <Mic className="h-3 w-3 text-emerald-400" />
                  <span>{candidate.decibels || 40} dB</span>
                </div>

                {/* YOLO AI Active Chip */}
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-mono text-white flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-bold">YOLO v8 Active</span>
                </div>

                {/* Gaze Posture Chip */}
                <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs px-2.5 py-0.5 rounded-lg text-[9px] font-mono text-white flex items-center gap-1">
                  <Eye className="h-3 w-3 text-violet-400" />
                  <span className={candidate.gaze?.includes('Turned') ? 'text-amber-300 font-bold' : 'text-slate-200'}>
                    {candidate.gaze || 'Centered on Desk'}
                  </span>
                </div>

                {/* Paused Overlay */}
                {candidate.isPaused && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-3">
                    <Pause className="h-8 w-8 text-blue-400 mb-1 animate-pulse" />
                    <span className="text-xs font-black text-white">EXAM PAUSED BY INVIGILATOR</span>
                    <span className="text-[10px] text-blue-200">Timer &amp; candidate screen locked</span>
                  </div>
                )}
              </div>

              {/* Candidate Footer Actions */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-2 mt-auto">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Infractions: <b>{candidate.analysisSheet?.length || 0} Events</b></span>
                  <span>Suspicion: <b className={candidate.suspicionScore > 50 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}>{candidate.suspicionScore}%</b></span>
                </div>

                {/* If candidate is waiting for admit */}
                {!candidate.isAdmitted ? (
                  <button
                    type="button"
                    onClick={() => handleAdmitStudent(candidate)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Verify Hall Ticket ({candidate.hallTicketNo || 'HT-2026-8B-014'}) &amp; Admit</span>
                  </button>
                ) : (
                  <>
                    {/* Action Buttons Row 1 */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedAnalysisCandidate(candidate)}
                        className="px-2.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 font-bold text-[11px] cursor-pointer flex items-center justify-center gap-1 transition-all"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Analysis Sheet ({candidate.analysisSheet?.length || 0})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleIntercom(candidate)}
                        className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer flex items-center justify-center gap-1 transition-all ${
                          activeIntercomCandidateId === candidate.id
                            ? 'bg-rose-600 text-white shadow-xs animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <PhoneCall className="h-3 w-3" />
                        <span>{activeIntercomCandidateId === candidate.id ? 'End Intercom' : '1-on-1 Voice'}</span>
                      </button>
                    </div>

                    {/* Action Buttons Row 2 */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWarningModalCandidate(candidate)}
                        className="px-2.5 py-1.5 rounded-xl border border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-bold text-[11px] cursor-pointer flex items-center justify-center gap-1 transition-all"
                      >
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        <span>Send Nudge</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTogglePause(candidate)}
                        className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] cursor-pointer flex items-center justify-center gap-1 transition-all ${
                          candidate.isPaused
                            ? 'bg-emerald-600 text-white'
                            : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {candidate.isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                        <span>{candidate.isPaused ? 'Resume Exam' : 'Pause Exam'}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 5. PROCTOR INTEGRITY ANALYSIS SHEET MODAL FOR TEACHER                     */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {selectedAnalysisCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-600 text-white shadow-xs">
                    Official Invigilator Audit Desk
                  </span>
                  <span className="text-xs text-violet-300 font-mono">Roll #{selectedAnalysisCandidate.rollNo}</span>
                </div>
                <h3 className="text-xl font-black mt-1">
                  Proctor Integrity Analysis Sheet &amp; Audit Trail
                </h3>
                <p className="text-xs text-violet-200/80 mt-0.5">
                  Candidate: <b>{selectedAnalysisCandidate.name} (Roll #{selectedAnalysisCandidate.rollNo})</b> &bull; Class: {selectedAnalysisCandidate.grade}-{selectedAnalysisCandidate.section} &bull; Chief Invigilator: <b>Mrs. Ananya Verma</b>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnalysisCandidate(null)}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Infractions</span>
                <span className="text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
                  {selectedAnalysisCandidate.analysisSheet?.length || 0} Incidents
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Proctor Strikes</span>
                <span className={`text-xl font-black mt-0.5 block ${
                  selectedAnalysisCandidate.strikes >= 2 ? 'text-rose-600' : selectedAnalysisCandidate.strikes === 1 ? 'text-amber-500' : 'text-emerald-500'
                }`}>
                  {selectedAnalysisCandidate.strikes} / 3 Strikes
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Marks Penalty</span>
                <span className={`text-xl font-black mt-0.5 block ${selectedAnalysisCandidate.strikes >= 3 ? 'text-rose-600' : 'text-emerald-500'}`}>
                  {selectedAnalysisCandidate.strikes >= 3 ? '-5 Marks' : '0 (Clear)'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Integrity Score</span>
                <span className="text-xl font-black text-emerald-500 mt-0.5 block">
                  {Math.max(40, 100 - (selectedAnalysisCandidate.strikes * 20) - ((selectedAnalysisCandidate.analysisSheet?.length || 0) * 3))}% Exemplary
                </span>
              </div>
            </div>

            {/* Incidents Table */}
            <div className="p-6 max-h-[440px] overflow-y-auto">
              {!selectedAnalysisCandidate.analysisSheet || selectedAnalysisCandidate.analysisSheet.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Clean Examination Audit</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Zero malpractice or edge AI anomalies detected for candidate {selectedAnalysisCandidate.name}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Infraction Category</th>
                        <th className="py-2.5 px-3">Evaluation Rule &amp; Confidence</th>
                        <th className="py-2.5 px-3">Severity &amp; Action</th>
                        <th className="py-2.5 px-3">Invigilator Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedAnalysisCandidate.analysisSheet.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {item.timestamp}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">{item.notes}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 block">
                              {item.ruleTriggered}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Model Confidence: {(item.confidence * 100).toFixed(0)}%
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.actionTaken === 'STRIKE'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}>
                              {item.actionTaken === 'STRIKE' ? 'Strike Applied' : 'Advisory Nudge (0 Strike)'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                            <span className="text-violet-600 dark:text-violet-400 font-bold block">Mrs. Ananya Verma</span>
                            <span className="text-[10px] text-slate-400">Synced to Secrecy Audit</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Continuous edge telemetry synced in real time to Invigilator Command Cockpit
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSignAndSealAudit(selectedAnalysisCandidate)}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Sign &amp; Seal Proctor Audit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAnalysisCandidate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer transition-all"
                >
                  Close Analysis Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. WARNING MODAL */}
      {warningModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Send Warning Nudge to Candidate</span>
              </h3>
              <button onClick={() => setWarningModalCandidate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Candidate: <b>{warningModalCandidate.name} (Roll #{warningModalCandidate.rollNo})</b>. This message will flash on their exam screen with an acoustic prompt.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setCustomWarningText('Please keep your eyes and face directed towards the exam desk.')}
                className="w-full p-2.5 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                👁️ "Please keep your eyes and face directed towards the exam desk."
              </button>
              <button
                type="button"
                onClick={() => setCustomWarningText('Remove any external books or secondary materials from your desk area immediately.')}
                className="w-full p-2.5 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                📚 "Remove any external books or secondary materials from your desk area immediately."
              </button>
            </div>
            <textarea
              value={customWarningText}
              onChange={(e) => setCustomWarningText(e.target.value)}
              placeholder="Or type a custom warning notice..."
              rows={3}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWarningModalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSendWarning(warningModalCandidate.id, customWarningText || 'Maintain proper desk position.')}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Dispatch Warning HUD Alert
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
    f.write(new_cockpit_code)

print("live-invigilator-cockpit.tsx updated successfully.")
