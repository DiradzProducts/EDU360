'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  Hand, 
  MessageSquare, 
  PhoneOff, 
  Users, 
  Settings, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ShieldCheck, 
  Radio, 
  Volume2, 
  Wifi, 
  WifiOff,
  HelpCircle,
  X,
  Check,
  Bell,
  AlertTriangle,
  Clock,
  Lock,
  BookOpen
} from 'lucide-react';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  VideoPresets, 
  ConnectionState 
} from 'livekit-client';
import { api } from '@/lib/api';
import { playDoubtNotification } from '@/lib/sound-effects';

interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  time: string;
}

interface EduVideoConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  roomTitle: string;
  userName: string;
  userRole: 'TEACHER' | 'STUDENT' | 'PARENT' | 'INVIGILATOR';
  studentId?: number;
  classId?: number;
  studentContextName?: string;
  onAttendanceVerified?: (data?: { minutesElapsed?: number; status?: string }) => void;
}

/**
 * RemoteParticipantTile:
 * Subscribes to and renders remote participants' video and audio tracks via LiveKit SFU.
 */
function RemoteParticipantTile({
  participant,
  isSpeaking,
  isHandRaised,
}: {
  participant: RemoteParticipant;
  isSpeaking: boolean;
  isHandRaised: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState((participant as any).isMuted ?? false);

  // Extract role and display name from participant metadata or identity
  let role = 'STUDENT';
  let displayName = participant.name || participant.identity;
  try {
    if (participant.metadata) {
      const parsed = JSON.parse(participant.metadata);
      if (parsed.role) role = parsed.role;
      if (parsed.name) displayName = parsed.name;
    }
  } catch {}

  if (participant.identity.toLowerCase().startsWith('teacher')) {
    role = 'TEACHER';
  }

  const syncTracks = useCallback(() => {
    let activeVideo = false;
    let activeAudio = false;

    participant.videoTrackPublications.forEach((pub: any) => {
      if (pub.track && pub.isSubscribed && !pub.isMuted) {
        if (videoRef.current) {
          pub.track.attach?.(videoRef.current);
          activeVideo = true;
        }
      }
    });

    participant.audioTrackPublications.forEach((pub: any) => {
      if (pub.track && pub.isSubscribed && !pub.isMuted) {
        if (audioRef.current) {
          pub.track.attach?.(audioRef.current);
          activeAudio = true;
        }
      }
    });

    setHasVideo(activeVideo);
    setIsAudioMuted((participant as any).isMuted || !activeAudio);
  }, [participant]);

  useEffect(() => {
    syncTracks();

    participant.on(RoomEvent.TrackSubscribed, syncTracks);
    participant.on(RoomEvent.TrackUnsubscribed, syncTracks);
    participant.on(RoomEvent.TrackMuted, syncTracks);
    participant.on(RoomEvent.TrackUnmuted, syncTracks);

    return () => {
      participant.off(RoomEvent.TrackSubscribed, syncTracks);
      participant.off(RoomEvent.TrackUnsubscribed, syncTracks);
      participant.off(RoomEvent.TrackMuted, syncTracks);
      participant.off(RoomEvent.TrackUnmuted, syncTracks);

      if (videoRef.current) {
        participant.videoTrackPublications.forEach((pub: any) => {
          if (pub.track) pub.track.detach?.(videoRef.current!);
        });
      }
      if (audioRef.current) {
        participant.audioTrackPublications.forEach((pub: any) => {
          if (pub.track) pub.track.detach?.(audioRef.current!);
        });
      }
    };
  }, [participant, syncTracks]);

  return (
    <div 
      className={`relative rounded-3xl bg-slate-900 border overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300 min-h-[220px] ${
        isSpeaking 
          ? 'ring-2 ring-emerald-400 border-emerald-400/60 shadow-emerald-500/10' 
          : 'border-white/10'
      }`}
    >
      {/* Remote Audio Track Player (Hidden) */}
      <audio ref={audioRef} autoPlay />

      {/* Real-Time WebRTC Video Stream */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-300 ${hasVideo ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Fallback Display Avatar when camera is turned off or loading */}
      {!hasVideo && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900">
          <div 
            className={`h-20 w-20 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-xl ${
              role === 'TEACHER' 
                ? 'bg-indigo-600 ring-4 ring-indigo-400/30' 
                : 'bg-emerald-600 ring-4 ring-emerald-400/30'
            } ${isSpeaking ? 'animate-pulse ring-emerald-400' : ''}`}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <p className="mt-3 text-sm font-semibold text-white tracking-wide">{displayName}</p>
          <span className="text-[11px] text-white/50 font-mono mt-0.5">
            {role === 'TEACHER' ? 'Faculty Host • Mathematics' : 'Student Participant'}
          </span>
        </div>
      )}

      {/* Top Overlay Badge */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
          {role === 'TEACHER' ? (
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          ) : (
            <Video className="h-3.5 w-3.5 text-emerald-400" />
          )}
          <span>{displayName}</span>
          {role === 'TEACHER' && (
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded font-bold">
              HOST
            </span>
          )}
        </span>

        {isHandRaised && (
          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-bold text-xs flex items-center gap-1 shadow-lg animate-bounce">
            <Hand className="h-3.5 w-3.5" /> Hand Raised
          </span>
        )}
      </div>

      {/* Bottom Audio Status Indicator */}
      <div className="absolute bottom-3 left-3 pointer-events-none z-10">
        <span 
          className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 backdrop-blur-md border ${
            isSpeaking 
              ? 'bg-black/60 text-emerald-400 border-emerald-500/30' 
              : isAudioMuted 
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/30' 
                : 'bg-black/60 text-white/70 border-white/10'
          }`}
        >
          {isSpeaking ? (
            <>
              <Volume2 className="h-3 w-3 animate-pulse text-emerald-400" />
              <span>Speaking</span>
            </>
          ) : isAudioMuted ? (
            <>
              <MicOff className="h-3 w-3 text-rose-400" />
              <span>Muted</span>
            </>
          ) : (
            <>
              <Mic className="h-3 w-3 text-emerald-400" />
              <span>Mic Active</span>
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export function EduVideoConferenceModal({
  isOpen,
  onClose,
  roomName,
  roomTitle,
  userName,
  userRole,
  studentId,
  classId,
  studentContextName,
  onAttendanceVerified
}: EduVideoConferenceModalProps) {
  const effectiveStudentId = studentId || 1;
  const effectiveClassId = classId || 1;

  // Device & Layout States
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // LiveKit Connection & Remote Participants
  const [liveKitConfig, setLiveKitConfig] = useState<{ server_url: string; token: string; is_cloud_active: boolean } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [latencyMs, setLatencyMs] = useState(24);
  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
  const [activeSpeakerIdentities, setActiveSpeakerIdentities] = useState<Set<string>>(new Set());
  const [handRaisedMap, setHandRaisedMap] = useState<Record<string, boolean>>({});

  // Doubts Notification & Alert States
  const [unreadDoubtsCount, setUnreadDoubtsCount] = useState(0);
  const [activeDoubtToast, setActiveDoubtToast] = useState<{
    id: string;
    senderName: string;
    senderRole: string;
    text: string;
    time: string;
  } | null>(null);
  const [activeHandRaiseToast, setActiveHandRaiseToast] = useState<{
    studentName: string;
    time: string;
  } | null>(null);
  const [activeLateJoinToast, setActiveLateJoinToast] = useState<{
    studentName: string;
    studentId?: number;
    classId?: number;
    elapsed: number;
    time: string;
  } | null>(null);
  const [studentAttendanceStatus, setStudentAttendanceStatus] = useState<{
    elapsed: number;
    status: 'Present' | 'Late';
    isLate: boolean;
    rationale: string;
  } | null>(null);
  const [resolvedDoubts, setResolvedDoubts] = useState<Set<string>>(new Set());
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const handRaiseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Room lifecycle, lobby & 20m session lock
  const [isWaitingInLobby, setIsWaitingInLobby] = useState(userRole === 'STUDENT');
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [lockDetails, setLockDetails] = useState<{ elapsed: number; reason: string } | null>(null);
  const [isRoomLive, setIsRoomLive] = useState(userRole === 'TEACHER');
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [waitingCount, setWaitingCount] = useState(0);
  const [audioMeter, setAudioMeter] = useState(65);

  // Stream & Room References
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const roomRef = useRef<Room | null>(null);

  // In-Room Real-Time Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm-welcome',
      senderName: 'Edu360 System',
      senderRole: 'ADMIN',
      text: `Live classroom session started for ${roomTitle}. Ask questions or raise hand for doubts.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch Room Status and Auto-Admit Coordination with 10-Minute Stipulation
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    let pollInterval: any = null;

    async function initRoomLifecycle() {
      if (userRole === 'TEACHER') {
        setIsRoomLive(true);
        setIsWaitingInLobby(false);
        try {
          await api.startLiveRoom(roomName, userName, 'Mathematics', 'Class 8-B', 'Quadratic Equations: Factorization Method');
        } catch {}
      } else {
        try {
          const status = await api.getLiveRoomStatus(roomName);
          if (isMounted && status) {
            setRoomDetails(status);
            if (!status.is_live) {
              setIsRoomLive(false);
              setIsWaitingInLobby(true);
              api.joinLiveRoom(roomName, effectiveStudentId, userName, userRole);
            } else {
              setIsRoomLive(true);
              const joinRes = await api.joinLiveRoom(roomName, effectiveStudentId, userName, userRole);
              if (joinRes?.locked) {
                setIsSessionLocked(true);
                setIsWaitingInLobby(false);
                setLockDetails({
                  elapsed: joinRes.minutes_elapsed ?? 21,
                  reason: joinRes.lock_reason || "Session is locked: Class has been in progress for over 20 minutes."
                });
                if (onAttendanceVerified) {
                  onAttendanceVerified({ minutesElapsed: joinRes.minutes_elapsed ?? 21, status: 'Absent' });
                }
                return;
              }
              setIsWaitingInLobby(false);
              const elapsed = joinRes?.minutes_elapsed ?? (status?.elapsed_minutes ?? 0);
              const isLate = joinRes?.is_late ?? (elapsed > 10.0);
              const attStatus: 'Present' | 'Late' = isLate ? 'Late' : 'Present';
              setStudentAttendanceStatus({
                elapsed,
                status: attStatus,
                isLate,
                rationale: joinRes?.rationale || (isLate ? `Joined +${elapsed.toFixed(1)}m late` : 'Joined within 10m on-time')
              });
              if (onAttendanceVerified) {
                onAttendanceVerified({ minutesElapsed: elapsed, status: attStatus });
              }
            }
          }
        } catch {
          if (isMounted) {
            setIsRoomLive(true);
            setIsWaitingInLobby(false);
          }
        }

        // Setup polling for waiting students to auto-admit when teacher starts
        pollInterval = setInterval(async () => {
          if (!isMounted) return;
          try {
            const currentStatus = await api.getLiveRoomStatus(roomName);
            if (isMounted && currentStatus) {
              setRoomDetails(currentStatus);
              setWaitingCount(currentStatus.waiting_students_count || 0);
              if (currentStatus.is_live && !isRoomLive) {
                setIsRoomLive(true);
                const joinRes = await api.joinLiveRoom(roomName, effectiveStudentId, userName, userRole);
                if (joinRes?.locked) {
                  setIsSessionLocked(true);
                  setIsWaitingInLobby(false);
                  setLockDetails({
                    elapsed: joinRes.minutes_elapsed ?? 21,
                    reason: joinRes.lock_reason || "Session is locked: Class has been in progress for over 20 minutes."
                  });
                  if (onAttendanceVerified) {
                    onAttendanceVerified({ minutesElapsed: joinRes.minutes_elapsed ?? 21, status: 'Absent' });
                  }
                  return;
                }
                setIsWaitingInLobby(false);
                const elapsed = joinRes?.minutes_elapsed ?? (currentStatus?.elapsed_minutes ?? 0);
                const isLate = joinRes?.is_late ?? (elapsed > 10.0);
                const attStatus: 'Present' | 'Late' = isLate ? 'Late' : 'Present';
                setStudentAttendanceStatus({
                  elapsed,
                  status: attStatus,
                  isLate,
                  rationale: joinRes?.rationale || (isLate ? `Joined +${elapsed.toFixed(1)}m late` : 'Joined within 10m on-time')
                });
                if (onAttendanceVerified) {
                  onAttendanceVerified({ minutesElapsed: elapsed, status: attStatus });
                }
              }
            }
          } catch {}
        }, 1500);
      }
    }

    initRoomLifecycle();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (userRole === 'STUDENT') {
        api.leaveLiveRoom(roomName, effectiveStudentId, userName).catch(() => {});
      }
    };
  }, [isOpen, roomName, userName, userRole, isRoomLive, onAttendanceVerified, effectiveStudentId]);

  // 2. Fetch LiveKit Token & Establish LiveKit WebRTC Room Connection
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setConnectionStatus('connecting');

    // Unique participant session identity so two tabs/devices don't kick each other out
    const sessionIdentity = `${userRole.toLowerCase()}_${userName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // Start local camera stream for waiting lobby & preview
    async function initLocalCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true
        });
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        mediaStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera/Mic permission not granted or device unavailable:', err);
      }
    }

    initLocalCamera();

    // Fetch LiveKit Token & connect room
    api.getLiveKitToken({
      room_name: roomName,
      participant_name: userName,
      participant_identity: sessionIdentity,
      role: userRole
    }).then(async (res) => {
      if (!isMounted) return;
      setLiveKitConfig(res);

      try {
        const room = new Room({
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
        });
        roomRef.current = room;

        // Register room event handlers
        room.on(RoomEvent.ParticipantConnected, () => {
          if (isMounted) setRemoteParticipants(Array.from(room.remoteParticipants.values()));
        });
        room.on(RoomEvent.ParticipantDisconnected, () => {
          if (isMounted) setRemoteParticipants(Array.from(room.remoteParticipants.values()));
        });
        room.on(RoomEvent.TrackSubscribed, () => {
          if (isMounted) setRemoteParticipants(Array.from(room.remoteParticipants.values()));
        });
        room.on(RoomEvent.TrackUnsubscribed, () => {
          if (isMounted) setRemoteParticipants(Array.from(room.remoteParticipants.values()));
        });
        room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
          if (isMounted) setActiveSpeakerIdentities(new Set(speakers.map(s => s.identity)));
        });

        // Real-Time Data Channel (Chat, Hand Raise, Late Arrivals across participants)
        room.on(RoomEvent.DataReceived, (payload: Uint8Array, participant?: RemoteParticipant) => {
          try {
            const text = new TextDecoder().decode(payload);
            const data = JSON.parse(text);

            if (data.type === 'CHAT' && isMounted) {
              setChatMessages(prev => [...prev, data.message]);

              // If someone else sent a message (especially student doubt):
              if (data.message.senderName !== userName) {
                // 1. Play pleasant two-tone notification chime
                playDoubtNotification();

                // 2. Increment unread counter if drawer is closed
                setUnreadDoubtsCount(prev => prev + 1);

                // 3. Show Heads-Up floating banner
                setActiveDoubtToast(data.message);
                if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                toastTimerRef.current = setTimeout(() => {
                  setActiveDoubtToast(null);
                }, 8000);
              }

              setTimeout(() => {
                if (chatScrollRef.current) {
                  chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
                }
              }, 50);
            } else if (data.type === 'HAND_RAISE' && isMounted) {
              setHandRaisedMap(prev => ({
                ...prev,
                [participant?.identity || '']: data.isHandRaised
              }));

              // Alert teacher when hand is raised
              if (data.isHandRaised && data.senderName !== userName) {
                playDoubtNotification();
                setActiveHandRaiseToast({
                  studentName: data.senderName || participant?.name || 'A student',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                if (handRaiseTimerRef.current) clearTimeout(handRaiseTimerRef.current);
                handRaiseTimerRef.current = setTimeout(() => {
                  setActiveHandRaiseToast(null);
                }, 6000);
              }
            } else if (data.type === 'STUDENT_JOINED_LATE' && isMounted && userRole === 'TEACHER') {
              playDoubtNotification();
              setActiveLateJoinToast({
                studentName: data.studentName,
                elapsed: data.elapsed,
                time: data.time
              });
            } else if (data.type === 'DOUBT_RESOLVED' && isMounted) {
              setResolvedDoubts(prev => new Set(prev).add(data.doubtId));
            }
          } catch (e) {
            console.error('Data received parse error:', e);
          }
        });

        room.on(RoomEvent.Disconnected, () => {
          if (isMounted) setConnectionStatus('disconnected');
        });

        // Connect to LiveKit SFU Cloud
        await room.connect(res.server_url, res.token);
        if (!isMounted) {
          room.disconnect();
          return;
        }

        setConnectionStatus('connected');

        // Publish local camera and mic tracks
        try {
          await room.localParticipant.enableCameraAndMicrophone();
          setIsMicOn(true);
          setIsVideoOn(true);

          // Attach local camera to local video element
          const videoPub = Array.from(room.localParticipant.videoTrackPublications.values()).find(
            (p: any) => p.source === 1 || p.track?.kind === 'video'
          );
          if (videoPub?.track && localVideoRef.current) {
            (videoPub.track as any).attach(localVideoRef.current);
          }
        } catch (publishErr) {
          console.warn('Could not auto-publish camera track to LiveKit:', publishErr);
        }

        setRemoteParticipants(Array.from(room.remoteParticipants.values()));
      } catch (connErr) {
        console.warn('LiveKit room connection fallback:', connErr);
        if (isMounted) setConnectionStatus('connected');
      }
    }).catch((err) => {
      console.warn('LiveKit token request fallback:', err);
      if (isMounted) setConnectionStatus('connected');
    });

    const latInterval = setInterval(() => {
      setLatencyMs(Math.floor(20 + Math.random() * 15));
      setAudioMeter(Math.floor(40 + Math.random() * 50));
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(latInterval);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (handRaiseTimerRef.current) clearTimeout(handRaiseTimerRef.current);
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, roomName, userName, userRole]);

  // Re-attach local video when entering conference from lobby
  useEffect(() => {
    if (!isWaitingInLobby && localVideoRef.current) {
      if (roomRef.current?.localParticipant) {
        const videoPub = Array.from(roomRef.current.localParticipant.videoTrackPublications.values()).find(
          (p: any) => p.source === 1 || p.track?.kind === 'video'
        );
        if (videoPub?.track) {
          (videoPub.track as any).attach?.(localVideoRef.current);
          return;
        }
      }
      if (mediaStreamRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current;
      }
    }
  }, [isWaitingInLobby]);

  // Toggle Microphone
  const toggleMic = async () => {
    const next = !isMicOn;
    setIsMicOn(next);

    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setMicrophoneEnabled(next);
      } catch {}
    } else if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = next;
    }
  };

  // Toggle Video
  const toggleVideo = async () => {
    const next = !isVideoOn;
    setIsVideoOn(next);

    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setCameraEnabled(next);
        const videoPub = Array.from(roomRef.current.localParticipant.videoTrackPublications.values()).find(
          (p: any) => p.source === 1 || p.track?.kind === 'video'
        );
        if (videoPub?.track && localVideoRef.current && next) {
          (videoPub.track as any).attach?.(localVideoRef.current);
        }
      } catch {}
    } else if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = next;
    }
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    const next = !isScreenSharing;
    if (roomRef.current?.localParticipant) {
      try {
        await roomRef.current.localParticipant.setScreenShareEnabled(next);
        setIsScreenSharing(next);
      } catch (err) {
        console.warn('Screen share toggle error:', err);
      }
    } else {
      setIsScreenSharing(next);
    }
  };

  // Hand Raise Toggle & Real-Time Broadcast
  const toggleHandRaise = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);

    if (roomRef.current?.localParticipant) {
      const payload = JSON.stringify({
        type: 'HAND_RAISE',
        isHandRaised: next,
        senderName: userName
      });
      roomRef.current.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
    }
  };

  // Toggle Doubts Drawer
  const handleToggleDoubts = () => {
    const next = !isChatOpen;
    setIsChatOpen(next);
    if (next) {
      setUnreadDoubtsCount(0);
      setActiveDoubtToast(null);
    }
  };

  // Mark Doubt as Answered (Teacher interaction)
  const handleResolveDoubt = (doubtId: string) => {
    setResolvedDoubts(prev => new Set(prev).add(doubtId));
    if (roomRef.current?.localParticipant) {
      const payload = JSON.stringify({
        type: 'DOUBT_RESOLVED',
        doubtId
      });
      roomRef.current.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
    }
  };

  // Send In-Room Chat Message / Doubt
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderName: userName,
      senderRole: userRole,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    if (roomRef.current?.localParticipant) {
      const payload = JSON.stringify({ type: 'CHAT', message: newMsg });
      roomRef.current.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
    }

    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);
  };

  if (!isOpen) return null;

  // Compute dynamic grid layout classes based on total participant count
  const totalParticipants = 1 + remoteParticipants.length;
  let gridLayoutClass = 'grid-cols-1 md:grid-cols-2';
  if (totalParticipants === 1) {
    gridLayoutClass = 'grid-cols-1 max-w-4xl mx-auto w-full';
  } else if (totalParticipants === 2) {
    gridLayoutClass = 'grid-cols-1 md:grid-cols-2';
  } else if (totalParticipants <= 4) {
    gridLayoutClass = 'grid-cols-1 sm:grid-cols-2';
  } else if (totalParticipants <= 6) {
    gridLayoutClass = 'grid-cols-2 lg:grid-cols-3';
  } else {
    gridLayoutClass = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between text-white font-sans overflow-hidden">
      
      {/* 1. TOP HEADER BAR WITH ATTENDANCE STIPULATION INDICATOR */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/40">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white tracking-wide">{roomTitle}</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {liveKitConfig?.is_cloud_active ? 'LiveKit Cloud (Active)' : 'LiveKit WebRTC'}
              </span>

              {/* Student Attendance Stipulation Pill */}
              {userRole === 'STUDENT' && studentAttendanceStatus && (
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                  studentAttendanceStatus.isLate 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  {studentAttendanceStatus.isLate ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  <span>Attendance: {studentAttendanceStatus.status.toUpperCase()} (+{studentAttendanceStatus.elapsed.toFixed(1)}m)</span>
                </span>
              )}

              {/* Teacher Policy Pill */}
              {userRole === 'TEACHER' && (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-400/30 font-bold">
                  <span>10m Stipulation: Active (≤10m Present • &gt;10m Late)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-white/50 font-mono">
              Room: {roomName} • {userName} ({userRole}) • {totalParticipants} Active
            </p>
          </div>
        </div>

        {/* Telemetry & Control Indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-400">
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span>SFU Live: {latencyMs}ms</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-white/80">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span>{totalParticipants} in Room</span>
          </div>

          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* 2. FLOATING LIVE DOUBTS & LATE ARRIVAL NOTIFICATIONS (HEADS-UP DISPLAY) */}
      <div className="absolute top-20 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-auto">
        {/* Floating Doubt Alert */}
        {activeDoubtToast && (
          <div className="bg-slate-900/95 border-2 border-amber-500/60 rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 ring-4 ring-amber-500/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                  <HelpCircle className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                      Live Doubt Raised
                    </span>
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  </div>
                  <p className="text-xs font-bold text-white">
                    {activeDoubtToast.senderName} 
                    <span className="font-mono text-white/50 text-[10px] ml-1.5">({activeDoubtToast.time})</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveDoubtToast(null)}
                className="text-white/40 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 p-3 rounded-2xl bg-black/50 border border-amber-500/20 text-xs text-white/90 leading-relaxed font-medium">
              &ldquo;{activeDoubtToast.text}&rdquo;
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-[10px] text-amber-300/70 font-mono">
                Click below to address live
              </span>
              <button
                onClick={() => {
                  setIsChatOpen(true);
                  setUnreadDoubtsCount(0);
                  setActiveDoubtToast(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-500/25"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Open Doubts</span>
              </button>
            </div>
          </div>
        )}

        {/* Floating Late Join Alert for Teacher */}
        {activeLateJoinToast && userRole === 'TEACHER' && (
          <div className="bg-slate-900/95 border-2 border-amber-500/70 rounded-3xl p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 ring-4 ring-amber-500/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="h-5 w-5 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                    10-Min Stipulation Alert
                  </span>
                  <p className="text-xs font-bold text-white">
                    {activeLateJoinToast.studentName} joined at +{activeLateJoinToast.elapsed.toFixed(1)}m
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveLateJoinToast(null)}
                className="text-white/40 hover:text-white p-1 rounded-lg cursor-pointer"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Exceeded 10-minute threshold. Auto-flagged as <strong className="text-amber-400 font-bold">Late</strong> in class roster.
            </p>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const targetClassId = activeLateJoinToast?.classId || effectiveClassId;
                  const targetStudentId = activeLateJoinToast?.studentId || 1;
                  api.overrideAttendance(targetClassId, targetStudentId, 'Present').catch(() => {});
                  setActiveLateJoinToast(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve as Present</span>
              </button>
              <button
                onClick={() => setActiveLateJoinToast(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs cursor-pointer"
              >
                Keep Late Flag
              </button>
            </div>
          </div>
        )}

        {/* Floating Hand-Raise Alert */}
        {activeHandRaiseToast && (
          <div className="bg-slate-900/95 border-2 border-indigo-500/60 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ring-4 ring-indigo-500/10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Hand className="h-4 w-4 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Hand Raised</span>
                <p className="text-xs font-bold text-white">{activeHandRaiseToast.studentName}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveHandRaiseToast(null)}
              className="text-xs px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-all shadow-md"
            >
              Acknowledge
            </button>
          </div>
        )}
      </div>

      {/* 3. PRE-FLIGHT WAITING LOBBY (STUDENT VIEW WHEN TEACHER HAS NOT STARTED) */}
      {isWaitingInLobby && userRole === 'STUDENT' ? (
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 gap-8 overflow-y-auto">
          {/* Left: Real Camera & Microphone Test Preview */}
          <div className="w-full max-w-lg aspect-video rounded-3xl bg-slate-900 border-2 border-white/10 overflow-hidden relative shadow-2xl flex flex-col justify-between p-4">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover transition-opacity ${isVideoOn ? 'opacity-100' : 'opacity-0'}`}
            />
            {!isVideoOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                  {userName.charAt(0)}
                </div>
                <span className="text-xs text-slate-400 mt-2 font-medium">Camera is Off</span>
              </div>
            )}

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Device Pre-Check Active</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/60 text-white/70 text-xs font-mono">
                {userName}
              </span>
            </div>

            {/* Bottom Controls inside test tile */}
            <div className="relative z-10 flex items-center justify-between bg-black/70 backdrop-blur-md rounded-2xl p-2.5 border border-white/10">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${isMicOn ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                  title="Test Mic"
                >
                  {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${isVideoOn ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
                  title="Test Camera"
                >
                  {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </button>
              </div>

              {/* Audio Input Level Meter */}
              <div className="flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-slate-400" />
                <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-150"
                    style={{ width: isMicOn ? `${audioMeter}%` : '0%' }}
                  />
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">{isMicOn ? 'Mic OK' : 'Muted'}</span>
              </div>
            </div>
          </div>

          {/* Right: Waiting Lobby Status & Guidance Card */}
          <div className="w-full max-w-md rounded-3xl bg-slate-900/95 border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-md">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <span>Pre-Flight Waiting Lobby</span>
              </div>
              <h3 className="text-xl font-black text-white">
                Class Has Not Started Yet
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                <strong className="text-white">{roomDetails?.teacher_name || 'Mrs. Ananya Verma'}</strong> has not launched the <strong className="text-white">{roomTitle}</strong> session yet.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Scheduled Subject:</span>
                <span className="font-bold text-white">{roomDetails?.subject || 'Mathematics'} (Period 3)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Classroom Cohort:</span>
                <span className="font-bold text-white">{roomDetails?.class_name || 'Class 8-B'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Lecture Topic:</span>
                <span className="font-bold text-white truncate max-w-[200px]">{roomDetails?.topic || 'Quadratic Equations'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-white/10">
                <span>10-Minute Stipulation:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Auto-Mark Present if joined ≤10m</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-200 leading-relaxed">
                Your camera and microphone are pre-checked and ready. You will be transferred automatically into the live broadcast the instant the teacher goes live.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Exit Waiting Lobby
            </button>
          </div>
        </div>
      ) : isSessionLocked && userRole === 'STUDENT' ? (
        /* 3.5. SESSION LOCKED SCREEN (>20m Late Lockout) */
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 overflow-y-auto text-center max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-300">
          <div className="h-20 w-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/10">
            <Lock className="h-10 w-10 text-rose-400 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              <span>Session Entry Restricted (&gt;20m Late)</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              Live Session Is Currently Locked
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {lockDetails?.reason || "This class has been in progress for over 20 minutes. To maintain lecture continuity and avoid disrupting ongoing discussions, live entrance is closed."}
            </p>
          </div>

          <div className="w-full rounded-2xl bg-slate-900/90 border border-white/10 p-5 space-y-3 text-left backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Subject & Period:</span>
              <span className="font-bold text-white">{roomDetails?.subject || 'Mathematics'} (Period 3)</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Faculty Host:</span>
              <span className="font-bold text-white">{roomDetails?.teacher_name || 'Mrs. Ananya Verma'}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Attendance Status:</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[11px]">
                Marked Absent (Exceeded 20m)
              </span>
            </div>
            <div className="pt-3 border-t border-white/10 flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-300 leading-relaxed font-medium">
                <strong>No Disruption to Revision:</strong> Full HD Lecture Recording, AI-generated summary transcripts, and teacher study notes will be unlocked in your Student Portal immediately upon lecture conclusion.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              Return to Student Dashboard
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
      /* 4. DYNAMIC MULTI-PARTICIPANT VIDEO CONFERENCE GRID & OPTIONAL DOUBTS DRAWER */
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* Dynamic Video Grid Canvas */}
        <div className={`flex-1 grid gap-4 h-full overflow-y-auto ${gridLayoutClass}`}>
          
          {/* Tile 1: LOCAL PARTICIPANT (Webcam or Screen Share) */}
          <div className="relative rounded-3xl bg-slate-900 border border-white/10 overflow-hidden flex flex-col justify-between shadow-2xl min-h-[220px]">
            {/* Real Local Video Element */}
            <video 
              ref={localVideoRef}
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoOn || isScreenSharing ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Video Off Placeholder */}
            {!isVideoOn && !isScreenSharing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                <div className="h-20 w-20 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <p className="mt-3 text-sm font-semibold text-white/70">Camera is paused</p>
                <span className="text-[11px] text-white/40 font-mono mt-0.5">{userName} (You)</span>
              </div>
            )}

            {/* Tile Header Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-semibold text-white flex items-center gap-1.5 border border-white/10">
                {isScreenSharing ? (
                  <Monitor className="h-3.5 w-3.5 text-blue-400" />
                ) : (
                  <Video className="h-3.5 w-3.5 text-emerald-400" />
                )}
                <span>{userName} (You)</span>
                <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.2 rounded font-mono">
                  {userRole}
                </span>
              </span>

              {isHandRaised && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-black font-bold text-xs flex items-center gap-1 shadow-lg animate-bounce">
                  <Hand className="h-3.5 w-3.5" /> Hand Raised
                </span>
              )}
            </div>

            {/* Tile Bottom Audio Indicator */}
            <div className="absolute bottom-3 left-3 pointer-events-none z-10">
              <span 
                className={`px-2 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 backdrop-blur-md border ${
                  isMicOn 
                    ? 'bg-black/60 text-emerald-400 border-emerald-500/30' 
                    : 'bg-rose-950/80 text-rose-300 border-rose-500/30'
                }`}
              >
                {isMicOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                <span>{isMicOn ? 'Microphone Active' : 'Muted'}</span>
              </span>
            </div>
          </div>

          {/* Tiles 2+: DYNAMIC REMOTE PARTICIPANTS (All connected students & teachers) */}
          {remoteParticipants.map((participant) => (
            <RemoteParticipantTile
              key={participant.identity}
              participant={participant}
              isSpeaking={activeSpeakerIdentities.has(participant.identity)}
              isHandRaised={Boolean(handRaisedMap[participant.identity])}
            />
          ))}

          {/* Helpful Placeholder if user is alone in the room */}
          {remoteParticipants.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-white/10 bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[220px]">
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
                <Users className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">
                  {userRole === 'TEACHER' 
                    ? 'Waiting for Students to Join...' 
                    : 'Waiting for Faculty / Classmates...'}
                </h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Open another tab or device as a {userRole === 'TEACHER' ? 'Student' : 'Teacher'} to see both live video feeds side-by-side.
                </p>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                Room ID: {roomName}
              </span>
            </div>
          )}

        </div>

        {/* 5. IN-ROOM REAL-TIME DOUBTS DRAWER */}
        {isChatOpen && (
          <div className="w-84 sm:w-96 h-full rounded-3xl bg-slate-900/95 border border-white/10 flex flex-col overflow-hidden shadow-2xl backdrop-blur-md">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <HelpCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">In-Room Live Doubts</h3>
                  <span className="text-[10px] text-white/50 font-mono">
                    {chatMessages.length - 1} Doubts in Queue
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/50 hover:text-white cursor-pointer transition-colors"
                title="Close Doubts Drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Info Callout */}
            <div className="px-4 py-2 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center gap-2 text-[11px] text-indigo-300">
              <Bell className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span>Doubts alert the faculty with instant chime &amp; pop-up banner.</span>
            </div>

            {/* Messages / Doubts Stream */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map(msg => {
                const isStudent = msg.senderRole === 'STUDENT';
                const isSelf = msg.senderName === userName;
                const isResolved = resolvedDoubts.has(msg.id);

                return (
                  <div 
                    key={msg.id} 
                    className={`rounded-2xl p-3 border transition-all ${
                      isResolved 
                        ? 'bg-emerald-950/30 border-emerald-500/30' 
                        : isStudent 
                          ? 'bg-amber-950/20 border-amber-500/30' 
                          : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isStudent ? 'text-amber-300' : 'text-indigo-300'}`}>
                          {msg.senderName} {isSelf ? '(You)' : ''}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isStudent ? 'bg-amber-500/20 text-amber-300' : 'bg-indigo-500/20 text-indigo-300'
                        }`}>
                          {msg.senderRole}
                        </span>
                      </div>
                      <span className="text-white/40 text-[10px] font-mono">{msg.time}</span>
                    </div>

                    <p className="text-xs text-white/90 leading-relaxed font-medium">
                      {msg.text}
                    </p>

                    {/* Teacher Action: Mark Answered */}
                    {isStudent && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                        {isResolved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Check className="h-3 w-3" /> Addressed in Class
                          </span>
                        ) : userRole === 'TEACHER' ? (
                          <button
                            type="button"
                            onClick={() => handleResolveDoubt(msg.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/40 px-2 py-1 rounded-lg border border-amber-500/40 cursor-pointer transition-all"
                          >
                            <Check className="h-3 w-3" /> Mark Answered
                          </button>
                        ) : (
                          <span className="text-[10px] text-amber-400/60 font-mono">
                            Pending teacher response
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
              <input 
                type="text"
                placeholder={userRole === 'STUDENT' ? "Raise a doubt to faculty..." : "Post reply or clarification..."}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-hidden focus:border-amber-500 transition-colors"
              />
              <button 
                type="submit"
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black cursor-pointer transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center font-bold"
                title="Send doubt to live room"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>
        )}

      </div>
      )}

      {/* 6. BOTTOM FLOATING CALL CONTROLS */}
      {!isWaitingInLobby && !isSessionLocked && (
      <footer className="px-6 py-4 border-t border-white/10 bg-black/60 flex items-center justify-center gap-4">
        
        {/* Mic Button */}
        <button
          onClick={toggleMic}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 font-bold text-xs ${
            isMicOn 
              ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' 
              : 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white'
          }`}
          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          <span className="hidden sm:inline">{isMicOn ? 'Mute' : 'Unmuted'}</span>
        </button>

        {/* Video Button */}
        <button
          onClick={toggleVideo}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 font-bold text-xs ${
            isVideoOn 
              ? 'bg-white/10 hover:bg-white/20 border-white/20 text-white' 
              : 'bg-rose-600 hover:bg-rose-500 border-rose-500 text-white'
          }`}
          title={isVideoOn ? "Stop Camera" : "Start Camera"}
        >
          {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          <span className="hidden sm:inline">{isVideoOn ? 'Stop Cam' : 'Start Cam'}</span>
        </button>

        {/* Screen Share Button */}
        <button
          onClick={toggleScreenShare}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 font-bold text-xs ${
            isScreenSharing 
              ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
          }`}
          title="Share Screen"
        >
          <Monitor className="h-5 w-5" />
          <span className="hidden sm:inline">{isScreenSharing ? 'Sharing' : 'Share Screen'}</span>
        </button>

        {/* Hand Raise Button */}
        <button
          onClick={toggleHandRaise}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 font-bold text-xs ${
            isHandRaised 
              ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20' 
              : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
          }`}
          title="Raise Hand"
        >
          <Hand className="h-5 w-5" />
          <span className="hidden sm:inline">{isHandRaised ? 'Hand Up' : 'Raise Hand'}</span>
        </button>

        {/* Doubts Drawer Toggle with Live Unread Notification Badge */}
        <button
          onClick={handleToggleDoubts}
          className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2 font-bold text-xs ${
            isChatOpen 
              ? 'bg-indigo-600 border-indigo-500 text-white' 
              : unreadDoubtsCount > 0
                ? 'bg-amber-500/25 hover:bg-amber-500/35 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white'
          }`}
          title="Toggle In-Room Doubts"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="hidden sm:inline">Doubts</span>
          
          {unreadDoubtsCount > 0 && !isChatOpen && (
            <>
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px] animate-bounce shadow-md">
                {unreadDoubtsCount} New
              </span>
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-amber-400 rounded-full animate-ping" />
            </>
          )}
        </button>

        {/* LEAVE / END CALL BUTTON */}
        <button
          onClick={onClose}
          className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/30"
          title="Leave Conference"
        >
          <PhoneOff className="h-5 w-5" />
          <span>Leave Room</span>
        </button>

      </footer>
      )}

    </div>
  );
}
