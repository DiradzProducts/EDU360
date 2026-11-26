'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Room, RoomEvent, VideoPresets } from 'livekit-client';
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
  BadgeAlert,
  LayoutGrid,
  Columns,
  Minimize2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  PowerOff,
  WifiOff
} from 'lucide-react';
import { TeacherPdfScriptViewerModal, AnswerScriptSubmission } from '@/components/exam/teacher-pdf-script-viewer-modal';

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
  avatar?: string;
  liveFrame?: string;
  liveStream?: MediaStream;
  status: 'normal' | 'warning' | 'critical' | 'uploading' | 'completed' | 'paused' | 'disqualified' | 'standby';
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
  sealCode?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfUploadedAt?: string;
  analysisSheet: ProctorAnalysisEntry[];
}

// 40 Authentic Student Workstation Roster for Class 8-B
// NO dummy stock photos. Pure student identities with live video streams for joined candidates
const ROSTER_SEED_STUDENTS = [
  { id: 1, name: 'Aarav Sharma', rollNo: '14' },
  { id: 2, name: 'Diya Patel', rollNo: '01' },
  { id: 3, name: 'Rohan Verma', rollNo: '02' },
  { id: 4, name: 'Ananya Iyer', rollNo: '03' },
  { id: 5, name: 'Ishaan Mukherjee', rollNo: '04' },
  { id: 6, name: 'Meera Nambiar', rollNo: '05' },
  { id: 7, name: 'Kabir Joshi', rollNo: '06' },
  { id: 8, name: 'Tanya Sengupta', rollNo: '07' },
  { id: 9, name: 'Vivaan Reddy', rollNo: '08' },
  { id: 10, name: 'Riya Kulkarni', rollNo: '09' },
  { id: 11, name: 'Aditya Kapoor', rollNo: '10' },
  { id: 12, name: 'Sneha Nair', rollNo: '11' },
  { id: 13, name: 'Yash Singhania', rollNo: '12' },
  { id: 14, name: 'Pooja Deshmukh', rollNo: '13' },
  { id: 15, name: 'Siddharth Menon', rollNo: '15' },
  { id: 16, name: 'Kavya Bhat', rollNo: '16' },
  { id: 17, name: 'Arjun Sethi', rollNo: '17' },
  { id: 18, name: 'Neha Rao', rollNo: '18' },
  { id: 19, name: 'Aryan Choudhary', rollNo: '19' },
  { id: 20, name: 'Tara Saxena', rollNo: '20' },
  { id: 21, name: 'Devansh Gupta', rollNo: '21' },
  { id: 22, name: 'Anika Sen', rollNo: '22' },
  { id: 23, name: 'Pranav Hegde', rollNo: '23' },
  { id: 24, name: 'Ishita Roy', rollNo: '24' },
  { id: 25, name: 'Varun Pillai', rollNo: '25' },
  { id: 26, name: 'Shruti Bose', rollNo: '26' },
  { id: 27, name: 'Kunal Mittal', rollNo: '27' },
  { id: 28, name: 'Bhavya Aggarwal', rollNo: '28' },
  { id: 29, name: 'Samar Chauhan', rollNo: '29' },
  { id: 30, name: 'Shreya Das', rollNo: '30' },
  { id: 31, name: 'Manav Pandey', rollNo: '31' },
  { id: 32, name: 'Kriti Malhotra', rollNo: '32' },
  { id: 33, name: 'Harshit Bansal', rollNo: '33' },
  { id: 34, name: 'Simran Kaur', rollNo: '34' },
  { id: 35, name: 'Dhruv Khanna', rollNo: '35' },
  { id: 36, name: 'Tanvi Chawla', rollNo: '36' },
  { id: 37, name: 'Nikhil Mehta', rollNo: '37' },
  { id: 38, name: 'Avani Mishra', rollNo: '38' },
  { id: 39, name: 'Rishabh Jain', rollNo: '39' },
  { id: 40, name: 'Zoya Khan', rollNo: '40' },
];

const INITIAL_CANDIDATES: ProctorCandidate[] = ROSTER_SEED_STUDENTS.map(s => {
  return {
    id: s.id,
    studentId: s.id,
    name: s.name,
    rollNo: s.rollNo,
    grade: 'Class 8',
    section: 'B',
    subject: 'Mathematics',
    avatar: '',
    status: 'standby',
    suspicionScore: 0,
    strikes: 0,
    tabSwitches: 0,
    cameraActive: false,
    isPaused: false,
    isDisqualified: false,
    scriptPagesUploaded: 0,
    sealVerified: false,
    isAdmitted: false,
    hallTicketPresented: false,
    hallTicketNo: `HT-2026-8B-${s.rollNo.padStart(3, '0')}`,
    analysisSheet: [],
    decibels: 0,
    gaze: 'Standby',
  };
});

export interface LiveInvigilatorCockpitProps {
  roomId?: string;
  roomName?: string;
  className?: string;
  section?: string;
}

export function LiveInvigilatorCockpit({
  roomId,
  roomName,
  className,
  section
}: LiveInvigilatorCockpitProps = {}) {
  const effectiveRoomId = roomName || roomId || (className ? `exam-room-${className.toLowerCase().replace(/[^a-z0-9]/g, '')}${section ? `-${section.toLowerCase().replace(/[^a-z0-9]/g, '')}` : ''}` : 'exam-room-class8b');
  const [candidates, setCandidates] = useState<ProctorCandidate[]>(INITIAL_CANDIDATES);
  const [spotlightCandidateId, setSpotlightCandidateId] = useState<number>(1);
  const [isSessionInitiated, setIsSessionInitiated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('edu360_exam_commenced') === 'true';
    }
    return false;
  });
  const [sessionSeconds, setSessionSeconds] = useState<number>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('edu360_exam_commenced') === 'true') {
      return 120; // 2 mins elapsed if already started
    }
    return 0;
  });
  const [filter, setFilter] = useState<'all' | 'flagged' | 'admit_queue' | 'paused' | 'completed' | 'disqualified'>('all');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Real LiveKit SFU Client Integration
  const liveKitRoomRef = useRef<Room | null>(null);
  const [liveKitRoomStatus, setLiveKitRoomStatus] = useState<'connecting' | 'connected' | 'mesh_active'>('connecting');
  const [liveKitRoomData, setLiveKitRoomData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    let roomInstance: Room | null = null;

    try {
      roomInstance = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h360.resolution,
        },
      });
      liveKitRoomRef.current = roomInstance;

      roomInstance.on(RoomEvent.Connected, () => {
        if (!isMounted) return;
        setLiveKitRoomStatus('connected');
        console.log('✅ LiveKit SFU Room Connected:', roomInstance?.name);
      });

      roomInstance.on(RoomEvent.Disconnected, () => {
        if (!isMounted) return;
        setLiveKitRoomStatus('mesh_active');
      });

      roomInstance.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log('👤 LiveKit Participant Connected:', participant.identity);
        setCandidates(prev => prev.map(c => {
          if (participant.identity.toLowerCase().includes('aarav') || participant.identity.includes('14') || c.rollNo === '14') {
            return {
              ...c,
              cameraActive: true,
              status: c.isPaused ? 'critical' : 'normal',
              isAdmitted: true
            };
          }
          return c;
        }));
      });

      roomInstance.on(RoomEvent.TrackSubscribed, (track: any, publication: any, participant: any) => {
        console.log('📹 LiveKit Track Subscribed:', track.kind, participant.identity);
        if (track.kind === 'video' && track.mediaStreamTrack) {
          const stream = new MediaStream([track.mediaStreamTrack]);
          setCandidates(prev => prev.map(c => {
            if (participant.identity.toLowerCase().includes('aarav') || participant.identity.includes('14') || c.rollNo === '14') {
              return {
                ...c,
                liveStream: stream,
                cameraActive: true,
                status: c.isPaused ? 'critical' : 'normal',
                isAdmitted: true
              };
            }
            return c;
          }));
        }
      });

      roomInstance.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log('👤 LiveKit Participant Disconnected:', participant.identity);
        setCandidates(prev => prev.map(c => {
          if (participant.identity.toLowerCase().includes('aarav') || participant.identity.includes('14') || c.rollNo === '14') {
            return {
              ...c,
              cameraActive: false,
              liveStream: undefined,
              liveFrame: undefined,
              status: 'standby'
            };
          }
          return c;
        }));
      });
    } catch (err) {
      console.warn('LiveKit client initialization note:', err);
    }

    api.getLiveKitToken({
      room_name: effectiveRoomId,
      participant_name: 'Mrs. Ananya Verma',
      participant_identity: 'invigilator-ananya-verma',
      role: 'INVIGILATOR'
    }).then(async (res) => {
      if (!isMounted) return;
      if (res && res.token && res.server_url && roomInstance) {
        setLiveKitRoomData(res);
        try {
          await roomInstance.connect(res.server_url, res.token);
          if (isMounted) setLiveKitRoomStatus('connected');
        } catch (connErr) {
          console.warn('LiveKit cloud connection notice (active WebRTC SFU Mesh):', connErr);
          if (isMounted) setLiveKitRoomStatus('mesh_active');
        }
      } else {
        if (isMounted) setLiveKitRoomStatus('mesh_active');
      }
    }).catch(() => {
      if (isMounted) setLiveKitRoomStatus('mesh_active');
    });

    return () => {
      isMounted = false;
      if (roomInstance) {
        try { roomInstance.disconnect(); } catch {}
      }
    };
  }, []);

  const lastAlertNonceRef = useRef<any>(0);

  const playMalpracticeChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.16, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {}
  };

  const [activeMalpracticeAlert, setActiveMalpracticeAlert] = useState<{
    candidateId: number;
    studentName: string;
    rollNo: string;
    className: string;
    malpracticeType: string;
    title: string;
    ruleTriggered: string;
    confidence: number;
    actionTaken: string;
    strikes: number;
    timestamp: string;
    analysisEntry?: any;
  } | null>(null);

  // Active Interactive Overlays
  const [activeIntercomCandidateId, setActiveIntercomCandidateId] = useState<number | null>(null);
  const [selectedAnalysisCandidate, setSelectedAnalysisCandidate] = useState<ProctorCandidate | null>(null);
  const [selectedPdfSubmission, setSelectedPdfSubmission] = useState<AnswerScriptSubmission | null>(null);
  const [warningModalCandidate, setWarningModalCandidate] = useState<ProctorCandidate | null>(null);
  const [customWarningText, setCustomWarningText] = useState('');
  const [evictModalCandidate, setEvictModalCandidate] = useState<ProctorCandidate | null>(null);
  const [evictReason, setEvictReason] = useState('Unrepentant multi-channel malpractice detected by proctoring engine');
  const [activeSuspendedIndex, setActiveSuspendedIndex] = useState<number>(0);

  // Active queue of candidates suspended with 3 strikes or paused awaiting teacher review
  const suspendedQueue = useMemo(() => {
    return candidates.filter(c => !c.isDisqualified && (c.strikes >= 3 || c.isPaused));
  }, [candidates]);

  // Keep index clamped within bounds as candidates are approved or removed
  useEffect(() => {
    if (activeSuspendedIndex >= suspendedQueue.length && suspendedQueue.length > 0) {
      setActiveSuspendedIndex(Math.max(0, suspendedQueue.length - 1));
    }
  }, [suspendedQueue.length, activeSuspendedIndex]);

  // Teacher Local Camera & Audio Preview (Chief Invigilator Studio)
  const teacherVideoRef = useRef<HTMLVideoElement | null>(null);
  const teacherStreamRef = useRef<MediaStream | null>(null);
  const [teacherCamActive, setTeacherCamActive] = useState<boolean>(true);
  const [teacherMicMuted, setTeacherMicMuted] = useState<boolean>(false);
  const [isEndExamConfirmOpen, setIsEndExamConfirmOpen] = useState<boolean>(false);
  const [isExamConcludedForEveryone, setIsExamConcludedForEveryone] = useState<boolean>(false);
  const surveillanceWsRef = useRef<WebSocket | null>(null);

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

  // Guaranteed multi-channel sync: Listen to localStorage & storage events from student terminal
  useEffect(() => {
    const syncStatusFromStorage = () => {
      try {
        const storedFrame = localStorage.getItem('edu360_student_live_frame');
        const isStudentJoined = localStorage.getItem('edu360_student_joined') === 'true';
        const isHardSuspended = localStorage.getItem('edu360_student_hard_suspended') === 'true';

        // 1. Sync candidate status & analysis sheet
        const raw = localStorage.getItem('edu360_candidate_14_status');
        if (raw || storedFrame || isStudentJoined || isHardSuspended) {
          let strikes = isHardSuspended ? 3 : 0;
          let isPaused = isHardSuspended;
          let updatedSheet: any = null;

          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed) {
                strikes = Math.max(strikes, parsed.strikes !== undefined ? parsed.strikes : 0);
                isPaused = isPaused || (parsed.isPaused !== undefined ? parsed.isPaused : (strikes >= 3));
                updatedSheet = (parsed.analysisSheet && parsed.analysisSheet.length > 0) ? parsed.analysisSheet : null;
              }
            } catch {}
          }

          setCandidates(prev => {
            let changed = false;
            const next = prev.map(c => {
              if (c.rollNo === '14' || c.id === 1) {
                const sheet = updatedSheet || c.analysisSheet;
                const liveFrame = storedFrame || c.liveFrame;
                const cameraActive = isStudentJoined || Boolean(storedFrame) || c.cameraActive;
                const status = (isPaused || strikes >= 3) ? ('critical' as const) : (strikes >= 2 ? ('critical' as const) : strikes === 1 ? ('warning' as const) : cameraActive ? ('normal' as const) : ('standby' as const));

                if (c.strikes !== strikes || c.isPaused !== isPaused || c.analysisSheet.length !== sheet.length || c.liveFrame !== liveFrame || c.cameraActive !== cameraActive || c.status !== status) {
                  changed = true;
                  return {
                    ...c,
                    strikes,
                    isPaused,
                    liveFrame,
                    cameraActive,
                    status,
                    suspicionScore: Math.min(100, strikes * 33 + (sheet?.length || 0) * 8),
                    analysisSheet: sheet
                  };
                }
              }
              return c;
            });

            if (changed) {
              const candidate14 = next.find(c => c.rollNo === '14' || c.id === 1);
              if (candidate14 && (candidate14.isPaused || candidate14.strikes >= 3)) {
                setSpotlightCandidateId(candidate14.id);
              }
            }

            return changed ? next : prev;
          });

            // Keep currently open Analysis Sheet modal updated in real-time
            setSelectedAnalysisCandidate(curr => {
              if (curr && (curr.rollNo === '14' || curr.id === 1)) {
                const sheet = updatedSheet || curr.analysisSheet;
                if (curr.strikes !== strikes || curr.isPaused !== isPaused || curr.analysisSheet.length !== sheet.length) {
                  return {
                    ...curr,
                    strikes,
                    isPaused,
                    status: isPaused ? 'critical' : (strikes >= 2 ? 'critical' : strikes === 1 ? 'warning' : 'normal'),
                    suspicionScore: Math.min(100, strikes * 33 + (sheet?.length || 0) * 8),
                    analysisSheet: sheet
                  };
                }
              }
              return curr;
            });
          }

        // 2. Sync Real-Time Malpractice Alert for Left Corner Popup & Attention Chime
        const alertRaw = localStorage.getItem('edu360_latest_malpractice_alert');
        if (alertRaw) {
          const alertData = JSON.parse(alertRaw);
          const nonce = alertData.nonce || alertData.timestamp;
          if (alertData && nonce && lastAlertNonceRef.current !== nonce) {
            lastAlertNonceRef.current = nonce;
            setActiveMalpracticeAlert(alertData);
            if (alertData.candidateId) {
              setSpotlightCandidateId(alertData.candidateId);
            }
            playMalpracticeChime();
          }
        }
      } catch {}
    };

    syncStatusFromStorage();
    window.addEventListener('storage', syncStatusFromStorage);
    const interval = setInterval(syncStatusFromStorage, 400);

    return () => {
      window.removeEventListener('storage', syncStatusFromStorage);
      clearInterval(interval);
    };
  }, []);

  // Active Periodic Candidate Sync with Central Backend Database (Cross-Browser & Multi-Device Polling)
  useEffect(() => {
    const pollRemoteCandidates = async () => {
      try {
        const res = await api.getExamCandidates();
        if (res && res.success && res.candidates && res.candidates.length > 0) {
          setCandidates(prev => {
            let changed = false;
            const updated = prev.map(c => {
              // Match strictly by rollNo to avoid mismatched auto-increment database primary keys
              const remote = res.candidates.find((r: any) => r.rollNo === c.rollNo);
              if (remote) {
                const isCandidate14 = c.rollNo === '14' || c.id === 1;
                // If candidate 14 is active locally, DO NOT overwrite with empty/stale DB zeros!
                const strikes = isCandidate14 ? Math.max(c.strikes, (remote.strikes || 0)) : (remote.strikes !== undefined ? remote.strikes : c.strikes);
                const isPaused = isCandidate14 ? (c.isPaused || remote.isPaused || strikes >= 3) : (remote.isPaused !== undefined ? remote.isPaused : (strikes >= 3));
                const suspicionScore = isCandidate14 ? Math.max(c.suspicionScore, (remote.suspicionScore || 0)) : (remote.suspicionScore !== undefined ? remote.suspicionScore : c.suspicionScore);
                const cameraActive = isCandidate14 ? Boolean(c.cameraActive || c.liveFrame || c.liveStream) : Boolean(c.liveStream || c.liveFrame);
                const status = (isPaused || strikes >= 3) ? ('critical' as const) : (strikes >= 2 ? ('critical' as const) : strikes === 1 ? ('warning' as const) : cameraActive ? ('normal' as const) : ('standby' as const));

                if (c.strikes !== strikes || c.isPaused !== isPaused || c.suspicionScore !== suspicionScore || c.status !== status || c.cameraActive !== cameraActive) {
                  changed = true;
                  return {
                    ...c,
                    strikes,
                    isPaused,
                    suspicionScore,
                    cameraActive,
                    status
                  };
                }
              }
              return c;
            });

            return changed ? updated : prev;
          });
        }
      } catch {}
    };

    const interval = setInterval(pollRemoteCandidates, 2500);
    pollRemoteCandidates();
    return () => clearInterval(interval);
  }, []);

  // 1. Initialize Teacher Camera Stream
  useEffect(() => {
    let active = true;
    async function startTeacherStream() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          let stream: MediaStream | null = null;
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360, facingMode: 'user' }, audio: false });
          } catch {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }
          if (!active || !stream) return;
          teacherStreamRef.current = stream;
          if (teacherVideoRef.current) {
            teacherVideoRef.current.srcObject = stream;
            teacherVideoRef.current.play().catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Teacher webcam preview not accessible, using standby studio mode.', err);
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

  // 2. Real-time active candidate frame synchronization
  useEffect(() => {
    // Only ping for live frame if an active student terminal is open
    try {
      const pingChannel = new BroadcastChannel('edu360_exam_live_channel');
      pingChannel.postMessage({ type: 'REQUEST_STUDENT_FRAME' });
      // Keep channel open or let browser manage
    } catch {}
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
        triggerToast(audioTrack.enabled ? 'Teacher Mic Broadcasting' : 'Teacher Mic Muted');
      }
    } else {
      setTeacherMicMuted(prev => !prev);
    }
  };

  // Multi-Device WebSocket Surveillance Relay
  useEffect(() => {
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const port = '8000';
      const wsUrl = `${protocol}//${host}:${port}/api/exams/ws/surveillance/${effectiveRoomId}`;
      ws = new WebSocket(wsUrl);
      surveillanceWsRef.current = ws;

      ws.onopen = () => {
        console.log('🌐 Invigilator Surveillance WebSocket Connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data) return;

          if (data.type === 'STUDENT_FRAME' && data.frame) {
            setCandidates(prev => prev.map(c => {
              if (c.rollNo === '14' || c.id === 1) {
                return {
                  ...c,
                  liveFrame: data.frame,
                  cameraActive: true,
                  status: c.isPaused ? 'critical' : 'normal',
                  isAdmitted: true
                };
              }
              return c;
            }));
          } else if (data.type === 'STUDENT_JOINED') {
            setCandidates(prev => prev.map(c => {
              if (c.rollNo === '14' || c.id === 1) {
                return {
                  ...c,
                  isAdmitted: true,
                  hallTicketPresented: true,
                  cameraActive: true,
                  status: 'normal'
                };
              }
              return c;
            }));
            triggerToast(`✅ Candidate ${data.studentName || 'Aarav Sharma'} joined live examination room.`);
          } else if (data.type === 'STUDENT_LEFT') {
            setCandidates(prev => prev.map(c => {
              if (c.rollNo === '14' || c.id === 1) {
                return {
                  ...c,
                  status: 'standby',
                  cameraActive: false,
                  isAdmitted: false,
                  liveFrame: undefined,
                  gaze: 'Standby',
                  decibels: 0
                };
              }
              return c;
            }));
            triggerToast(`Candidate ${data.studentName || 'Aarav Sharma'} exited the examination hall.`);
          } else if (data.type === 'MALPRACTICE_ALERT') {
            setActiveMalpracticeAlert(data);
            if (data.candidateId) {
              setSpotlightCandidateId(data.candidateId);
            }
            playMalpracticeChime();

            // Sync candidate analysis sheet & strikes immediately
            setCandidates(prev => prev.map(c => {
              if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo || c.rollNo === '14' || c.id === 1) {
                const newStrikes = data.strikes !== undefined ? data.strikes : c.strikes;
                const isNowPaused = newStrikes >= 3 || data.isPaused || c.isPaused;
                const newAnalysisSheet = data.allEntries 
                  ? data.allEntries
                  : (data.analysisEntry ? [data.analysisEntry, ...(c.analysisSheet || []).filter((item: any) => item.id !== data.analysisEntry.id)] : c.analysisSheet);
                return {
                  ...c,
                  strikes: newStrikes,
                  isPaused: isNowPaused,
                  status: isNowPaused ? ('critical' as const) : (newStrikes >= 2 ? ('critical' as const) : newStrikes === 1 ? ('warning' as const) : ('normal' as const)),
                  suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                  analysisSheet: newAnalysisSheet
                };
              }
              return c;
            }));

            setSelectedAnalysisCandidate(curr => {
              if (curr && (curr.id === data.candidateId || curr.studentId === data.candidateId || curr.rollNo === data.rollNo || curr.rollNo === '14' || curr.id === 1)) {
                const newStrikes = data.strikes !== undefined ? data.strikes : curr.strikes;
                const isNowPaused = newStrikes >= 3 || data.isPaused || curr.isPaused;
                const newAnalysisSheet = data.allEntries 
                  ? data.allEntries
                  : (data.analysisEntry ? [data.analysisEntry, ...(curr.analysisSheet || []).filter((item: any) => item.id !== data.analysisEntry.id)] : curr.analysisSheet);
                return {
                  ...curr,
                  strikes: newStrikes,
                  isPaused: isNowPaused,
                  status: isNowPaused ? 'critical' : (newStrikes >= 2 ? 'critical' : newStrikes === 1 ? 'warning' : 'normal'),
                  suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                  analysisSheet: newAnalysisSheet
                };
              }
              return curr;
            });
          } else if (data.type === 'DISQUALIFICATION_REVIEW_REQUESTED') {
            setActiveMalpracticeAlert(data);
            if (data.candidateId) {
              setSpotlightCandidateId(data.candidateId);
            }
            playMalpracticeChime();

            const inquiryEntry: ProctorAnalysisEntry = {
              id: `inquiry-ws-${Date.now()}`,
              timestamp: data.timestamp || new Date().toLocaleTimeString(),
              category: '3-STRIKES SUSPENSION',
              title: data.title || '🚨 Examination Suspended (3 Strikes Limit Exceeded)',
              ruleTriggered: data.ruleTriggered || 'Workstation Locked • Awaiting Chief Invigilator Inquiry & Decision',
              confidence: 1.0,
              actionTaken: 'STRIKE',
              status: 'FLAGGED',
              notes: `Candidate ${data.studentName || 'candidate'} (Roll #${data.rollNo || '14'}) has accumulated 3 strikes. Exam is locked awaiting invigilator review.`
            };

            setCandidates(prev => {
              const updated = prev.map(c => {
                if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo || c.rollNo === '14' || c.id === 1) {
                  const combinedSheet = [
                    inquiryEntry,
                    ...(data.analysisEntry ? [data.analysisEntry] : []),
                    ...(c.analysisSheet || []).filter(e => e.id !== data.analysisEntry?.id && e.id !== inquiryEntry.id)
                  ];
                  return {
                    ...c,
                    strikes: 3,
                    isPaused: true,
                    status: 'critical' as const,
                    suspicionScore: 100,
                    analysisSheet: combinedSheet
                  };
                }
                return c;
              });

              // Focus on this newly suspended candidate in the left series queue
              const suspendedList = updated.filter(c => !c.isDisqualified && (c.strikes >= 3 || c.isPaused));
              const newIdx = suspendedList.findIndex(c => c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo || c.rollNo === '14');
              if (newIdx !== -1) {
                setActiveSuspendedIndex(newIdx);
              }

              return updated;
            });
          } else if (data.type === 'STUDENT_TELEMETRY') {
            setCandidates(prev => prev.map(c => {
              if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo || c.rollNo === '14' || c.id === 1) {
                const s = data.strikes !== undefined ? data.strikes : c.strikes;
                const p = data.isPaused !== undefined ? data.isPaused : (s >= 3);
                return {
                  ...c,
                  strikes: s,
                  isPaused: p,
                  gaze: data.gaze || c.gaze,
                  decibels: data.audioDb !== undefined ? data.audioDb : c.decibels,
                  status: p ? 'critical' : (s >= 2 ? 'critical' : s === 1 ? 'warning' : 'normal')
                };
              }
              return c;
            }));
          } else if (data.type === 'STUDENT_SCRIPT_UPLOADED') {
            triggerToast(`📄 PDF Script Received: ${data.studentName} uploaded answer sheet (${data.pageCount || 6} pages • ${data.sealCode})!`);
            setCandidates(prev => prev.map(c => {
              if (c.rollNo === '14' || c.id === 1) {
                return {
                  ...c,
                  status: 'completed',
                  scriptPagesUploaded: data.pageCount || 6,
                  sealVerified: true,
                  sealCode: data.sealCode,
                  pdfUrl: data.pdfUrl,
                  pdfFileName: data.fileName,
                  pdfFileSize: data.fileSize,
                  pdfUploadedAt: data.uploadedAt
                };
              }
              return c;
            }));
          }
        } catch {}
      };
    } catch {}

    return () => {
      if (ws) {
        try { ws.close(); } catch {}
      }
    };
  }, []);

  // Real-Time Cross-Window Synchronization with Student Exam Hall via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;

        // Student Left / Closed Exam Session
        if (data.type === 'STUDENT_LEFT') {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId || c.name.toLowerCase().includes('aarav') || c.rollNo === '14') {
              return {
                ...c,
                status: 'standby',
                cameraActive: false,
                isAdmitted: false,
                hallTicketPresented: false,
                liveFrame: undefined,
                gaze: 'Standby',
                decibels: 0
              };
            }
            return c;
          }));
          try {
            localStorage.removeItem('edu360_student_live_frame');
          } catch {}
          triggerToast(`Candidate ${data.studentName || 'Aarav Sharma'} exited the examination hall.`);
        }

        // Student Joined Session
        if (data.type === 'STUDENT_JOINED') {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId || c.name.toLowerCase().includes('aarav') || c.rollNo === '14') {
              return {
                ...c,
                isAdmitted: true,
                hallTicketPresented: true,
                cameraActive: true,
                status: 'normal'
              };
            }
            return c;
          }));
          triggerToast(`✅ Candidate ${data.studentName || 'Aarav Sharma'} joined live examination room.`);
        }

        // Student Requests Admission / Presents Hall Ticket
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
          triggerToast(`🪪 Candidate ${data.studentName || 'Aarav Sharma'} submitted Hall Ticket #${data.hallTicketNo || 'HT-2026-8B-014'}.`);
        }

        // Student Live Camera Frame Snapshot Received (Continuous Stream)
        if (data.type === 'STUDENT_FRAME' && data.frame) {
          try {
            localStorage.setItem('edu360_student_live_frame', data.frame);
          } catch {}

          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId || c.name.toLowerCase().includes('aarav') || c.rollNo === '14' || prev.length === 1) {
              return {
                ...c,
                liveFrame: data.frame,
                cameraActive: true,
                status: c.isPaused ? 'critical' : 'normal',
                isAdmitted: true
              };
            }
            return c;
          }));
        }

        // Explicit Malpractice Alert for Left Corner Popup
        if (data.type === 'MALPRACTICE_ALERT') {
          setActiveMalpracticeAlert(data);
          if (data.candidateId) {
            setSpotlightCandidateId(data.candidateId);
          }
          playMalpracticeChime();

          // Sync candidate analysis sheet & strikes immediately
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo || c.rollNo === '14' || c.id === 1) {
              const newStrikes = data.strikes !== undefined ? data.strikes : c.strikes;
              const isNowPaused = newStrikes >= 3 || data.isPaused || c.isPaused;
              const newAnalysisSheet = data.allEntries 
                ? data.allEntries
                : (data.analysisEntry ? [data.analysisEntry, ...(c.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)] : c.analysisSheet);
              return {
                ...c,
                strikes: newStrikes,
                isPaused: isNowPaused,
                status: isNowPaused ? ('critical' as const) : (newStrikes >= 2 ? ('critical' as const) : newStrikes === 1 ? ('warning' as const) : ('normal' as const)),
                suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                analysisSheet: newAnalysisSheet
              };
            }
            return c;
          }));

          setSelectedAnalysisCandidate(curr => {
            if (curr && (curr.id === data.candidateId || curr.studentId === data.candidateId || curr.rollNo === data.rollNo || curr.rollNo === '14' || curr.id === 1)) {
              const newStrikes = data.strikes !== undefined ? data.strikes : curr.strikes;
              const isNowPaused = newStrikes >= 3 || data.isPaused || curr.isPaused;
              const newAnalysisSheet = data.allEntries 
                ? data.allEntries
                : (data.analysisEntry ? [data.analysisEntry, ...(curr.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)] : curr.analysisSheet);
              return {
                ...curr,
                strikes: newStrikes,
                isPaused: isNowPaused,
                status: isNowPaused ? 'critical' : (newStrikes >= 2 ? 'critical' : newStrikes === 1 ? 'warning' : 'normal'),
                suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                analysisSheet: newAnalysisSheet
              };
            }
            return curr;
          });

          setTimeout(() => {
            setActiveMalpracticeAlert(prev => prev && (prev.timestamp === data.timestamp || (prev as any).nonce === data.nonce) ? null : prev);
          }, 15000);
        }

        // Critical Disqualification Review Gate Trigger (Student reaches 3 strikes)
        if (data.type === 'DISQUALIFICATION_REVIEW_REQUESTED' && data.candidateId) {
          setSpotlightCandidateId(data.candidateId);
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
              const audioCtx = new AudioCtx();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.frequency.setValueAtTime(440, audioCtx.currentTime);
              osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
              gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.36);
            }
          } catch {}

          const inquiryEntry: ProctorAnalysisEntry = {
            id: `inquiry-req-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            category: '3-STRIKES SUSPENSION',
            title: '🚨 Examination Suspended (3 Strikes Limit Exceeded)',
            ruleTriggered: 'Workstation Locked &bull; Awaiting Chief Invigilator Inquiry & Decision',
            confidence: 1.0,
            actionTaken: 'STRIKE',
            status: 'FLAGGED',
            notes: `Candidate ${data.studentName || 'candidate'} (Roll #${data.rollNo || '14'}) has accumulated 3 strikes. Exam is locked awaiting invigilator review.`
          };

          setCandidates(prev => {
            const updated = prev.map(c => {
              if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo) {
                const combinedSheet = [
                  inquiryEntry,
                  ...(data.analysisEntry ? [data.analysisEntry] : []),
                  ...c.analysisSheet.filter(e => e.id !== data.analysisEntry?.id && e.id !== inquiryEntry.id)
                ];
                return {
                  ...c,
                  strikes: 3,
                  isPaused: true,
                  status: 'critical' as const,
                  suspicionScore: 100,
                  analysisSheet: combinedSheet
                };
              }
              return c;
            });

            // Focus on this newly suspended candidate in the left series queue
            const suspendedList = updated.filter(c => !c.isDisqualified && (c.strikes >= 3 || c.isPaused));
            const newIdx = suspendedList.findIndex(c => c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo);
            if (newIdx !== -1) {
              setActiveSuspendedIndex(newIdx);
            }

            return updated;
          });

          triggerToast(`🚨 3 Strikes: ${data.studentName || 'Candidate'} suspended. Review card popped up on left.`);
        }

        if (data.type === 'STUDENT_TELEMETRY' && (data.candidateId || data.rollNo === '14')) {
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo || c.rollNo === '14' || c.id === 1) {
              const newStrikes = data.strikes !== undefined ? data.strikes : c.strikes;
              const newAnalysisSheet = data.allEntries
                ? data.allEntries
                : (data.analysisEntry ? [data.analysisEntry, ...(c.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)] : c.analysisSheet);
              
              const isNowPaused = newStrikes >= 3 || data.isPaused || c.isPaused;

              return {
                ...c,
                strikes: newStrikes,
                isPaused: isNowPaused,
                status: isNowPaused ? 'critical' : (newStrikes >= 2 ? 'critical' : newStrikes === 1 ? 'warning' : 'normal'),
                suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                decibels: data.decibels !== undefined ? data.decibels : c.decibels,
                gaze: data.gaze || c.gaze,
                anomalyType: data.anomalyType || c.anomalyType,
                lastAnomalyTime: data.timestamp || c.lastAnomalyTime,
                analysisSheet: newAnalysisSheet
              };
            }
            return c;
          }));

          setSelectedAnalysisCandidate(curr => {
            if (curr && (curr.id === data.candidateId || curr.studentId === data.candidateId || curr.rollNo === data.rollNo || curr.rollNo === '14' || curr.id === 1)) {
              const newStrikes = data.strikes !== undefined ? data.strikes : curr.strikes;
              const isNowPaused = newStrikes >= 3 || data.isPaused || curr.isPaused;
              const newAnalysisSheet = data.allEntries
                ? data.allEntries
                : (data.analysisEntry ? [data.analysisEntry, ...(curr.analysisSheet || []).filter(item => item.id !== data.analysisEntry.id)] : curr.analysisSheet);
              return {
                ...curr,
                strikes: newStrikes,
                isPaused: isNowPaused,
                status: isNowPaused ? 'critical' : (newStrikes >= 2 ? 'critical' : newStrikes === 1 ? 'warning' : 'normal'),
                suspicionScore: Math.min(100, (newStrikes * 33) + ((newAnalysisSheet?.length || 0) * 8)),
                analysisSheet: newAnalysisSheet
              };
            }
            return curr;
          });
        }

        // Candidate submits exam writing
        if (data.type === 'STUDENT_SUBMITTED') {
          triggerToast(`🎉 Candidate ${data.studentName || 'Aarav Sharma'} (Roll #${data.rollNo || '14'}) submitted exam! Seal Code: ${data.sealCode}. 15-Min Paper Upload active.`);
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo || c.name.toLowerCase().includes('aarav')) {
              return {
                ...c,
                status: 'completed',
                statusLabel: 'Writing Finished (Uploading Paper Script)',
                sealCode: data.sealCode || 'SEAL-8B-9482',
                isPaused: false
              };
            }
            return c;
          }));
        }

        // Student Uploads Answer Script PDF within 15-Minute Window
        if (data.type === 'STUDENT_SCRIPT_UPLOADED' && data.candidateId) {
          triggerToast(`📄 PDF Script Received: ${data.studentName} (Roll #${data.rollNo}) uploaded answer sheet (${data.pageCount || 6} pages • ${data.sealCode})!`);
          setCandidates(prev => prev.map(c => {
            if (c.id === data.candidateId || c.studentId === data.candidateId || c.rollNo === data.rollNo) {
              return {
                ...c,
                status: 'completed',
                scriptPagesUploaded: data.pageCount || 6,
                sealVerified: true,
                sealCode: data.sealCode,
                pdfUrl: data.pdfUrl,
                pdfFileName: data.fileName,
                pdfFileSize: data.fileSize,
                pdfUploadedAt: data.uploadedAt
              };
            }
            return c;
          }));
        }
      };
    } catch {}

    api.getExamSessionStatus(1).then(res => {
      if (res && res.session_status === 'COMMENCED') {
        setIsSessionInitiated(true);
      } else if (res && res.session_status === 'CONCLUDED') {
        setIsExamConcludedForEveryone(true);
        setIsSessionInitiated(false);
      }
    }).catch(() => {});

    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Initiate Live WebRTC Proctor Room
  const handleInitiateSession = async () => {
    setIsSessionInitiated(true);
    try {
      localStorage.setItem('edu360_exam_commenced', 'true');
      localStorage.removeItem('edu360_exam_ended_signal');
    } catch {}
    triggerToast('🚀 Live Examination Commenced! All student question papers unlocked.');

    try {
      await api.commenceExamSession(1, 'Mrs. Ananya Verma');
    } catch (e) {
      console.warn('Backend commence sync warning:', e);
    }

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({
        type: 'EXAM_COMMENCED',
        examId: 1,
        invigilatorName: 'Mrs. Ananya Verma',
        subject: 'Mathematics',
        className: 'Class 8-B',
        timestamp: new Date().toISOString()
      });
    } catch {}

    // Multi-Device WebSocket Broadcast to all candidate machines
    try {
      if (surveillanceWsRef.current && surveillanceWsRef.current.readyState === WebSocket.OPEN) {
        surveillanceWsRef.current.send(JSON.stringify({
          type: 'EXAM_COMMENCED',
          examId: 1,
          invigilatorName: 'Mrs. Ananya Verma',
          timestamp: new Date().toISOString()
        }));
      }
    } catch {}
  };

  // Conclude Exam for All Students Early
  const handleEndExamForAll = async () => {
    setIsEndExamConfirmOpen(false);
    setIsExamConcludedForEveryone(true);
    setIsSessionInitiated(false);

    try {
      localStorage.setItem('edu360_exam_ended_signal', JSON.stringify({
        sealCode: 'SEAL-8B-9482',
        timestamp: Date.now()
      }));
      localStorage.removeItem('edu360_exam_commenced');
      localStorage.removeItem('edu360_active_exam_schedule');
      localStorage.removeItem('edu360_latest_malpractice_alert');
      localStorage.removeItem('edu360_candidate_14_status');
    } catch {}

    try {
      await api.concludeExamSession(1, 'Mrs. Ananya Verma', 'All candidates finished early or scheduled exam time ended');
    } catch (e) {
      console.warn('Backend conclude sync warning:', e);
    }

    // 1. Shuts down teacher local camera and audio tracks
    if (teacherStreamRef.current) {
      teacherStreamRef.current.getTracks().forEach(t => t.stop());
      teacherStreamRef.current = null;
    }
    if (teacherVideoRef.current) {
      teacherVideoRef.current.srcObject = null;
    }
    setTeacherCamActive(false);

    // 2. Broadcast EXAM_ENDED_BY_TEACHER to all candidate terminals
    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({
        type: 'EXAM_ENDED_BY_TEACHER',
        examId: 1,
        teacherName: 'Mrs. Ananya Verma',
        sealCode: 'SEAL-8B-9482',
        timestamp: new Date().toISOString()
      });
    } catch {}

    // 3. Broadcast over WebSocket if active
    try {
      if (surveillanceWsRef.current && surveillanceWsRef.current.readyState === WebSocket.OPEN) {
        surveillanceWsRef.current.send(JSON.stringify({
          type: 'EXAM_ENDED_BY_TEACHER',
          examId: 1,
          sealCode: 'SEAL-8B-9482'
        }));
      }
    } catch {}

    // 4. Conclude on backend
    try {
      await fetch('http://127.0.0.1:8000/api/exams/1/conclude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_id: 2,
          reason: 'Chief Invigilator concluded examination for all candidates.'
        })
      });
    } catch {}

    // 5. Update candidates locally
    setCandidates(prev => prev.map(c => ({
      ...c,
      status: 'completed',
      statusLabel: 'Exam Concluded (Uploading Paper Script)',
      isPaused: false
    })));

    triggerToast('🛑 Examination concluded for all candidates. All student cameras and mics powered down. 15-Minute Paper Upload Gate is now open!');
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

      // Log 1-on-1 Inquiry Entry to Analysis Sheet
      const intercomEntry: ProctorAnalysisEntry = {
        id: `intercom-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        category: '1-ON-1 INQUIRY',
        title: '🎙️ 1-on-1 Live Voice Intercom Conducted',
        ruleTriggered: 'Human-in-the-Loop Protocol &bull; Invigilator examined student workspace & reasoning',
        confidence: 1.0,
        actionTaken: 'WARNING',
        status: 'REVIEWED',
        notes: `1-on-1 Voice Inquiry conducted by Chief Invigilator Mrs. Ananya Verma with candidate ${candidate.name} (Roll #${candidate.rollNo}).`
      };

      setCandidates(prev => prev.map(c => c.id === candidate.id ? {
        ...c,
        analysisSheet: [intercomEntry, ...c.analysisSheet.filter(e => e.id !== intercomEntry.id)]
      } : c));

      if (selectedAnalysisCandidate && selectedAnalysisCandidate.id === candidate.id) {
        setSelectedAnalysisCandidate(prev => prev ? {
          ...prev,
          analysisSheet: [intercomEntry, ...prev.analysisSheet.filter(e => e.id !== intercomEntry.id)]
        } : null);
      }

      try {
        const channel = new BroadcastChannel('edu360_exam_live_channel');
        channel.postMessage({
          type: 'TALK_ONE_ON_ONE',
          candidateId: candidate.id,
          studentId: candidate.studentId,
          invigilatorName: 'Mrs. Ananya Verma',
          message: `${candidate.name}, this is Mrs. Ananya Verma. Please ensure your hands and exam paper remain centered in the camera.`,
          intercomEntry
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

  // Pause / Resume Exam for a Candidate
  const handleTogglePause = (candidate: ProctorCandidate) => {
    const willPause = !candidate.isPaused;
    setCandidates(prev => prev.map(c => {
      if (c.id === candidate.id) {
        return {
          ...c,
          isPaused: willPause,
          status: willPause ? 'critical' : (c.strikes >= 2 ? 'critical' : c.strikes === 1 ? 'warning' : 'normal')
        };
      }
      return c;
    }));

    triggerToast(willPause 
      ? `⏸️ Exam Paused for ${candidate.name}. Review card popped up on left.`
      : `▶️ Exam Resumed for ${candidate.name}. Returned to normal exam status.`
    );

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ type: willPause ? 'EXAM_PAUSE' : 'EXAM_RESUME', candidateId: candidate.id });
      channel.close();
    } catch {}
  };

  // CORE DECISION 1: PARDON STRIKES & PERMIT TO WRITE EXAM (Approved -> Returns to original seat)
  const handlePardonCandidate = (candidate: ProctorCandidate) => {
    const decisionEntry: ProctorAnalysisEntry = {
      id: `verdict-approved-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'INVIGILATOR_VERDICT',
      title: '✅ INVIGILATOR VERDICT: APPROVED (PERMITTED TO RESUME)',
      ruleTriggered: 'Pardon & Sanction Relief &bull; Explanation Accepted by Chief Invigilator',
      confidence: 1.0,
      actionTaken: 'ANOMALY_LOG',
      status: 'CLEARED',
      notes: `Chief Invigilator Mrs. Ananya Verma approved continuation for ${candidate.name} (Roll #${candidate.rollNo}) after 1-on-1 inquiry. Strikes cleared to 0. Returned to seat #${candidate.rollNo}.`
    };

    setCandidates(prev => prev.map(c => {
      if (c.id === candidate.id || c.rollNo === candidate.rollNo || c.rollNo === '14' || c.id === 1) {
        return {
          ...c,
          strikes: 0,
          isPaused: false,
          status: 'normal',
          suspicionScore: 10,
          analysisSheet: [decisionEntry, ...(c.analysisSheet || []).filter(e => e.id !== decisionEntry.id)]
        };
      }
      return c;
    }));

    if (selectedAnalysisCandidate && (selectedAnalysisCandidate.id === candidate.id || selectedAnalysisCandidate.rollNo === candidate.rollNo || selectedAnalysisCandidate.rollNo === '14' || selectedAnalysisCandidate.id === 1)) {
      setSelectedAnalysisCandidate(prev => prev ? {
        ...prev,
        strikes: 0,
        isPaused: false,
        status: 'normal',
        analysisSheet: [decisionEntry, ...(prev.analysisSheet || []).filter(e => e.id !== decisionEntry.id)]
      } : null);
    }

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ 
        type: 'PARDON_STRIKES', 
        candidateId: candidate.id,
        rollNo: candidate.rollNo,
        newStrikes: 0,
        decisionEntry
      });
      channel.postMessage({ 
        type: 'EXAM_RESUME', 
        candidateId: candidate.id,
        rollNo: candidate.rollNo 
      });
      // Do NOT close channel so Chromium dispatches without drop
    } catch {}

    // Multi-Device WebSocket Broadcast to candidate terminal
    try {
      if (surveillanceWsRef.current && surveillanceWsRef.current.readyState === WebSocket.OPEN) {
        surveillanceWsRef.current.send(JSON.stringify({
          type: 'PARDON_STRIKES',
          candidateId: candidate.id,
          rollNo: candidate.rollNo,
          newStrikes: 0,
          decisionEntry
        }));
        surveillanceWsRef.current.send(JSON.stringify({
          type: 'EXAM_RESUME',
          candidateId: candidate.id,
          rollNo: candidate.rollNo
        }));
      }
    } catch {}

    // Clear hard suspension and set resume signal in localStorage
    try {
      localStorage.removeItem('edu360_student_hard_suspended');
      localStorage.setItem('edu360_exam_resume_signal', Date.now().toString());
      localStorage.setItem('edu360_candidate_14_status', JSON.stringify({
        candidateId: candidate.id,
        rollNo: candidate.rollNo,
        studentName: candidate.name,
        strikes: 0,
        isPaused: false,
        analysisSheet: [decisionEntry, ...(candidate.analysisSheet || [])],
        pardonedAt: Date.now()
      }));
    } catch {}

    api.sendProctorAction({
      candidate_id: candidate.id,
      action: 'RESUME',
      reason: 'Pardoned & resumed by Invigilator Mrs. Ananya Verma.'
    }).catch(console.error);

    triggerToast(`🟢 Permitted: ${candidate.name} pardoned. Resumed and returned to original grid position.`);
    setEvictModalCandidate(null);
    setActiveMalpracticeAlert(null);
  };

  // CORE DECISION 2: CONFIRM DISQUALIFICATION & REMOVE FROM GRID (Rejected -> Evicted)
  const handleConfirmDisqualification = (candidate: ProctorCandidate, reason: string) => {
    const decisionEntry: ProctorAnalysisEntry = {
      id: `verdict-rejected-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'INVIGILATOR_VERDICT',
      title: '🛑 INVIGILATOR VERDICT: REJECTED (DISQUALIFIED & EVICTED)',
      ruleTriggered: 'Malpractice Threshold Confirmed &bull; Term 2 Examination Eviction Sanction',
      confidence: 1.0,
      actionTaken: 'STRIKE',
      status: 'FLAGGED',
      notes: `Chief Invigilator Mrs. Ananya Verma confirmed disqualification for ${candidate.name} (Roll #${candidate.rollNo}) on grounds: "${reason}". Candidate evicted from examination hall.`
    };

    setCandidates(prev => prev.map(c => {
      if (c.id === candidate.id || c.rollNo === candidate.rollNo || c.rollNo === '14' || c.id === 1) {
        return {
          ...c,
          status: 'disqualified',
          isDisqualified: true,
          isPaused: true,
          analysisSheet: [decisionEntry, ...(c.analysisSheet || []).filter(e => e.id !== decisionEntry.id)]
        };
      }
      return c;
    }));

    if (selectedAnalysisCandidate && (selectedAnalysisCandidate.id === candidate.id || selectedAnalysisCandidate.rollNo === candidate.rollNo || selectedAnalysisCandidate.rollNo === '14' || selectedAnalysisCandidate.id === 1)) {
      setSelectedAnalysisCandidate(prev => prev ? {
        ...prev,
        status: 'disqualified',
        isDisqualified: true,
        isPaused: true,
        analysisSheet: [decisionEntry, ...(prev.analysisSheet || []).filter(e => e.id !== decisionEntry.id)]
      } : null);
    }

    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({ 
        type: 'EXAM_DISQUALIFY', 
        candidateId: candidate.id, 
        rollNo: candidate.rollNo,
        reason,
        decisionEntry 
      });
      // Do NOT close channel so Chromium dispatches without drop
    } catch {}

    // Multi-Device WebSocket Broadcast to candidate terminal
    try {
      if (surveillanceWsRef.current && surveillanceWsRef.current.readyState === WebSocket.OPEN) {
        surveillanceWsRef.current.send(JSON.stringify({
          type: 'PARDON_STRIKES',
          candidateId: candidate.id,
          rollNo: candidate.rollNo,
          newStrikes: 0,
          decisionEntry
        }));
        surveillanceWsRef.current.send(JSON.stringify({
          type: 'EXAM_RESUME',
          candidateId: candidate.id,
          rollNo: candidate.rollNo
        }));
      }
    } catch {}

    try {
      localStorage.setItem('edu360_student_disqualified', JSON.stringify({
        candidateId: candidate.id,
        rollNo: candidate.rollNo,
        reason,
        at: Date.now()
      }));
    } catch {}

    api.sendProctorAction({
      candidate_id: candidate.id,
      action: 'EVICT',
      reason: reason || 'Malpractice confirmed by Chief Invigilator.'
    }).catch(console.error);

    triggerToast(`🔴 Disqualified: Candidate ${candidate.name} (Roll #${candidate.rollNo}) disqualified & removed from active grid.`);
    setEvictModalCandidate(null);
    setActiveMalpracticeAlert(null);
  };

  // Global Broadcast Announcement
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

  // ══════════════════════════════════════════════════════════════════════════
  // DYNAMIC SORTING & FILTERING ALGORITHM:
  // 1. Filter out disqualified candidates (evicted from grid)
  // 2. Suspended candidates pop up on the left in series for inquiry & approval
  // 3. Permitted / normal candidates stay in their ORIGINAL ROLL NUMBER POSITION (#01, #02... #40)
  // ══════════════════════════════════════════════════════════════════════════
  const activeCandidates = useMemo(() => {
    return candidates.filter(c => !c.isDisqualified);
  }, [candidates]);

  const disqualifiedCandidates = useMemo(() => {
    return candidates.filter(c => c.isDisqualified);
  }, [candidates]);

  const displayCandidates = useMemo(() => {
    if (filter === 'disqualified') {
      return disqualifiedCandidates;
    }

    const list = activeCandidates.filter(c => {
      if (filter === 'admit_queue') return !c.isAdmitted && c.hallTicketPresented;
      if (filter === 'flagged') return (c.strikes > 0) || c.status === 'critical' || c.status === 'warning';
      if (filter === 'paused') return c.isPaused || c.strikes >= 3;
      if (filter === 'completed') return c.status === 'completed';
      return true;
    });

    return [...list].sort((a, b) => {
      // 1. TOP-LEFT CORNER PROMOTION: Suspended / 3-Strike candidates move to the top-left immediately!
      const aSuspended = (a.isPaused || a.strikes >= 3) ? 1 : 0;
      const bSuspended = (b.isPaused || b.strikes >= 3) ? 1 : 0;
      if (aSuspended !== bSuspended) return bSuspended - aSuspended;

      // 2. High risk candidates (2 strikes) follow immediately
      const aCritical = (a.strikes >= 2 || a.status === 'critical') ? 1 : 0;
      const bCritical = (b.strikes >= 2 || b.status === 'critical') ? 1 : 0;
      if (aCritical !== bCritical) return bCritical - aCritical;

      // 3. Warning candidates (1 strike)
      const aWarning = (a.strikes === 1 || a.status === 'warning') ? 1 : 0;
      const bWarning = (b.strikes === 1 || b.status === 'warning') ? 1 : 0;
      if (aWarning !== bWarning) return bWarning - aWarning;

      // 4. Natural roll number position in examination hall (#01, #02... #40)
      const rollA = parseInt(a.rollNo.replace(/\D/g, '') || '0', 10);
      const rollB = parseInt(b.rollNo.replace(/\D/g, '') || '0', 10);
      return rollA - rollB;
    });
  }, [activeCandidates, disqualifiedCandidates, filter]);

  const pausedCount = candidates.filter(c => !c.isDisqualified && (c.isPaused || c.strikes >= 3)).length;
  const criticalCount = candidates.filter(c => !c.isDisqualified && (c.status === 'critical' || c.strikes >= 2)).length;
  const warningCount = candidates.filter(c => !c.isDisqualified && (c.status === 'warning' || c.strikes === 1)).length;
  const pendingAdmitCandidates = candidates.filter(c => !c.isAdmitted && c.hallTicketPresented);

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 1. REAL-TIME LEFT CORNER SUSPENDED QUEUE (3 STRIKES) OR MALPRACTICE ALERT  */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {suspendedQueue.length > 0 ? (
        (() => {
          const currentCandidate = suspendedQueue[activeSuspendedIndex] || suspendedQueue[0];
          const isIntercomOn = activeIntercomCandidateId === currentCandidate.id;
          const latestIncident = currentCandidate.analysisSheet?.[0];

          return (
            <div className="fixed bottom-6 left-6 z-50 max-w-md w-full rounded-3xl bg-slate-900/98 dark:bg-slate-950/98 text-white p-5 shadow-2xl backdrop-blur-xl border-2 border-rose-500 ring-4 ring-rose-500/30 animate-in slide-in-from-left-6 fade-in duration-300">
              
              {/* Card Header & Series Counter */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-500/30">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-400">
                      🚨 3-Strikes Suspension Review
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {suspendedQueue.length > 1
                        ? `Candidate ${activeSuspendedIndex + 1} of ${suspendedQueue.length} in series`
                        : 'Action required by Chief Invigilator'}
                    </span>
                  </div>
                </div>

                {/* Series Navigation (When multiple students are suspended) */}
                {suspendedQueue.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-slate-800/90 rounded-xl p-1 border border-slate-700">
                    <button
                      type="button"
                      disabled={activeSuspendedIndex === 0}
                      onClick={() => setActiveSuspendedIndex(prev => Math.max(0, prev - 1))}
                      className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                      title="Previous candidate in queue"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-mono font-bold px-1 text-rose-300">
                      {activeSuspendedIndex + 1}/{suspendedQueue.length}
                    </span>
                    <button
                      type="button"
                      disabled={activeSuspendedIndex === suspendedQueue.length - 1}
                      onClick={() => setActiveSuspendedIndex(prev => Math.min(suspendedQueue.length - 1, prev + 1))}
                      className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-colors"
                      title="Next candidate in queue"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Series Quick-Select Chips (if multiple candidates) */}
              {suspendedQueue.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-3 border-b border-slate-800 scrollbar-none">
                  {suspendedQueue.map((cand, idx) => (
                    <button
                      key={`series-tab-${cand.id}`}
                      type="button"
                      onClick={() => setActiveSuspendedIndex(idx)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        idx === activeSuspendedIndex
                          ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400/40'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                      }`}
                    >
                      <span className="text-[10px] font-mono">#{cand.rollNo}</span>
                      <span>{cand.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Candidate Info Profile */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {currentCandidate.liveFrame ? (
                    <img
                      src={currentCandidate.liveFrame}
                      alt={currentCandidate.name}
                      className="h-14 w-14 rounded-2xl object-cover border-2 border-rose-500 shadow-md shadow-rose-950/40"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-2xl bg-rose-950/80 border-2 border-rose-500/80 flex items-center justify-center text-rose-300 font-black text-lg shadow-md">
                      #{currentCandidate.rollNo}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[9px] font-black border border-slate-900 shadow-xs">
                    3/3
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-black text-white truncate" title={currentCandidate.name}>
                      {currentCandidate.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600/30 text-rose-300 border border-rose-500/40 shrink-0">
                      Roll #{currentCandidate.rollNo}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Class {currentCandidate.grade ? `${currentCandidate.grade}-${currentCandidate.section || 'B'}` : '8-B'} &bull; Examination Session Locked
                  </p>
                </div>
              </div>

              {/* Latest Infraction Details */}
              <div className="mt-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1">
                <p className="font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  <span className="truncate">{latestIncident?.title || '3 Malpractice Strikes Exceeded'}</span>
                </p>
                <p className="text-[11px] text-slate-300 font-mono line-clamp-2">
                  {latestIncident?.ruleTriggered || 'Question paper locked. Complete inquiry before issuing verdict.'}
                </p>
              </div>

              {/* Inquiry Actions (Talk 1-on-1 or View Analysis Sheet) */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleIntercom(currentCandidate);
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all border ${
                    isIntercomOn
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-400 ring-2 ring-indigo-500/50 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                  }`}
                >
                  <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
                  <span>{isIntercomOn ? '🎙️ End 1-on-1' : '🎙️ 1-on-1 Talk'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAnalysisCandidate(currentCandidate);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all border border-violet-500/50"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>📄 Analysis Sheet</span>
                </button>
              </div>

              {/* Final Verdict Actions (Approve to Resume OR Remove from Exam) */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    handlePardonCandidate(currentCandidate);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/40 transition-all active:scale-95 border border-emerald-500"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Approve &amp; Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEvictModalCandidate(currentCandidate);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/40 transition-all active:scale-95 border border-rose-500"
                >
                  <Ban className="h-4 w-4" />
                  <span>Remove from Exam</span>
                </button>
              </div>
            </div>
          );
        })()
      ) : activeMalpracticeAlert ? (
        /* Regular warning alert popup for 1 or 2 strikes */
        <div className="fixed bottom-6 left-6 z-50 max-w-md w-full rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white p-4 shadow-2xl backdrop-blur-md border-2 border-rose-500/80 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-600/30 text-rose-400 border border-rose-500/40">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
                    Malpractice Strike
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-600 text-white">
                    Strike {activeMalpracticeAlert.strikes}/3
                  </span>
                </div>
                <h4 className="text-sm font-black text-white mt-0.5">
                  {activeMalpracticeAlert.studentName} (Roll #{activeMalpracticeAlert.rollNo})
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveMalpracticeAlert(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-1.5">
            <p className="font-bold text-rose-300 flex items-center gap-1.5">
              <span>🚨</span>
              <span>{activeMalpracticeAlert.title}</span>
            </p>
            <p className="text-[11px] text-slate-300 font-mono">
              {activeMalpracticeAlert.ruleTriggered}
            </p>
          </div>

          {/* Action Decision Toolbar */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                const cand = candidates.find(c => c.id === activeMalpracticeAlert.candidateId || c.studentId === activeMalpracticeAlert.candidateId);
                if (cand) {
                  setSpotlightCandidateId(cand.id);
                  handleToggleIntercom(cand);
                }
              }}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all border border-slate-700"
            >
              <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
              <span>1-on-1 Voice</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const cand = candidates.find(c => c.id === activeMalpracticeAlert.candidateId || c.studentId === activeMalpracticeAlert.candidateId);
                if (cand) {
                  setSpotlightCandidateId(cand.id);
                  setSelectedAnalysisCandidate(cand);
                }
                setActiveMalpracticeAlert(null);
              }}
              className="py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>View Analysis</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-violet-500/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMsg}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 2. COMMAND HEADER: ROOM DETAILS + COMPACT INVIGILATOR STUDIO POD           */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 p-5 text-white shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        
        {/* Left: Room Status & Title */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-0.5 text-[11px] font-black">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              LIVEKIT SFU PROCTOR MESH &bull; 1:40 SURVEILLANCE ACTIVE
            </span>
            <span className="text-xs text-violet-300/80 font-mono">
              Dynacast 180p &bull; Latency: 24ms &bull; MediaPipe Active
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>Live Invigilator Command Cockpit</span>
            <span className="text-violet-400 font-normal">&bull; {className || 'Class 8-B'} (Room: {effectiveRoomId})</span>
          </h1>

          <p className="text-xs text-violet-200/70 max-w-2xl leading-relaxed">
            Full 40-student classroom surveillance grid. Students who join the exam stream their <b>real-time live camera feed</b>. When 3 strikes occur, the student card pops up on the left for 1-on-1 inquiry and approval/removal.
          </p>

          <div className="flex items-center gap-3 pt-1 text-xs">
            <span className="rounded-xl bg-white/10 px-3 py-1 font-mono text-emerald-300 font-bold">
              ⏱️ Elapsed: {formatTimer(sessionSeconds)}
            </span>
            <span className="rounded-xl bg-white/10 px-3 py-1 font-mono text-white">
              👥 Active in Grid: <b>{activeCandidates.length}</b> / 40
            </span>
            {pausedCount > 0 && (
              <span className="rounded-xl bg-rose-600 px-3 py-1 font-mono text-white font-black animate-pulse flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{pausedCount} Suspended for Review</span>
              </span>
            )}
            {disqualifiedCandidates.length > 0 && (
              <span className="rounded-xl bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 font-mono text-xs">
                🚫 Evicted: {disqualifiedCandidates.length}
              </span>
            )}
          </div>
        </div>

        {/* Right: Sleek Compact Chief Invigilator Studio Pod (Teacher's Own Camera) */}
        <div className="rounded-2xl border-2 border-violet-500/70 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md flex items-center gap-3.5 shrink-0">
          {/* Teacher Webcam Thumbnail */}
          <div className="relative w-36 sm:w-44 aspect-video rounded-xl overflow-hidden bg-black border border-white/10 flex items-center justify-center shrink-0">
            <video
              ref={teacherVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${teacherCamActive ? '' : 'hidden'}`}
            />
            {!teacherCamActive && (
              <div className="flex flex-col items-center justify-center text-slate-500 text-[10px]">
                <Camera className="h-5 w-5 mb-1 text-slate-600" />
                <span>Cam Paused</span>
              </div>
            )}
            {/* Live Pill */}
            <div className="absolute top-1 left-1 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-mono text-emerald-300 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>HOST</span>
            </div>
            {/* Mic Meter */}
            <div className="absolute bottom-1 left-1 bg-black/75 px-1.5 py-0.5 rounded text-[8px] font-mono text-white flex items-center gap-1">
              <Mic className={`h-2.5 w-2.5 ${teacherMicMuted ? 'text-rose-400' : 'text-emerald-400 animate-pulse'}`} />
              <span>{teacherMicMuted ? 'Muted' : '42dB'}</span>
            </div>
          </div>

          {/* Teacher Controls */}
          <div className="space-y-1.5 text-xs">
            <div>
              <span className="font-bold text-white text-xs block">Mrs. Ananya Verma</span>
              <span className="text-[10px] text-violet-300 block font-mono">Chief Invigilator &bull; Live Studio</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleTeacherCam}
                className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  teacherCamActive ? 'bg-slate-800 hover:bg-slate-700 text-slate-200' : 'bg-rose-600 text-white'
                }`}
                title={teacherCamActive ? 'Turn Off Cam' : 'Turn On Cam'}
              >
                {teacherCamActive ? <Camera className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={toggleTeacherMic}
                className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  teacherMicMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                }`}
                title={teacherMicMuted ? 'Unmute Mic' : 'Mute Mic'}
              >
                {teacherMicMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </button>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                1:40 SFU
              </span>
            </div>

            <span className="text-[9px] text-slate-400 block font-mono">
              Broadcasting to 40 Students
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 3. HALL TICKET ADMISSION GATE                                             */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {pendingAdmitCandidates.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-500/60 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-yellow-500/20 p-4 text-slate-900 dark:text-white shadow-md animate-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                <UserCheck className="h-5 w-5" />
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
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Check className="h-4 w-4" />
                <span>Verify Hall Ticket &amp; Admit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 4. SURVEILLANCE FILTER BAR & GLOBAL HUD ANNOUNCEMENT                      */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Active Grid ({activeCandidates.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('paused')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'paused'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
            }`}
          >
            <Pause className="h-3.5 w-3.5" />
            <span>Suspended ({pausedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('flagged')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'flagged'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Flagged Strikes ({criticalCount + warningCount})</span>
          </button>

          {disqualifiedCandidates.length > 0 && (
            <button
              type="button"
              onClick={() => setFilter('disqualified')}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'disqualified'
                  ? 'bg-slate-900 text-white ring-2 ring-rose-500'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ban className="h-3.5 w-3.5 text-rose-400" />
              <span>Evicted Candidates ({disqualifiedCandidates.length})</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Global Announcement Form */}
          <form onSubmit={handleBroadcastAnnouncement} className="flex items-center gap-2 max-w-sm w-full">
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

          {/* Start or End Exam Controls */}
          {!isSessionInitiated ? (
            <button
              type="button"
              onClick={handleInitiateSession}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-black transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer shrink-0 animate-pulse border border-emerald-400"
              title="Commence examination for all candidates"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>🚀 Start Exam (Commence for All)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEndExamConfirmOpen(true)}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-md hover:shadow-rose-500/20 flex items-center gap-1.5 cursor-pointer shrink-0 border border-rose-500/30"
              title="Conclude exam for all candidates and trigger 15-min paper upload"
            >
              <PowerOff className="h-3.5 w-3.5" />
              <span>End Exam for All</span>
            </button>
          )}
        </div>
      </div>

      {/* Standby / Not Commenced Notice */}
      {!isSessionInitiated && !isExamConcludedForEveryone && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-violet-500/10 to-indigo-500/15 border-2 border-amber-500/50 flex flex-wrap items-center justify-between gap-3 text-white animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-300">
                ⏸️ Exam Room Standing By &bull; Waiting for Chief Invigilator to Commence
              </h4>
              <p className="text-xs text-slate-300">
                Candidates who join are held in the Pre-Exam Verification Lobby with active webcam &amp; audio checks. Click <b>&quot;Start Exam (Commence for All)&quot;</b> to unlock question papers and begin the exam timer for all candidates.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInitiateSession}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center gap-1.5 border border-emerald-400 active:scale-95 transition-all"
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Commence Examination Now</span>
          </button>
        </div>
      )}

      {/* Examination Concluded Banner */}
      {isExamConcludedForEveryone && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/50 flex flex-wrap items-center justify-between gap-3 text-white animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-300">Examination Concluded by Chief Invigilator</h4>
              <p className="text-xs text-slate-300">
                All candidate webcam streams &amp; microphones have been powered down. 15-Minute Paper Upload Grace Window is active for all students.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Active Seal Code: SEAL-8B-9482
            </span>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 5. HERO SURVEILLANCE GRID OF ALL STUDENTS (CENTRAL INTERFACE)             */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Dynamic Re-ordering Guide Note */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4 text-violet-400" />
            <span>Surveillance Matrix: <b>{displayCandidates.length} Candidates</b> &bull; Real-time Camera Feeds</span>
          </span>
          <span className="text-[11px] text-violet-300">
            💡 Candidate #14 is connected live. When 3 strikes occur, candidate card pops up on the left in series for 1-on-1 talk, analysis review, and approval/removal.
          </span>
        </div>

        {/* 40-Student Hero Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 items-stretch">
          {displayCandidates.map((c, index) => {
            const hasLiveStream = Boolean(c.liveStream || c.liveFrame);
            const isCandidateLive = Boolean(c.liveStream || c.liveFrame || (c.rollNo === '14' && c.cameraActive && c.isAdmitted));
            const isPaused = c.isPaused || c.strikes >= 3;
            const isCritical = !isPaused && (c.status === 'critical' || c.strikes >= 2);
            const isWarning = !isPaused && (c.status === 'warning' || c.strikes === 1);
            const isSuspended = isPaused;

            return (
              <div
                key={`candidate-card-${c.id}`}
                onClick={() => {
                  setSpotlightCandidateId(c.id);
                  setSelectedAnalysisCandidate(c);
                }}
                className={`group relative rounded-2xl border-2 transition-all duration-300 overflow-hidden shadow-md flex flex-col bg-slate-900 cursor-pointer hover:shadow-xl ${
                  isSuspended
                    ? 'border-4 border-rose-600 ring-4 ring-rose-500/70 bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 shadow-2xl shadow-rose-950 scale-[1.03] animate-pulse z-20'
                    : isCandidateLive
                    ? 'border-violet-500/80 ring-2 ring-violet-500/30 bg-slate-900 shadow-violet-900/20'
                    : isCritical
                    ? 'border-rose-500 ring-2 ring-rose-500/30 shadow-rose-500/20'
                    : isWarning
                    ? 'border-amber-400 ring-1 ring-amber-400/30'
                    : 'border-slate-800 hover:border-violet-500/70 hover:scale-[1.02]'
                }`}
              >
                {/* ── CARD HEADER ── */}
                <div className={`p-2 border-b flex items-center justify-between text-[11px] ${
                  isSuspended
                    ? 'bg-rose-950 text-rose-200 border-rose-800 font-black'
                    : isCandidateLive
                    ? 'bg-violet-950/90 text-violet-200 border-violet-800/80'
                    : 'bg-slate-950/90 text-slate-300 border-slate-800'
                }`}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`font-mono font-black px-1.5 py-0.2 rounded text-[10px] ${
                      isSuspended 
                        ? 'bg-rose-600 text-white' 
                        : isCandidateLive 
                        ? 'bg-violet-600 text-white' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      #{c.rollNo}
                    </span>
                    <span className="font-bold text-white truncate max-w-[80px]" title={c.name}>
                      {c.name.split(' ')[0]}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isSuspended ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] animate-bounce shadow-md">
                      🚨 SUSPENDED (3 STRIKES)
                    </span>
                  ) : isCandidateLive ? (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[9px] flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>LIVE</span>
                    </span>
                  ) : isCritical ? (
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white font-black text-[9px]">
                      {c.strikes}S
                    </span>
                  ) : isWarning ? (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-white font-bold text-[9px]">
                      {c.strikes}S
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                      <span>Standby</span>
                    </span>
                  )}
                </div>

                {/* ── CARD VIDEO STREAM / AUTHENTIC STANDBY ── */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                  {c.liveStream ? (
                    <video
                      ref={(el) => {
                        if (el && el.srcObject !== c.liveStream) {
                          el.srcObject = c.liveStream || null;
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isPaused ? 'grayscale' : ''}`}
                    />
                  ) : c.liveFrame ? (
                    <img
                      src={c.liveFrame}
                      alt={c.name}
                      className={`w-full h-full object-cover transition-opacity ${isPaused ? 'grayscale' : ''}`}
                    />
                  ) : (
                    /* Clean Standby State for enrolled students who haven't joined yet */
                    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 flex flex-col items-center justify-center p-3 text-center space-y-1.5">
                      <div className="h-9 w-9 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center font-black text-xs text-slate-300 shadow-inner">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 block">Enrolled Desk #{c.rollNo}</span>
                        <span className="text-[9px] font-mono text-slate-500 block flex items-center justify-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                          <span>Awaiting Stream</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Audio Decibel Meter (Active only for connected candidate) */}
                  {hasLiveStream && (
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-emerald-300 flex items-center gap-1 backdrop-blur-xs">
                      <Mic className="h-2.5 w-2.5 text-emerald-400" />
                      <span>{c.decibels || 38}dB</span>
                    </div>
                  )}

                  {/* MediaPipe Vision Active Pill (Active only for connected candidate) */}
                  {hasLiveStream && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[8px] font-mono text-emerald-300 flex items-center gap-1 backdrop-blur-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>Vision</span>
                    </div>
                  )}

                  {/* Paused Overlay Beacon */}
                  {isPaused && (
                    <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-2 text-center z-10 space-y-1">
                      <Pause className="h-7 w-7 text-rose-400 animate-pulse" />
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">
                        EXAM FROZEN
                      </span>
                      <span className="text-[9px] text-rose-200 font-bold">
                        Strike 3/3 &bull; Action Required
                      </span>
                    </div>
                  )}

                  {/* PDF Uploaded Badge (15-Min Submission Window) */}
                  {c.scriptPagesUploaded > 0 && !isPaused && (
                    <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[8px] font-bold flex items-center gap-1">
                      <FileCheck className="h-2.5 w-2.5" />
                      <span>PDF ({c.scriptPagesUploaded}p)</span>
                    </div>
                  )}
                </div>

                {/* ── CARD FOOTER & ACTIONS ── */}
                <div className={`p-2 text-[10px] flex flex-col gap-1.5 border-t ${
                  isSuspended
                    ? 'bg-rose-950/90 border-rose-800'
                    : isCandidateLive
                    ? 'bg-violet-950/60 border-violet-800/60'
                    : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[9px]">
                    <span className="truncate max-w-[90px]">
                      {hasLiveStream ? (c.gaze || 'Centered') : 'Standby'}
                    </span>
                    <span className={c.suspicionScore > 40 ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                      {hasLiveStream ? `${c.suspicionScore}% Suspect` : 'Offline'}
                    </span>
                  </div>

                  {/* ACTION BUTTONS */}
                  {isSuspended ? (
                    <div className="grid grid-cols-2 gap-1 pt-1 border-t border-rose-800/60">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePardonCandidate(c);
                        }}
                        className="py-1 px-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                        title="Pardon strikes and restore candidate to original roll seat"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Permit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvictModalCandidate(c);
                        }}
                        className="py-1 px-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer transition-all shadow-xs"
                        title="Disqualify candidate and remove from active grid"
                      >
                        <Ban className="h-3 w-3" />
                        <span>Disqualify</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleIntercom(c);
                        }}
                        className="col-span-2 py-1 px-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-[9px] flex items-center justify-center gap-1 cursor-pointer border border-slate-700 transition-all"
                      >
                        <PhoneCall className="h-3 w-3 text-indigo-400" />
                        <span>1-on-1 Voice Intercom</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAnalysisCandidate(c);
                        }}
                        className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-violet-600 hover:text-white text-slate-300 text-[9px] font-bold flex-1 flex items-center justify-center gap-1 transition-colors"
                      >
                        <FileText className="h-2.5 w-2.5" />
                        <span>Dossier ({c.analysisSheet?.length || 0})</span>
                      </button>

                      {hasLiveStream && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePause(c);
                          }}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-400 text-[9px] transition-colors"
                          title="Pause candidate exam (moves to inquiry queue)"
                        >
                          <Pause className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {displayCandidates.length === 0 && (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3">
            <Users className="h-10 w-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No Candidates Match Selected Filter</h4>
            <p className="text-xs text-slate-400">Switch filter above to "All Active Grid" to view all 40 enrolled students.</p>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 6. DISQUALIFIED CANDIDATES RECORD DRAWER                                   */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {disqualifiedCandidates.length > 0 && filter === 'disqualified' && (
        <div className="rounded-3xl border-2 border-rose-900 bg-slate-950 p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-rose-900/60 pb-3">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-rose-500" />
              <h3 className="text-base font-black text-white">Evicted Candidates Archive (Disqualified by Chief Invigilator)</h3>
            </div>
            <span className="text-xs font-mono text-rose-400 font-bold">
              {disqualifiedCandidates.length} Disqualified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {disqualifiedCandidates.map((cand) => (
              <div key={`disqualified-${cand.id}`} className="rounded-2xl border border-rose-900/70 bg-rose-950/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{cand.name}</span>
                  <span className="font-mono text-xs text-rose-400 font-bold">Roll #{cand.rollNo}</span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Disqualified from Term 2 Examination due to confirmed proctoring threshold breach.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handlePardonCandidate(cand)}
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Re-admit &amp; Pardon Candidate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedAnalysisCandidate(cand)}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="h-3 w-3" />
                    <span>View Audit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 7. CANDIDATE ANALYSIS SHEET MODAL & DOSSIER AUDIT TRAIL                   */}
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
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Seat Position</span>
                <span className={`text-base font-black mt-0.5 block ${
                  selectedAnalysisCandidate.isPaused || selectedAnalysisCandidate.strikes >= 3 ? 'text-rose-500' : 'text-emerald-500'
                }`}>
                  {selectedAnalysisCandidate.isPaused || selectedAnalysisCandidate.strikes >= 3 ? '🚨 Suspended (In Inquiry)' : `Seat #${selectedAnalysisCandidate.rollNo}`}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Integrity Score</span>
                <span className="text-xl font-black text-emerald-500 mt-0.5 block">
                  {Math.max(40, 100 - (selectedAnalysisCandidate.strikes * 20) - ((selectedAnalysisCandidate.analysisSheet?.length || 0) * 3))}%
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
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                              {['CELL_PHONE', 'BOOK_DETECTED', 'MULTIPLE_PERSONS', 'STUDENT_ABSENT'].includes(item.category) && <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />}
                              {['GAZE_DRIFT', 'TAB_SWITCH'].includes(item.category) && <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />}
                              {item.category === 'AUDIO_ANOMALY' && <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
                              <span>{item.title}</span>
                            </div>
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
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleIntercom(selectedAnalysisCandidate)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 border border-slate-700"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-rose-400" />
                  <span>1-on-1 Voice Intercom</span>
                </button>

                {selectedAnalysisCandidate.isPaused && (
                  <button
                    type="button"
                    onClick={() => {
                      handlePardonCandidate(selectedAnalysisCandidate);
                      setSelectedAnalysisCandidate(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Permit &amp; Return to Original Seat</span>
                  </button>
                )}
              </div>

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

      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {/* 8. DISQUALIFICATION & SANCTION GATE MODAL                                 */}
      {/* ══════════════════════════════════════════════════════════════════════════ */}
      {evictModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border-2 border-rose-500/60 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Disqualification Review Gate
                  </h3>
                  <p className="text-xs text-slate-500">
                    Candidate Exceeded Malpractice Threshold &bull; Teacher Decision Required
                  </p>
                </div>
              </div>
              <button onClick={() => setEvictModalCandidate(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Candidate Dossier Overview */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="h-12 w-12 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-white text-base">
                {evictModalCandidate.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {evictModalCandidate.name}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white">
                    {evictModalCandidate.strikes} / 3 Strikes
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Roll #{evictModalCandidate.rollNo} &bull; Class 8-B &bull; Suspicion Score: {evictModalCandidate.suspicionScore}%
                </p>
              </div>
            </div>

            {/* Eviction Reason Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Official Eviction Ground (Saved to Board Examination Audit):
              </label>
              <input
                type="text"
                value={evictReason}
                onChange={(e) => setEvictReason(e.target.value)}
                className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* 3 Decision Actions */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleToggleIntercom(evictModalCandidate);
                  triggerToast(`🎙️ 1-on-1 Intercom opened with ${evictModalCandidate.name}. Speak to candidate first.`);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Talk 1-on-1 with Candidate First via Audio Intercom</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handlePardonCandidate(evictModalCandidate)}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Permit &amp; Return to Seat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmDisqualification(evictModalCandidate, evictReason)}
                  className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Ban className="h-4 w-4" />
                  <span>Disqualify &amp; Remove from Grid</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning HUD Modal */}
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
              Candidate: <b>{warningModalCandidate.name} (Roll #{warningModalCandidate.rollNo})</b>.
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

      {/* End Exam For All Candidates Early Confirmation Modal */}
      {isEndExamConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-rose-500/60 p-6 text-white space-y-4 shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="h-7 w-7 text-rose-400" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">End Exam for All Candidates?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This will conclude the active examination session early. All candidate camera feeds and microphones will be immediately powered down, and candidates will be transitioned to the 15-minute answer sheet upload gate with seal code <b>SEAL-8B-9482</b>.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEndExamConfirmOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEndExamForAll}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <PowerOff className="h-4 w-4" />
                <span>Confirm &amp; End Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Answer Script PDF Submission Inspection Modal */}
      <TeacherPdfScriptViewerModal
        isOpen={!!selectedPdfSubmission}
        onClose={() => setSelectedPdfSubmission(null)}
        submission={selectedPdfSubmission}
      />
    </div>
  );
}
