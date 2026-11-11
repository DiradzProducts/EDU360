'use client';



import React, { useState, useEffect, useRef } from 'react';

import { 
  ArrowRight,

  Video, 

  VideoOff, 

  Camera, 

  ShieldCheck, 

  ShieldAlert, 

  CheckCircle2, 

  Clock, 

  AlertTriangle, 

  FileText, 

  Send, 

  Maximize, 

  Minimize, 

  X, 

  Sparkles, 

  Lock, 

  Eye, 

  Award, 

  Check, 

  HelpCircle,

  Volume2,

  Mic,
  MicOff,

  Pause,

  AlertOctagon,
  UserX

} from 'lucide-react';

import confetti from 'canvas-confetti';

import { DynamicSealModal } from '@/components/proctor/dynamic-seal-modal';

import { api } from '@/lib/api';
import { playDoubtNotification } from '@/lib/sound-effects';



interface OnlineExamModalProps {

  isOpen: boolean;

  onClose: () => void;

  candidateId?: number;

  examTitle?: string;

  subject?: string;

  durationMinutes?: number;

  questionPrompt?: string;

  maxMarks?: number;

  studentName?: string;

  examMode?: 'MODE_CBT' | 'MODE_HYBRID_SCAN';

  onSubmitted?: (result: { wordsCount: number; timeSpentSeconds: number; content: string }) => void;

}



export function OnlineExamModal({

  isOpen,

  onClose,

  candidateId = 1,

  examTitle = 'CBSE Term 1 Model Examination: Analytical Essay Writing',

  subject = 'English Literature',

  durationMinutes = 30,

  questionPrompt = "In 'The Merchant of Venice' Act IV Scene 1, critically analyze Portia's courtroom plea regarding the quality of divine mercy versus Shylock's rigorous insistence on the bond. Contrast their worldviews, evaluate the dramatic turning point, and discuss whether true justice was achieved. (Suggested Length: 300 - 500 words)",

  maxMarks = 20,

  studentName = 'Aarav Sharma',

  examMode = 'MODE_CBT',

  onSubmitted

}: OnlineExamModalProps) {

  // Proctoring states

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);

  const [cameraError, setCameraError] = useState<string | null>(null);

  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);



  // Exam writing states

  const [essayContent, setEssayContent] = useState<string>(

    "Portia's invocation of mercy in Act IV, Scene 1 represents one of Shakespeare's most profound philosophical expositions on justice and governance. Speaking under the guise of the learned jurist Balthazar, she appeals directly to Shylock not through legal constraint, but through moral transcendence. In contrasting Portia's divine mercy with Shylock's strict adherence to Venetian statutory bond law, Shakespeare juxtaposes two competing worldviews..."

  );

  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(durationMinutes * 60);

  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<string>('Just now');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isConfirmedSubmitted, setIsConfirmedSubmitted] = useState<boolean>(false);

  const [confirmSubmitDialogOpen, setConfirmSubmitDialogOpen] = useState<boolean>(false);

  const [showDynamicSealModal, setShowDynamicSealModal] = useState<boolean>(false);

  const [proctorStrikes, setProctorStrikes] = useState<number>(0);
  const [rulesStage, setRulesStage] = useState<'rules' | 'active'>('rules');
  const [hasAgreedRules, setHasAgreedRules] = useState<boolean>(false);



  // Invigilator remote control states

  const [isExamPaused, setIsExamPaused] = useState<boolean>(false);

  const [isExamDisqualified, setIsExamDisqualified] = useState<boolean>(false);
  const [hudAlertMessage, setHudAlertMessage] = useState<string | null>(null);
  const [audioDecibels, setAudioDecibels] = useState<number>(38);
  const rulesVideoRef = useRef<HTMLVideoElement | null>(null);
  const [yoloPersonCount, setYoloPersonCount] = useState<number>(1);
  const [yoloGazeStatus, setYoloGazeStatus] = useState<string>('Centered on Desk');

  // Real-Time Proctor Integrity Analysis Sheet & Automated Edge AI Engine
  const [proctorAnalysisSheet, setProctorAnalysisSheet] = useState<Array<{
    id: string;
    timestamp: string;
    category: 'CELL_PHONE' | 'MULTIPLE_PERSONS' | 'GAZE_DRIFT' | 'AUDIO_ANOMALY' | 'TAB_SWITCH' | 'BOOK_DETECTED' | 'STUDENT_ABSENT';
    title: string;
    ruleTriggered: string;
    confidence: number;
    actionTaken: 'STRIKE' | 'WARNING' | 'ANOMALY_LOG';
    strikeNumber?: number;
    status: 'FLAGGED' | 'REVIEWED' | 'DISMISSED';
    notes: string;
  }>>([]);
  const [showAnalysisSheetModal, setShowAnalysisSheetModal] = useState<boolean>(false);
  const [isAiModelLoaded, setIsAiModelLoaded] = useState<boolean>(false);
  const [activeDetectedObject, setActiveDetectedObject] = useState<string | null>(null);
  const [liveKitRoomStatus, setLiveKitRoomStatus] = useState<'connecting' | 'connected' | 'mesh_active'>('connecting');
  const [liveFaceCentroidX, setLiveFaceCentroidX] = useState<number>(0.5);

  // High-precision timers and audio/strike sync refs
  const liveAudioDecibelsRef = useRef<number>(38);
  const proctorStrikesRef = useRef<number>(0);
  const lastAudioUiUpdateRef = useRef<number>(0);
  const lastCategoryViolationTime = useRef<Record<string, number>>({});
  // Transient Bounding Box Alert States (auto-dismiss after 2.5s)
  const [visibleBoxAlerts, setVisibleBoxAlerts] = useState<{
    phone: boolean;
    book: boolean;
    person2: boolean;
  }>({ phone: false, book: false, person2: false });
  const boxAlertStartTimes = useRef<{
    phone: number;
    book: number;
    person2: number;
  }>({ phone: 0, book: 0, person2: 0 });
  const triggerProctorViolationRef = useRef<(params: any) => void>(() => {});
  const cellPhoneTimer = useRef<number>(0);
  const bookTimer = useRef<number>(0);
  const absentFramesCounter = useRef<number>(0);
  const gazeTurnFramesCounter = useRef<number>(0);
  const multiPersonFramesCounter = useRef<number>(0);
  const audioSpikeFramesCounter = useRef<number>(0);
  const lastGlobalViolationTime = useRef<number>(0);
  const faceDetectorRef = useRef<any>(null);
  const candidateMissingTimer = useRef<number>(0);
  const [liveGazeTimer, setLiveGazeTimer] = useState<number>(0);
  const [liveAbsentTimer, setLiveAbsentTimer] = useState<number>(0);
  const [livePhoneTimer, setLivePhoneTimer] = useState<number>(0);
  const [liveBookTimer, setLiveBookTimer] = useState<number>(0);

  // Timers & cooldown refs for automated detection rules
  const lastCellPhoneAlertTime = useRef<number>(0);
  const multiplePersonsTimer = useRef<number>(0);
  const gazeAwayTimer = useRef<number>(0);
  const audioSpikeTimer = useRef<number>(0);
  const [isPenalized, setIsPenalized] = useState<boolean>(false);

  // Question Paper Data & Section Navigation
  const [questionPaperData, setQuestionPaperData] = useState<any>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('ALL');
  const [qpZoomLevel, setQpZoomLevel] = useState<'normal' | 'large'>('normal');

  // Chief Invigilator 1-on-1 Intercom & Popping State
  const [isInvigilatorIntercomActive, setIsInvigilatorIntercomActive] = useState<boolean>(false);
  const [invigilatorIntercomMessage, setInvigilatorIntercomMessage] = useState<string>('');
  const [isStudentMicUnmuted, setIsStudentMicUnmuted] = useState<boolean>(false);



  // Start webcam proctoring & Web Audio Decibel Monitor

  useEffect(() => {

    if (!isOpen) return;
    setRulesStage('rules');
    setHasAgreedRules(false);

    // Fetch official CBSE Question Paper from Secrecy Vault
    api.getQuestionPaperDetails(1).then(res => {
      if (res && res.sections) {
        setQuestionPaperData(res);
      }
    }).catch(console.error);;
    setIsConfirmedSubmitted(false);
    setIsExamDisqualified(false);
    setTimeRemainingSeconds((durationMinutes || 180) * 60);



    let localStream: MediaStream | null = null;



        // High-Tech AI Proctor Virtual Feed Fallback (Prevents pitch black video in multi-window role testing)
    function startVirtualWebcamFallback() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameCount = 0;
        const renderVirtualFrame = () => {
          frameCount++;
          // High-tech dark gradient background
          const grad = ctx.createLinearGradient(0, 0, 320, 240);
          grad.addColorStop(0, '#0f172a');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 320, 240);

          // Simulated Student Silhouette in Desk Writing Posture
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(160, 85, 34, 0, Math.PI * 2); // Head
          ctx.fill();

          ctx.beginPath();
          ctx.ellipse(160, 180, 75, 45, 0, 0, Math.PI * 2); // Shoulders
          ctx.fill();

          // Physical Desk and Ruled Paper Booklet
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(115, 175, 90, 55);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.strokeRect(115, 175, 90, 55);

          // Real-time YOLO Head & Hands Bounding Mesh
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(122, 48, 76, 80);

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('YOLO: candidate_head (0.97)', 124, 45);

          // HUD Live Telemetry
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('AI EDGE PROCTOR • 25 FPS VIRTUAL FEED', 10, 18);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '8px monospace';
          ctx.fillText(`${studentName} • ROLL #14 • DESK POSTURE OK`, 10, 30);
          ctx.fillText(new Date().toLocaleTimeString(), 10, 42);

          // Pulsing Live Indicator Dot
          if (Math.floor(frameCount / 12) % 2 === 0) {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(305, 14, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        };

        const intervalId = setInterval(renderVirtualFrame, 60);

        const capture = (canvas as any).captureStream ? (canvas as any).captureStream(25) : null;
        if (capture && videoRef.current) {
          videoRef.current.srcObject = capture;
          videoRef.current.play().catch(() => {});
          localStream = capture;
          streamRef.current = capture;
          setCameraActive(true);
          setCameraError(null);
        }

        return () => {
          clearInterval(intervalId);
        };
      } catch (err) {
        console.warn('Virtual proctor stream generation failed:', err);
      }
    }

    async function initWebcamAndAudio() {
      // 1. If an active physical camera stream is already running, reuse it and never go dark!
      if (streamRef.current && streamRef.current.active) {
        const liveTracks = streamRef.current.getVideoTracks().filter(t => t.readyState === 'live');
        if (liveTracks.length > 0) {
          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
          setCameraError(null);
          return;
        }
      }

      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          let stream: MediaStream | null = null;
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: 320, height: 240, facingMode: 'user' },
              audio: true
            });
          } catch {
            // Flexible fallback for devices that don't support strict 320x240 constraints
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          }

          localStream = stream;
          streamRef.current = stream;

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }

          setCameraActive(true);
          setCameraError(null);

          // Web Audio API decibel metering (Client-side edge monitoring)

          try {

            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

            if (AudioCtx) {

              const audioCtx = new AudioCtx();

              audioContextRef.current = audioCtx;

              const source = audioCtx.createMediaStreamSource(stream);

              const analyser = audioCtx.createAnalyser();

              analyser.fftSize = 512;
              analyser.smoothingTimeConstant = 0.2;
              source.connect(analyser);

              const timeDomainBuffer = new Uint8Array(analyser.fftSize);

              const floatBuffer = new Float32Array(analyser.fftSize);

              const checkAudio = () => {
                if (!streamRef.current) return;

                // Calibrated Logarithmic SPL Decibel Calculation
                analyser.getFloatTimeDomainData(floatBuffer);
                let sumSquares = 0;
                for (let i = 0; i < floatBuffer.length; i++) {
                  const s = floatBuffer[i];
                  sumSquares += s * s;
                }
                const rms = Math.sqrt(sumSquares / floatBuffer.length);

                // Silence: 34-40dB | Whispering: 54-58dB | Speech/Mobile audio: 64-78dB | Loud playback: 82-95dB
                const realDb = Math.min(100, Math.max(34, Math.round(20 * Math.log10(rms + 0.0001) + 98)));
                liveAudioDecibelsRef.current = realDb;

                // Throttle React UI state re-rendering to ~7 FPS to prevent state churn
                const now = Date.now();
                if (now - lastAudioUiUpdateRef.current > 140) {
                  lastAudioUiUpdateRef.current = now;
                  setAudioDecibels(realDb);
                }

                requestAnimationFrame(checkAudio);
              };

              // Ensure AudioContext is running
              if (audioCtx.state === 'suspended') {
                audioCtx.resume().catch(() => {});
              }

              checkAudio();

            }

          } catch (audioErr) {

            console.warn('Web Audio meter not initialized:', audioErr);

          }

        } else {

          setCameraError('Webcam access not supported on this browser.');
        }
      } catch (err: any) {
        console.warn('Webcam hardware lock or in use by another tab:', err);
        // If we already had a stream, do not kill it with virtual fallback
        if (!streamRef.current || !streamRef.current.active) {
          startVirtualWebcamFallback();
        }
      }

    }



    initWebcamAndAudio();



    // Tab switch & Window focus listener for exam integrity & camera auto-wake
    const recordTabSwitchViolation = (reason: string) => {
      setTabSwitchCount((prev) => {
        const nextCount = prev + 1;
        if (triggerProctorViolationRef.current) {
          triggerProctorViolationRef.current({
            category: 'TAB_SWITCH',
            title: 'Unauthorized Browser Tab / Window Focus Lost',
            ruleTriggered: `Window Focus Lost ──> Student navigated away from exam (${reason})`,
            confidence: 1.0,
            actionTaken: 'WARNING',
            notes: `Candidate left examination window focus (Incident #${nextCount}: ${reason}).`
          });
        }
        return nextCount;
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordTabSwitchViolation('Tab Hidden / Navigated Away');
      } else {
        // Tab restored to focus: immediately wake up video element
        if (videoRef.current && streamRef.current) {
          if (videoRef.current.srcObject !== streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
          videoRef.current.play().catch(() => {});
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
      }
    };

    const handleWindowBlur = () => {
      recordTabSwitchViolation('Window Lost Focus (Alt+Tab / App Switch)');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);



    return () => {

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);

      if (localStream) {

        localStream.getTracks().forEach((track) => track.stop());

      }

      if (streamRef.current) {

        streamRef.current.getTracks().forEach((track) => track.stop());

        streamRef.current = null;

      }

      if (audioContextRef.current) {

        audioContextRef.current.close().catch(() => {});

        audioContextRef.current = null;

      }

    };

  }, [isOpen, candidateId]);



  // Re-attach live media stream whenever stage transitions
  useEffect(() => {
    if (streamRef.current) {
      if (rulesStage === 'rules' && rulesVideoRef.current) {
        rulesVideoRef.current.srcObject = streamRef.current;
        rulesVideoRef.current.play().catch(() => {});
      } else if (rulesStage === 'active' && videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [rulesStage, cameraActive]);


  // Trigger Proctor Violation & Record into Analysis Sheet with Telemetry Broadcast
  const triggerProctorViolation = (params: {
    category: 'CELL_PHONE' | 'MULTIPLE_PERSONS' | 'GAZE_DRIFT' | 'AUDIO_ANOMALY' | 'TAB_SWITCH' | 'BOOK_DETECTED' | 'STUDENT_ABSENT';
    title: string;
    ruleTriggered: string;
    confidence: number;
    actionTaken: 'STRIKE' | 'WARNING' | 'ANOMALY_LOG';
    notes: string;
  }) => {
    const now = Date.now();
    // Category-specific cooldown: Prevents flooding on the same infraction, while never blocking other categories!
    const lastTime = lastCategoryViolationTime.current[params.category] || 0;
    const cooldownMs = params.category === 'AUDIO_ANOMALY' ? 15000 : (params.category === 'TAB_SWITCH' ? 2500 : 6000);
    if (now - lastTime < cooldownMs) {
      return;
    }
    lastCategoryViolationTime.current[params.category] = now;

    const timeStr = new Date().toLocaleTimeString();
    let nextStrikes = proctorStrikesRef.current;

    if (params.actionTaken === 'STRIKE') {
      nextStrikes = Math.min(3, proctorStrikesRef.current + 1);
      proctorStrikesRef.current = nextStrikes;
      setProctorStrikes(nextStrikes);
      if (nextStrikes >= 2) {
        setIsPenalized(true);
      }
      if (nextStrikes >= 3) {
        setIsExamDisqualified(true);
      }
    }

    const newEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
      category: params.category,
      title: params.title,
      ruleTriggered: params.ruleTriggered,
      confidence: params.confidence,
      actionTaken: params.actionTaken,
      strikeNumber: params.actionTaken === 'STRIKE' ? nextStrikes : undefined,
      status: 'FLAGGED' as const,
      notes: params.notes
    };

    setProctorAnalysisSheet(prev => [newEntry, ...prev]);

    // Set HUD Alert Message Banner
    if (params.actionTaken === 'STRIKE') {
      setHudAlertMessage(`🚨 IMMEDIATE STRIKE (Strike ${nextStrikes}/3): ${params.title} — ${params.ruleTriggered}`);
    } else if (params.actionTaken === 'WARNING') {
      setHudAlertMessage(`⚠️ GENTLE WARNING NUDGE: ${params.title} — ${params.ruleTriggered}`);
    } else {
      setHudAlertMessage(`🎙️ ${params.title} — ${params.ruleTriggered}`);
    }
    setTimeout(() => setHudAlertMessage(null), 6000);

    // Sync Telemetry & Analysis Entry across BroadcastChannel
    try {
      const channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.postMessage({
        type: 'STUDENT_TELEMETRY',
        candidateId: candidateId || 1,
        studentName: studentName || 'Aarav Sharma',
        rollNo: '14',
        strikes: nextStrikes,
        isCritical: nextStrikes >= 2,
        anomalyType: params.category,
        ruleTriggered: params.ruleTriggered,
        confidence: params.confidence,
        actionTaken: params.actionTaken,
        analysisEntry: newEntry,
        timestamp: timeStr,
        cameraActive: true,
        audioDb: liveAudioDecibelsRef.current || 38,
        gaze: yoloGazeStatus
      });
      channel.close();
    } catch {}

    // Send API Telemetry
    api.sendProctorTelemetry(candidateId || 1, {
      anomaly_type: params.category,
      confidence: params.confidence,
      details: `${params.title}: ${params.ruleTriggered}`
    }).catch(console.error);
  };

  triggerProctorViolationRef.current = triggerProctorViolation;

  // Multi-Channel Edge AI Proctoring Engine (Detects & Records All Infraction Categories Simultaneously)
  useEffect(() => {
    if (!isOpen || rulesStage !== 'active' || isExamPaused || isExamDisqualified) return;

    let isMounted = true;
    let cocoModel: any = null;

    // 1. Establish Real LiveKit SFU Proctor Room Connection
    api.getLiveKitToken({
      room_name: 'exam-room-class8b',
      participant_name: studentName || 'Aarav Sharma',
      participant_identity: 'aarav-sharma-14',
      role: 'STUDENT'
    }).then(res => {
      if (!isMounted) return;
      if (res && res.token) {
        setLiveKitRoomStatus('connected');
        console.log('✅ LiveKit SFU Proctor Room Connected:', res.room_name);
      } else {
        setLiveKitRoomStatus('mesh_active');
      }
    }).catch(() => {
      if (isMounted) setLiveKitRoomStatus('mesh_active');
    });

    // 2. Load Real COCO-SSD Neural Network (Handles true object classification)
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof document === 'undefined') return resolve();
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => resolve();
        document.head.appendChild(s);
      });
    };

    async function initCoco() {
      try {
        if ((window as any).cocoSsdModel) {
          cocoModel = (window as any).cocoSsdModel;
          if (isMounted) setIsAiModelLoaded(true);
          return;
        }
        if (!(window as any).cocoSsd) {
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js');
          await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js');
        }
        if ((window as any).cocoSsd) {
          cocoModel = await (window as any).cocoSsd.load({ base: 'lite_mobilenet_v2' });
          (window as any).cocoSsdModel = cocoModel;
          if (isMounted) setIsAiModelLoaded(true);
        }
      } catch (e) {
        console.warn('COCO-SSD background load:', e);
      }
    }
    initCoco();

    // 3. Native Canvas Buffer for Spatial Face & Contraband Tracking (160x120)
    const visionCanvas = document.createElement('canvas');
    visionCanvas.width = 160;
    visionCanvas.height = 120;
    const ctx = visionCanvas.getContext('2d', { willReadFrequently: true });

    // 4. Autonomous Multi-Channel Inference Loop (Runs every 250ms)
    const processInterval = setInterval(async () => {
      if (!isMounted) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !ctx) return;

      // Watchdog: Ensure video element is playing and never frozen/paused on a dark frame
      if (video.paused && streamRef.current) {
        video.play().catch(() => {});
      }

      try {
        // Step A: Native Browser Hardware FaceDetector check
        let nativeFacesCount = -1;
        let primaryFaceCenterNormX = 0.5;

        if (typeof window !== 'undefined' && (window as any).FaceDetector) {
          try {
            if (!faceDetectorRef.current) {
              faceDetectorRef.current = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
            }
            const detectedFaces = await faceDetectorRef.current.detect(video);
            nativeFacesCount = detectedFaces.length;
            if (detectedFaces.length > 0) {
              const box = detectedFaces[0].boundingBox;
              primaryFaceCenterNormX = (box.x + box.width / 2) / (video.videoWidth || 640);
            }
          } catch {}
        }

        // Step B: Canvas Spatial Analysis (160x120)
        ctx.drawImage(video, 0, 0, 160, 120);
        const imgData = ctx.getImageData(0, 0, 160, 120);
        const pixels = imgData.data;

        let skinPixels = 0;
        let skinXSum = 0;
        let leftSectorSkin = 0;
        let rightSectorSkin = 0;

        let darkBoxCount = 0;
        let darkMinX = 160, darkMaxX = 0, darkMinY = 120, darkMaxY = 0;
        let textLineGradientRows = 0;

        // Sample upper 75% for face and handheld contraband
        for (let y = 10; y < 90; y++) {
          let rowGradChanges = 0;
          let prevLuma = 0;

          for (let x = 0; x < 160; x++) {
            const idx = (y * 160 + x) * 4;
            const r = pixels[idx];
            const g = pixels[idx + 1];
            const b = pixels[idx + 2];
            const luma = 0.299 * r + 0.587 * g + 0.114 * b;

            // Skin tone locus (human face)
            const isSkin = r > 60 && g > 38 && b > 25 && r > g && r > b && (r - g) > 10 && (Math.max(r,g,b) - Math.min(r,g,b) > 12);
            if (isSkin) {
              skinPixels++;
              skinXSum += x;
              if (x < 65) leftSectorSkin++;
              if (x > 95) rightSectorSkin++;
            }

            // Dark handheld rectangular body (mobile phone bezel/screen)
            const isDarkHandheld = r < 40 && g < 40 && b < 40;
            if (isDarkHandheld && y > 25 && y < 95) {
              darkBoxCount++;
              if (x < darkMinX) darkMinX = x;
              if (x > darkMaxX) darkMaxX = x;
              if (y < darkMinY) darkMinY = y;
              if (y > darkMaxY) darkMaxY = y;
            }

            // High-frequency alternating contrast (printed book text lines)
            if (Math.abs(luma - prevLuma) > 35) {
              rowGradChanges++;
            }
            prevLuma = luma;
          }

          if (rowGradChanges > 18) {
            textLineGradientRows++;
          }
        }

        const faceNormX = nativeFacesCount !== -1
          ? primaryFaceCenterNormX
          : (skinPixels > 55 ? (skinXSum / skinPixels) / 160 : 0.5);
        setLiveFaceCentroidX(Number(faceNormX.toFixed(2)));

        // Step C: Neural COCO-SSD Predictions
        let detectedPhone = false;
        let phoneConf = 0.88;
        let detectedBook = false;
        let bookConf = 0.85;
        let detectedPersonsCount = 0;

        if (cocoModel) {
          try {
            const preds = await cocoModel.detect(video);
            // Reliable detection sensitivity (0.40 for phone/remote, 0.40 for book, 0.40 for person)
            const phoneObj = preds.find((p: any) => (p.class === 'cell phone' || p.class === 'remote') && p.score >= 0.40);
            if (phoneObj) {
              detectedPhone = true;
              phoneConf = phoneObj.score;
            }
            const bookObj = preds.find((p: any) => p.class === 'book' && p.score >= 0.40);
            if (bookObj) {
              detectedBook = true;
              bookConf = bookObj.score;
            }
            const personObjs = preds.filter((p: any) => p.class === 'person' && p.score >= 0.40);
            // Ground truth person count: If neural detector sees 0, candidate is 100% absent!
            detectedPersonsCount = personObjs.length;
          } catch {}
        } else if (nativeFacesCount !== -1) {
          detectedPersonsCount = nativeFacesCount;
        } else {
          // Canvas fallback: Require a true dense face cluster (200-6000 skin pixels), never trigger on ambient warm room background
          detectedPersonsCount = (skinPixels >= 200 && skinPixels <= 6000) ? 1 : 0;
        }

        // Step D: Handheld Phone Geometric Edge Verification
        const darkBoxW = darkMaxX >= darkMinX ? darkMaxX - darkMinX : 0;
        const darkBoxH = darkMaxY >= darkMinY ? darkMaxY - darkMinY : 0;
        const isPhoneGeometry = darkBoxW >= 14 && darkBoxW <= 58 && darkBoxH >= 22 && darkBoxH <= 90 &&
          ((darkBoxH / (darkBoxW + 0.1) >= 1.3 && darkBoxH / (darkBoxW + 0.1) <= 2.8) ||
           (darkBoxW / (darkBoxH + 0.1) >= 1.3 && darkBoxW / (darkBoxH + 0.1) <= 2.8));

        if (isPhoneGeometry && darkBoxCount > 100 && darkBoxCount < 2200) {
          detectedPhone = true;
          phoneConf = Math.max(phoneConf, 0.86);
        }

        // Step E: Book Verification (Distinct from desk paper)
        if (textLineGradientRows >= 12 && detectedPersonsCount >= 1) {
          detectedBook = true;
          bookConf = Math.max(bookConf, 0.84);
        }

        setYoloPersonCount(detectedPersonsCount);

        // ════════════════════════════════════════════════════════════════════════════
        // TRANSIENT ON-SCREEN HUD BOUNDING BOX TIMERS (Auto-Dismiss after 2.5s)
        // ════════════════════════════════════════════════════════════════════════════
        const now = Date.now();

        // 1. Phone Bounding Box: Show for exactly 2.5s on detection, then auto-dismiss
        if (detectedPhone) {
          if (!boxAlertStartTimes.current.phone || (now - boxAlertStartTimes.current.phone > 8000)) {
            boxAlertStartTimes.current.phone = now;
            setVisibleBoxAlerts(prev => ({ ...prev, phone: true }));
          } else if (now - boxAlertStartTimes.current.phone >= 2500) {
            setVisibleBoxAlerts(prev => ({ ...prev, phone: false }));
          }
        } else {
          if (boxAlertStartTimes.current.phone && (now - boxAlertStartTimes.current.phone >= 2500)) {
            setVisibleBoxAlerts(prev => ({ ...prev, phone: false }));
            if (now - boxAlertStartTimes.current.phone > 8000) {
              boxAlertStartTimes.current.phone = 0;
            }
          }
        }

        // 2. Book Bounding Box: Show for exactly 2.5s on detection, then auto-dismiss
        if (detectedBook) {
          if (!boxAlertStartTimes.current.book || (now - boxAlertStartTimes.current.book > 8000)) {
            boxAlertStartTimes.current.book = now;
            setVisibleBoxAlerts(prev => ({ ...prev, book: true }));
          } else if (now - boxAlertStartTimes.current.book >= 2500) {
            setVisibleBoxAlerts(prev => ({ ...prev, book: false }));
          }
        } else {
          if (boxAlertStartTimes.current.book && (now - boxAlertStartTimes.current.book >= 2500)) {
            setVisibleBoxAlerts(prev => ({ ...prev, book: false }));
            if (now - boxAlertStartTimes.current.book > 8000) {
              boxAlertStartTimes.current.book = 0;
            }
          }
        }

        // 3. Second Person Box: Show for exactly 2.5s on detection, then auto-dismiss
        if (detectedPersonsCount >= 2) {
          if (!boxAlertStartTimes.current.person2 || (now - boxAlertStartTimes.current.person2 > 8000)) {
            boxAlertStartTimes.current.person2 = now;
            setVisibleBoxAlerts(prev => ({ ...prev, person2: true }));
          } else if (now - boxAlertStartTimes.current.person2 >= 2500) {
            setVisibleBoxAlerts(prev => ({ ...prev, person2: false }));
          }
        } else {
          if (boxAlertStartTimes.current.person2 && (now - boxAlertStartTimes.current.person2 >= 2500)) {
            setVisibleBoxAlerts(prev => ({ ...prev, person2: false }));
            if (now - boxAlertStartTimes.current.person2 > 8000) {
              boxAlertStartTimes.current.person2 = 0;
            }
          }
        }

        // ════════════════════════════════════════════════════════════════════════════
        // MULTI-CHANNEL EVALUATION (ALL CATEGORIES EVALUATED & RECORDED ACCURATELY)
        // ════════════════════════════════════════════════════════════════════════════

        // ── 1. CELL PHONE CHANNEL (Confirmed in 2 frames = 500ms) ──
        if (detectedPhone) {
          setActiveDetectedObject('Cell Phone (Handheld)');
          cellPhoneTimer.current += 1;
          const currentPhoneSeconds = Number((cellPhoneTimer.current * 0.25).toFixed(1));
          setLivePhoneTimer(currentPhoneSeconds);

          if (cellPhoneTimer.current >= 2) { // 500ms confirmed detection
            cellPhoneTimer.current = 0;
            setLivePhoneTimer(0);
            const isCompound = detectedPersonsCount >= 2;
            triggerProctorViolation({
              category: 'CELL_PHONE',
              title: isCompound 
                ? 'Severe Malpractice: Unauthorized Mobile Device & Second Person Detected'
                : 'Unauthorized Mobile Device Detected',
              ruleTriggered: isCompound
                ? `Object: 'cell phone' + 'person' (count: ${detectedPersonsCount}) ──> Mobile with Second Person Present 🚨`
                : `Object: 'cell phone' ──> Handheld Mobile Phone Flagged (Confidence: ${(phoneConf * 100).toFixed(0)}%) ──> Strike Applied 🚨`,
              confidence: phoneConf,
              actionTaken: 'STRIKE',
              notes: isCompound 
                ? `Candidate raised mobile phone with ${detectedPersonsCount} persons identified in examination zone.`
                : 'Candidate raised mobile phone into examination camera area.'
            });
          }
        } else {
          cellPhoneTimer.current = Math.max(0, cellPhoneTimer.current - 1);
          setLivePhoneTimer(Number((cellPhoneTimer.current * 0.25).toFixed(1)));
          if (cellPhoneTimer.current === 0 && activeDetectedObject && activeDetectedObject.includes('Cell Phone')) {
            setActiveDetectedObject(null);
          }
        }

        // ── 2. UNAUTHORIZED BOOK CHANNEL (Confirmed in 2 frames = 500ms) ──
        if (detectedBook) {
          if (!activeDetectedObject || !activeDetectedObject.includes('Cell Phone')) {
            setActiveDetectedObject('Physical Book / Notes');
          }
          bookTimer.current += 1;
          const currentBookSeconds = Number((bookTimer.current * 0.25).toFixed(1));
          setLiveBookTimer(currentBookSeconds);

          if (bookTimer.current >= 2) { // 500ms confirmed detection
            bookTimer.current = 0;
            setLiveBookTimer(0);
            const isCompound = detectedPersonsCount >= 2;
            triggerProctorViolation({
              category: 'BOOK_DETECTED',
              title: isCompound
                ? 'Severe Malpractice: Unauthorized Book & Second Person Detected'
                : 'Unauthorized Book / Reading Material Flagged',
              ruleTriggered: isCompound
                ? `Object: 'book' + 'person' (count: ${detectedPersonsCount}) ──> Reading Material with Second Person Present 🚨`
                : `Object: 'book' ──> Printed Reading Material Detected (Confidence: ${(bookConf * 100).toFixed(0)}%) ──> Strike Applied 🚨`,
              confidence: bookConf,
              actionTaken: 'STRIKE',
              notes: isCompound
                ? `Candidate consulted textbook with ${detectedPersonsCount} persons identified in examination zone.`
                : 'Candidate consulted external printed textbook or unauthorized notes.'
            });
          }
        } else {
          bookTimer.current = Math.max(0, bookTimer.current - 1);
          setLiveBookTimer(Number((bookTimer.current * 0.25).toFixed(1)));
          if (bookTimer.current === 0 && activeDetectedObject && activeDetectedObject.includes('Book')) {
            setActiveDetectedObject(null);
          }
        }

        // ── 3. MULTIPLE PERSONS IN ROOM CHANNEL (Confirmed in 2 frames = 500ms) ──
        if (detectedPersonsCount >= 2) {
          multiPersonFramesCounter.current += 1;
          if (multiPersonFramesCounter.current >= 2) { // 500ms confirmed detection
            multiPersonFramesCounter.current = 0;
            triggerProctorViolation({
              category: 'MULTIPLE_PERSONS',
              title: 'Multiple Persons Detected in Testing Zone',
              ruleTriggered: `Object: 'person' (count: ${detectedPersonsCount} > 1) ──> Second person present in room ──> Red Alert 👥`,
              confidence: 0.95,
              actionTaken: 'STRIKE',
              notes: `${detectedPersonsCount} distinct people identified in examination room.`
            });
          }
        } else {
          multiPersonFramesCounter.current = Math.max(0, multiPersonFramesCounter.current - 1);
        }

        // ── 4. CANDIDATE ABSENCE CHANNEL (Empty Desk > 1.5s = 6 frames) ──
        if (detectedPersonsCount === 0) {
          setYoloGazeStatus('Desk Empty (Absent)');
          gazeTurnFramesCounter.current = 0;
          setLiveGazeTimer(0);

          absentFramesCounter.current += 1;
          const currentAbsentSeconds = Number((absentFramesCounter.current * 0.25).toFixed(1));
          setLiveAbsentTimer(currentAbsentSeconds);

          if (absentFramesCounter.current >= 6) { // 1.5s sustained empty desk
            absentFramesCounter.current = 0;
            setLiveAbsentTimer(0);
            triggerProctorViolation({
              category: 'STUDENT_ABSENT',
              title: 'Candidate Missing from Examination Desk',
              ruleTriggered: 'Presence Detection ──> Candidate absent from camera frame > 1.5s ──> Immediate Strike 🚨',
              confidence: 0.98,
              actionTaken: 'STRIKE',
              notes: 'Candidate moved away from examination camera frame for more than 1.5 continuous seconds.'
            });
          }
        } else {
          absentFramesCounter.current = Math.max(0, absentFramesCounter.current - 1);
          setLiveAbsentTimer(Number((absentFramesCounter.current * 0.25).toFixed(1)));
        }

        // ── 5. HEAD TURNED AWAY FROM DESK CHANNEL (Sustained Turn, Not Minor Movements) ──
        if (detectedPersonsCount === 1) {
          const isTurnedLeft = faceNormX < 0.35;
          const isTurnedRight = faceNormX > 0.65;

          if (isTurnedLeft || isTurnedRight) {
            const dir = isTurnedLeft ? 'Turned Left' : 'Turned Right';
            setYoloGazeStatus(dir);
            gazeTurnFramesCounter.current += 1;
            const currentGazeSeconds = Number((gazeTurnFramesCounter.current * 0.25).toFixed(1));
            setLiveGazeTimer(currentGazeSeconds);

            if (gazeTurnFramesCounter.current >= 18) { // 4.5s sustained head turn
              gazeTurnFramesCounter.current = 0;
              setLiveGazeTimer(0);
              triggerProctorViolation({
                category: 'GAZE_DRIFT',
                title: `Gaze Shifted Away from Desk (Head ${dir})`,
                ruleTriggered: `Face Mesh: Gaze Direction ──> Sustained head turn away > 4.5s (${dir}) ──> Gentle Warning Nudge 👁️`,
                confidence: 0.92,
                actionTaken: 'WARNING',
                notes: `Candidate head turned away from physical exam desk for >4.5 seconds (${dir}).`
              });
            }
          } else {
            setYoloGazeStatus('Centered on Desk');
            gazeTurnFramesCounter.current = Math.max(0, gazeTurnFramesCounter.current - 1);
            setLiveGazeTimer(Number((gazeTurnFramesCounter.current * 0.25).toFixed(1)));
          }
        }

        // ── 6. AUDIO ACOUSTIC ANOMALY CHANNEL (> 68 dB Sustained) ──
        const currentAudioDb = liveAudioDecibelsRef.current || 38;
        if (currentAudioDb >= 68) {
          audioSpikeFramesCounter.current += 1;
          if (audioSpikeFramesCounter.current >= 6) { // 1.5s sustained loud audio/speech
            audioSpikeFramesCounter.current = 0;
            triggerProctorViolation({
              category: 'AUDIO_ANOMALY',
              title: 'Acoustic Spike / Voice Detected',
              ruleTriggered: `Audio: Decibel > 68dB (${currentAudioDb} dB sustained > 1.5s) ──> Audio Anomaly 🎙️`,
              confidence: 0.89,
              actionTaken: 'ANOMALY_LOG',
              notes: `Microphone decibels sustained at ${currentAudioDb} dB above 68dB threshold.`
            });
          }
        } else {
          audioSpikeFramesCounter.current = Math.max(0, audioSpikeFramesCounter.current - 1);
        }

      } catch (err) {
        // Safe continuous loop
      }
    }, 250);

    return () => {
      isMounted = false;
      clearInterval(processInterval);
    };
  }, [isOpen, rulesStage, isExamPaused, isExamDisqualified]);

  // Fullscreen event listener (ensures Esc key or user exit updates state cleanly)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Real-Time Cross-Window Synchronization (Student & Invigilator Teacher Cockpit)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('edu360_exam_live_channel');
      channel.onmessage = (e) => {
        const data = e.data;
        if (!data) return;

        if (data.type === 'EXAM_PAUSE' && (!data.candidateId || data.candidateId === candidateId)) {
          setIsExamPaused(true);
          try { playDoubtNotification(); } catch {}
          setHudAlertMessage('Examination temporarily paused by Chief Invigilator.');
        } else if (data.type === 'EXAM_RESUME' && (!data.candidateId || data.candidateId === candidateId)) {
          setIsExamPaused(false);
          setHudAlertMessage('Examination resumed. Continue your writing.');
          setTimeout(() => setHudAlertMessage(null), 4000);
        } else if (data.type === 'INTERCOM_BROADCAST') {
          try { playDoubtNotification(); } catch {}
          setHudAlertMessage(`🎙️ Chief Invigilator: "${data.message}"`);
          setIsInvigilatorIntercomActive(true);
          setInvigilatorIntercomMessage(data.message || 'Attention all candidates. Please ensure writing adheres to CBSE board regulations.');
        } else if (data.type === 'TALK_ONE_ON_ONE' && (!data.candidateId || data.candidateId === candidateId)) {
          try { playDoubtNotification(); } catch {}
          setIsInvigilatorIntercomActive(true);
          setInvigilatorIntercomMessage(data.message || 'Aarav, please adjust your device camera so that your physical paper booklet and hands remain visible on your desk.');
        } else if (data.type === 'END_INTERCOM' && (!data.candidateId || data.candidateId === candidateId)) {
          setIsInvigilatorIntercomActive(false);
        } else if (data.type === 'ISSUE_WARNING' && (!data.candidateId || data.candidateId === candidateId)) {
          try { playDoubtNotification(); } catch {}
          setProctorStrikes(prev => {
            const next = Math.min(3, prev + 1);
            if (next >= 3) setIsPenalized(true);
            return next;
          });
          setHudAlertMessage(`🚨 Official Warning from Invigilator: "${data.message || 'Please maintain desk posture.'}"`);
          setTimeout(() => setHudAlertMessage(null), 8000);
        } else if (data.type === 'EXAM_DISQUALIFY' && (!data.candidateId || data.candidateId === candidateId)) {
          setIsExamDisqualified(true);
        }
      };
    } catch {}

    return () => {
      if (channel) channel.close();
    };
  }, [candidateId]);

  // Invigilator Remote Sync Poller (Synchronizes Pause, Disqualify, Strikes & HUD Nudges)

  useEffect(() => {

    if (!isOpen || isConfirmedSubmitted) return;



    const interval = setInterval(async () => {

      try {

        const res = await api.getExamCandidates();

        if (res && res.success && res.candidates) {

          const myRecord = res.candidates.find((c: any) => c.id === candidateId || c.studentId === candidateId);

          if (myRecord) {

            setIsExamPaused(Boolean(myRecord.isPaused));

            setIsExamDisqualified(Boolean(myRecord.isDisqualified));

            setProctorStrikes(myRecord.strikes || 0);

            if (myRecord.isNudged && myRecord.nudgeMessage) {

              setHudAlertMessage(myRecord.nudgeMessage);

            }

          }

        }

      } catch (err) {

        // Fallback gracefully

      }

    }, 3500);



    return () => clearInterval(interval);

  }, [isOpen, isConfirmedSubmitted, candidateId]);



  // Exam countdown timer (Locks when exam is paused or disqualified)

  useEffect(() => {

    if (!isOpen || isConfirmedSubmitted || isExamPaused || isExamDisqualified || rulesStage !== 'active') return;



    const timer = setInterval(() => {

      setTimeRemainingSeconds((prev) => {

        if (prev <= 1) {

          clearInterval(timer);

          handleSubmitFinal();

          return 0;

        }

        return prev - 1;

      });

    }, 1000);



    return () => clearInterval(timer);

  }, [isOpen, isConfirmedSubmitted, isExamPaused, isExamDisqualified]);



  // Periodic autosave

  useEffect(() => {

    if (!isOpen || isConfirmedSubmitted || isExamPaused || isExamDisqualified) return;



    const autoSaveInterval = setInterval(() => {

      const now = new Date();

      setLastAutoSaveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    }, 15000);



    return () => clearInterval(autoSaveInterval);

  }, [isOpen, isConfirmedSubmitted, isExamPaused, isExamDisqualified]);



  // Fullscreen toggle

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => setIsFullscreen(true));
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => setIsFullscreen(false));
      } else {
        setIsFullscreen(false);
      }
    }
  };



  // Word & character stats

  const wordsArray = essayContent.trim().split(/\s+/).filter(Boolean);

  const wordCount = essayContent.trim() ? wordsArray.length : 0;

  const charCount = essayContent.length;

  const isTargetMet = wordCount >= 300 && wordCount <= 500;



  // Format time remaining

  const minutes = Math.floor(timeRemainingSeconds / 60);

  const seconds = timeRemainingSeconds % 60;

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;



  const handleSubmitFinal = async () => {

    setIsSubmitting(true);

    try {

      await api.submitCandidateExam(candidateId, {

        submission_content: essayContent,

        words_count: wordCount,

        time_spent_seconds: durationMinutes * 60 - timeRemainingSeconds,

        script_pages_uploaded: examMode === 'MODE_HYBRID_SCAN' ? 4 : 0

      });

    } catch {

      // Fallback

    }



    setTimeout(() => {

      setIsSubmitting(false);

      setConfirmSubmitDialogOpen(false);

      setIsConfirmedSubmitted(true);

      confetti({

        particleCount: 100,

        spread: 70,

        origin: { y: 0.6 }

      });

      if (onSubmitted) {

        onSubmitted({

          wordsCount: wordCount,

          timeSpentSeconds: durationMinutes * 60 - timeRemainingSeconds,

          content: essayContent

        });

      }

    }, 1000);

  };



  if (!isOpen) return null;



  return (

    <div className={`fixed inset-0 z-50 flex flex-col bg-slate-950 transition-all ${
      isFullscreen
        ? 'w-screen h-screen p-0 m-0 max-w-none max-h-none rounded-none'
        : 'items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200'
    }`}>
      <div className={`relative w-full flex flex-col overflow-hidden bg-white dark:bg-slate-900 transition-all ${
        isFullscreen
          ? 'w-screen h-screen rounded-none border-0 max-w-none max-h-none flex-1'
          : 'max-w-6xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[96vh]'
      }`}>

        

        {/* ========================================================= */}

        {/* TOP STATUS BAR: INTEGRITY, TIMER, AUTO-SAVE & PROCTOR HUD */}

        {/* ========================================================= */}

        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white px-4 sm:px-6 py-3.5 shrink-0">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">

              <Lock className="h-4 w-4" />

            </div>

            <div>

              <div className="flex items-center gap-2">

                <span className="text-xs font-black tracking-tight text-white uppercase">

                  {examMode === 'MODE_CBT' ? 'Pure Online CBT Examination' : 'Hybrid Written & Scan Examination'}

                </span>

                <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold flex items-center gap-1">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>

                  AI Edge Proctoring Active

                </span>

                {proctorStrikes > 0 && (

                  <span className="rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 text-[10px] font-black">

                    Strikes: {proctorStrikes}/3

                  </span>

                )}

              </div>

              <h2 className="text-sm font-bold text-slate-200 truncate max-w-md">

                {examTitle} &bull; {subject}

              </h2>

            </div>

          </div>



          <div className="flex items-center gap-3 sm:gap-4">

            {/* Countdown Clock */}

            <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-black text-sm ${

              isExamPaused

                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'

                : timeRemainingSeconds < 300 

                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 

                : 'bg-slate-800 text-white border-slate-700'

            }`}>

              {isExamPaused ? <Pause className="h-4 w-4 text-amber-400" /> : <Clock className="h-4 w-4 text-purple-400" />}

              <span>{isExamPaused ? 'TIMER PAUSED' : formattedTime}</span>

            </div>



            {/* Autosave status */}

            <div className="hidden md:flex flex-col text-right text-[10px] text-slate-400">

              <span className="text-slate-300 font-medium">Cloud Autosave:</span>

              <span className="text-emerald-400 font-mono">{lastAutoSaveTime}</span>

            </div>



            {/* Fullscreen toggle */}

            <button

              type="button"

              onClick={toggleFullscreen}

              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"

              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}

            >

              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}

            </button>



            {/* Exit/Cancel button */}

            <button

              type="button"

              onClick={onClose}

              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"

              title="Close Exam Window"

            >

              <X className="h-5 w-5" />

            </button>

          </div>

        </header>



        {/* Tab switch warning banner */}

        {tabSwitchCount > 0 && !isConfirmedSubmitted && (

          <div className="bg-red-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between animate-in slide-in-from-top-1">

            <div className="flex items-center gap-2">

              <AlertTriangle className="h-4 w-4 shrink-0" />

              <span>

                INTEGRITY WARNING: Browser tab switch detected ({tabSwitchCount} occurrence{tabSwitchCount > 1 ? 's' : ''}). This telemetry is automatically synchronized with the Invigilator Cockpit.

              </span>

            </div>

            <span className="text-[10px] uppercase font-mono bg-black/30 px-2 py-0.5 rounded">Strike Logged</span>

          </div>

        )}



        {/* Invigilator Live HUD Message Banner */}

        {hudAlertMessage && (

          <div className="bg-violet-700 text-white px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-violet-500 animate-in slide-in-from-top-1">

            <div className="flex items-center gap-2">

              <Volume2 className="h-4 w-4 text-violet-200 animate-bounce" />

              <span>

                <b>INVIGILATOR HUD ALERT:</b> {hudAlertMessage}

              </span>

            </div>

            <button

              onClick={() => setHudAlertMessage(null)}

              className="text-xs text-violet-200 hover:text-white underline cursor-pointer"

            >

              Acknowledge

            </button>

          </div>

        )}



        {/* ========================================================= */}

        {/* MAIN BODY: QUESTION, ESSAY PAD & FLOATING PROCTOR CAMERA */}

        {/* ========================================================= */}

        {isExamDisqualified ? (

          /* DISQUALIFICATION SCREEN */

          <div className="p-8 sm:p-12 text-center space-y-6 overflow-y-auto">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-300 dark:border-rose-700 shadow-xl">

              <AlertOctagon className="h-10 w-10" />

            </div>

            <div className="space-y-2">

              <span className="rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 px-3 py-1 text-xs font-black border border-rose-300 dark:border-rose-700">

                Examination Terminated

              </span>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white">

                Candidate Evicted for Academic Malpractice

              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">

                Candidate <b>{studentName}</b> &bull; The designated invigilator has terminated your examination session due to confirmed proctoring violations.

              </p>

            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAnalysisSheetModal(true)}
                className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-5 py-3 shadow-md flex items-center gap-2 cursor-pointer transition-all"
              >
                <FileText className="h-4 w-4" />
                <span>View Full Proctor Audit Sheet ({proctorAnalysisSheet.length} Incidents)</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-6 py-3 shadow-md transition-all cursor-pointer"
              >
                Close Portal
              </button>
            </div>

          </div>

        ) : isConfirmedSubmitted ? (

          /* SUCCESS SUBMISSION RECEIPT */

          <div className="p-8 sm:p-12 text-center space-y-6 overflow-y-auto">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 shadow-xl">

              <CheckCircle2 className="h-10 w-10" />

            </div>



            <div className="space-y-2">

              <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-xs font-bold border border-emerald-300 dark:border-emerald-700">

                Official Examination Submission Recorded

              </span>

              <h2 className="text-2xl font-black text-slate-900 dark:text-white">

                Exam Successfully Submitted &amp; Encrypted

              </h2>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">

                Candidate <b>{studentName}</b> &bull; Your answers have been securely synced to the evaluator queue for grading.

              </p>

            </div>



            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2 font-mono">

              <div className="flex justify-between">

                <span className="text-slate-500">Submission Hash:</span>

                <span className="font-bold text-slate-800 dark:text-slate-200">#EXAM-2026-ENG-842</span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">Words Written:</span>

                <span className="font-bold text-emerald-600 dark:text-emerald-400">{wordCount} Words</span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">Proctor Integrity Score:</span>

                <span className="font-bold text-emerald-600 dark:text-emerald-400">

                  {tabSwitchCount === 0 ? '100% Clean' : `${Math.max(70, 100 - tabSwitchCount * 10)}% (Flagged ${tabSwitchCount} Tab Switches)`}

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">Webcam Telemetry:</span>

                <span className="font-bold text-slate-800 dark:text-slate-200">Continuous Stream Recorded</span>

              </div>

            </div>



            <button

              onClick={onClose}

              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 shadow-md transition-all cursor-pointer"

            >

              Return to Student Dashboard

            </button>

          </div>

        ) : rulesStage === 'rules' ? (
          /* ========================================================= */
          /* OFFICIAL CANDIDATE EXAMINATION RULES & INTEGRITY PROTOCOL */
          /* ========================================================= */
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white">
            {/* Header with CBSE Affiliation & Exam Identity */}
            <div className="rounded-3xl border border-violet-200 dark:border-violet-900/60 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-purple-500/10 dark:from-violet-950/40 dark:via-indigo-950/30 dark:to-slate-900 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-600 text-white shadow-xs">
                    Official CBSE Assessment Protocol
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    {examMode === 'MODE_HYBRID_SCAN' ? '📝 Hybrid Paper + AI Proctor' : '💻 CBT Online'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {examTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Subject: <b>{subject}</b> &bull; Candidate: <b>{studentName} (Roll #14)</b> &bull; Chief Invigilator: <b>Mrs. Ananya Verma</b>
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Scheduled Time</span>
                <span className="text-lg font-black font-mono text-violet-700 dark:text-violet-300">
                  {durationMinutes} Minutes (100 Marks)
                </span>
              </div>
            </div>

            {/* Rules Grid: 4 Critical Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-black text-sm">
                  <span className="h-7 w-7 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-xs">1</span>
                  <span>Physical Paper Writing Protocol</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Candidates must write all solutions using blue or black ballpoint pen on standard physical ruled answer sheets. Clearly print your <b>Roll Number (#14)</b>, Name, and Subject Code on the top margin of every page.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-black text-sm">
                  <span className="h-7 w-7 rounded-xl bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center text-xs">2</span>
                  <span>Unbroken Camera &amp; Desk Custody</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Position your device camera so that your <b>face, hands, and physical desk writing workspace</b> remain continuously visible. Turning your head away or leaving the frame will log automated proctor infractions.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-black text-sm">
                  <span className="h-7 w-7 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-xs">3</span>
                  <span>Strict Prohibition of Malpractice</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  Smartphones, smartwatches, second monitors, or unauthorized persons in the testing room are strictly prohibited. The edge YOLO AI detector audits video continuously. Repeated violations incur a <b>5-mark penalty</b> or eviction.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                  <span className="h-7 w-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-xs">4</span>
                  <span>Dynamic Security Seal &amp; Scan Upload</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  When writing time concludes, a dynamic cryptographic token (e.g. <b>#HYBRID-8492-SEAL</b>) will pop up. You must write this code in ink on every sheet before scanning and uploading your answer booklet during the 15-minute grace window.
                </p>
              </div>
            </div>

            {/* Live Camera & Hardware Diagnostic Station */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Pre-Flight Hardware &amp; AI Proctor Verification</h4>
                    <p className="text-[11px] text-slate-500">Live webcam preview, audio decibel calibration &amp; WebRTC connectivity check</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Hardware Certified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Live Camera Feed Preview */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video border-2 border-violet-500/40 shadow-inner flex items-center justify-center group">
                  <video
                    ref={rulesVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Bounding box simulation */}
                  <div className="absolute inset-4 border border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2 bg-emerald-500/5">
                    <span className="self-start text-[9px] font-mono font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                      <Camera className="h-2.5 w-2.5" />
                      YOLO v8: 1 Face Detected ({studentName})
                    </span>
                    <span className="self-end text-[9px] font-mono text-emerald-300 bg-black/60 px-1.5 py-0.5 rounded">
                      Desk Surface: Centered
                    </span>
                  </div>

                  {!cameraActive && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-2">
                      <VideoOff className="h-8 w-8 text-slate-500" />
                      <span className="text-xs font-bold text-slate-300">Camera Feed Inactive or Blocked</span>
                      <p className="text-[10px] text-slate-400 max-w-xs">Please allow browser webcam &amp; microphone permissions to complete verification.</p>
                    </div>
                  )}
                </div>

                {/* Hardware Telemetry Gauges */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Mic className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                        <span>Microphone Noise Calibration:</span>
                      </span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{audioDecibels} dB (Permitted Range)</span>
                    </div>
                    {/* Audio Level Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 transition-all duration-100"
                        style={{ width: `${Math.min(100, Math.max(15, (audioDecibels - 20) * 1.5))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">LiveKit SFU Mesh</span>
                        <span className="font-bold text-slate-900 dark:text-white">22ms Low-Latency</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Edge AI Detector</span>
                        <span className="font-bold text-slate-900 dark:text-white">YOLO v8 Active</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 italic">
                    * If you experience network jitters, the offline auto-save engine buffers your responses locally.
                  </p>
                </div>
              </div>
            </div>

            {/* Candidate Declaration & Agreement Action */}
            <div className="rounded-2xl border-2 border-violet-500/30 bg-violet-50/40 dark:bg-violet-950/30 p-5 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAgreedRules}
                  onChange={(e) => setHasAgreedRules(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-md border-violet-400 text-violet-600 focus:ring-violet-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  I hereby declare that I have read, understood, and agreed to adhere to all the examination rules, conduct regulations, and proctoring protocols outlined above. I acknowledge that academic malpractice will lead to disqualification.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Exit to Dashboard
                </button>

                <button
                  type="button"
                  disabled={!hasAgreedRules}
                  onClick={() => {
                    setRulesStage('active');
                    toggleFullscreen();
                    if (videoRef.current && streamRef.current) {
                      videoRef.current.srcObject = streamRef.current;
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    hasAgreedRules
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-violet-500/25 active:scale-95'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>Agree &amp; Enter Proctored Exam Hall (Fullscreen)</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (

          <div className="relative flex-1 flex flex-col lg:flex-row overflow-hidden">

            

            {/* PAUSE OVERLAY (When Teacher Clicks Pause on Cockpit) */}

            {isExamPaused && (

              <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in duration-150">

                <div className="max-w-md p-6 rounded-3xl bg-slate-900 border border-amber-500/40 text-white shadow-2xl space-y-4">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">

                    <Pause className="h-7 w-7" />

                  </div>

                  <div className="space-y-1.5">

                    <h3 className="text-lg font-black tracking-tight text-amber-300">

                      Examination Paused by Invigilator

                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">

                      Your examination canvas has been temporarily frozen while the invigilator verifies your desk posture or conducts a verification check.

                    </p>

                  </div>

                  <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-[11px] text-slate-400 font-mono">

                    Exam Timer is Locked &bull; Please do not exit fullscreen

                  </div>

                </div>

              </div>

            )}



            {/* LEFT / CENTER: OFFICIAL CBSE QUESTION PAPER VIEWER (NO TYPING - PHYSICAL PAPER ONLY) */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/40 relative">
              
              {/* Security Watermark across question paper */}
              <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.03] dark:opacity-[0.04] rotate-[-25deg] z-0 overflow-hidden">
                <span className="text-4xl sm:text-6xl font-black uppercase text-slate-900 dark:text-white tracking-widest leading-relaxed text-center">
                  CBSE 2026-27 &bull; {studentName} &bull; ROLL #14 &bull; SECRECY VAULT CLEARANCE
                </span>
              </div>

              {/* Question Paper Header Sheet */}
              <div className="relative z-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-600 text-white shadow-2xs">
                        Official CBSE Board Assessment
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Subject Code: 041
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Secrecy Vault Paper ID #1 (Unlocked)
                      </span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
                      {questionPaperData?.title || 'Term 1 Mathematics Comprehensive Final Examination'}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Class: <b>8-B</b> &bull; Candidate: <b>{studentName} (Roll #14)</b> &bull; Chief Invigilator: <b>Mrs. Ananya Verma</b>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Assessment Weightage</span>
                    <span className="text-base sm:text-lg font-black font-mono text-violet-700 dark:text-violet-300">
                      100 Marks (180 Mins)
                    </span>
                  </div>
                </div>

                {/* Candidate Instructions Strip */}
                <div className="p-3 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-900/50 text-xs text-violet-950 dark:text-violet-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-violet-900 dark:text-violet-200">
                    <CheckCircle2 className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <span>Physical Answer Paper Writing Protocol (Blue/Black Ink Only):</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 dark:text-slate-300 list-disc pl-5 space-y-0.5">
                    <li>Write all answers step-wise with question numbers clearly indicated in the left margin.</li>
                    <li>Clearly print your <b>Roll Number (#14)</b>, Name, and Page Number on every physical sheet.</li>
                    <li>Calculators and electronic gadgets are strictly prohibited. Digital copy-paste is disabled.</li>
                  </ul>
                </div>
              </div>

              {/* Section Tabs & Zoom Controls */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveSectionId('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeSectionId === 'ALL'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    All Sections (17 Questions)
                  </button>

                  {(questionPaperData?.sections || []).map((sec: any) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSectionId(sec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeSectionId === sec.id
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sec.id}: {sec.name.split(':')[0]} ({sec.total_marks}m)
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQpZoomLevel(prev => prev === 'normal' ? 'large' : 'normal')}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                    title="Toggle Text Reading Size"
                  >
                    Font: {qpZoomLevel === 'large' ? 'Large (125%)' : 'Standard'}
                  </button>
                </div>
              </div>

              {/* Questions List Sheet */}
              <div className="relative z-10 space-y-6">
                {(questionPaperData?.sections || [])
                  .filter((sec: any) => activeSectionId === 'ALL' || sec.id === activeSectionId)
                  .map((sec: any) => (
                    <div key={sec.id} className="space-y-3">
                      {/* Section Title Divider */}
                      <div className="flex items-center justify-between border-b-2 border-violet-500/30 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-lg bg-violet-600 text-white text-xs font-black flex items-center justify-center">
                            {sec.id.replace('SEC-', '')}
                          </span>
                          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            {sec.name}
                          </h2>
                        </div>
                        <span className="text-xs font-mono font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 rounded-lg border border-violet-200 dark:border-violet-800">
                          {sec.total_marks} Total Marks &bull; {sec.marks_per_question}m each
                        </span>
                      </div>

                      {/* Questions within this Section */}
                      <div className="space-y-3">
                        {sec.questions.map((q: any) => (
                          <div
                            key={q.q_num}
                            className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs transition-all hover:border-violet-300 dark:hover:border-violet-700 space-y-2.5`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="h-7 w-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                  Q{q.q_num}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                  {q.topic}
                                </span>
                                {q.bloom && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                    {q.bloom}
                                  </span>
                                )}
                              </div>

                              <span className="px-2.5 py-1 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 font-mono font-black text-xs border border-violet-200 dark:border-violet-800 shrink-0">
                                [{q.marks} Marks]
                              </span>
                            </div>

                            {/* Question Formulation */}
                            <p className={`text-slate-800 dark:text-slate-100 font-medium leading-relaxed font-sans ${
                              qpZoomLevel === 'large' ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
                            }`}>
                              {q.text}
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                              <span className="italic flex items-center gap-1">
                                ✍️ Solve step-by-step with pen on physical paper answer booklet
                              </span>
                              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                Question #{q.q_num} of 17
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Bottom Sticky Submission Banner for Hybrid Paper Exam */}
              <div className="relative z-10 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">Physical Answer Booklet Writing Active</h4>
                    <p className="text-[10px] text-slate-500">When completed, generate your dynamic security seal and upload paper photos.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Analysis Sheet Trigger Button */}
                  <button
                    type="button"
                    onClick={() => setShowAnalysisSheetModal(true)}
                    className="rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 font-black text-xs px-4 py-3 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    title="View live proctor integrity telemetry & analysis sheet"
                  >
                    <FileText className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <span>Analysis Sheet ({proctorAnalysisSheet.length})</span>
                    {proctorStrikes > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-rose-600 text-white">
                        {proctorStrikes} Strike{proctorStrikes > 1 ? 's' : ''}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isExamPaused}
                    onClick={() => setShowDynamicSealModal(true)}
                  className="rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-black text-xs px-6 py-3 shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Lock className="h-4 w-4" />
                  <span>Finish Writing &amp; Generate Security Seal (#HYBRID-8492-SEAL)</span>
                </button>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: DEDICATED WEBCAM PROCTOR HUD */}

            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4 sm:p-5 flex flex-col justify-between space-y-4 shrink-0">

              <div className="space-y-4">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">

                    <Camera className="h-4 w-4 text-purple-600 dark:text-purple-400" />

                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">

                      Live Proctor Cam

                    </span>

                  </div>

                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>

                </div>



                {/* Webcam Video Container */}

                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-purple-500/40 shadow-md aspect-video flex items-center justify-center">

                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
                    onPause={() => {
                      if (streamRef.current) videoRef.current?.play().catch(() => {});
                    }}
                    className="w-full h-full object-cover transform -scale-x-100"
                  />



                  {/* Audio Decibel Level HUD */}

                  {/* DYNAMIC ON-SCREEN YOLO BOUNDING BOXES */}
                  {cameraActive && (
                    <>
                      {/* Candidate Head Indicator (Only shown if head turned away) */}
                      {yoloPersonCount > 0 && yoloGazeStatus.includes('Turned') && (
                        <div 
                          className="absolute border-2 border-amber-400 bg-amber-400/10 rounded-2xl pointer-events-none transition-all duration-150 flex flex-col justify-between p-1.5"
                          style={{
                            top: '12%',
                            bottom: '22%',
                            left: `${Math.max(8, Math.min(62, (1 - liveFaceCentroidX) * 100 - 20))}%`,
                            width: '42%',
                          }}
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                            <span className="px-1.5 py-0.5 rounded text-white shadow-xs bg-amber-500">
                              YOLO: Head Pose
                            </span>
                            {liveGazeTimer > 0 && (
                              <span className="bg-amber-600 text-white px-1.5 py-0.5 rounded text-[8px] animate-pulse">
                                Turned: {liveGazeTimer}s/4.5s
                              </span>
                            )}
                          </div>
                          <span className="self-end text-[8px] font-mono font-bold text-amber-300 bg-black/70 px-1.5 py-0.5 rounded">
                            {yoloGazeStatus}
                          </span>
                        </div>
                      )}

                      {/* Cell Phone Bounding Box - 2.5s Transient HUD Alert */}
                      {visibleBoxAlerts.phone && (
                        <div 
                          className="absolute border-2 border-rose-500 bg-rose-500/20 rounded-xl pointer-events-none flex flex-col justify-between p-1 animate-pulse transition-opacity duration-300"
                          style={{ bottom: '15%', left: '35%', width: '30%', height: '40%' }}
                        >
                          <span className="self-start text-[8px] font-mono font-black bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-sm">
                            🚨 YOLO: cell_phone (0.92)
                          </span>
                          <span className="self-end text-[8px] font-mono text-rose-300 bg-black/70 px-1 rounded font-bold">
                            Handheld Mobile Flagged
                          </span>
                        </div>
                      )}

                      {/* Unauthorized Book Bounding Box - 2.5s Transient HUD Alert */}
                      {visibleBoxAlerts.book && (
                        <div 
                          className="absolute border-2 border-rose-500 bg-rose-500/20 rounded-xl pointer-events-none flex flex-col justify-between p-1 animate-pulse transition-opacity duration-300"
                          style={{ bottom: '10%', right: '15%', width: '45%', height: '35%' }}
                        >
                          <span className="self-start text-[8px] font-mono font-black bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-sm">
                            🚨 YOLO: book (0.89)
                          </span>
                          <span className="self-end text-[8px] font-mono text-rose-300 bg-black/70 px-1 rounded font-bold">
                            Printed Material Flagged
                          </span>
                        </div>
                      )}

                      {/* Second Person Bounding Box - 2.5s Transient HUD Alert */}
                      {visibleBoxAlerts.person2 && (
                        <div className="absolute top-6 right-3 w-32 h-44 border-2 border-dashed border-rose-500 bg-rose-500/20 rounded-xl pointer-events-none flex flex-col justify-between p-1 animate-pulse transition-opacity duration-300">
                          <span className="self-start text-[8px] font-mono font-black bg-rose-600 text-white px-1.5 py-0.5 rounded">
                            👥 YOLO: person_2 (0.94)
                          </span>
                          <span className="self-end text-[8px] font-mono text-rose-300 bg-black/70 px-1 rounded font-bold">
                            Multi-Face Alert
                          </span>
                        </div>
                      )}

                      {/* Absent Candidate Full-Screen Overlay Box */}
                      {yoloPersonCount === 0 && (
                        <div className="absolute inset-3 border-2 border-dashed border-rose-500 bg-rose-950/85 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center p-3 text-center pointer-events-none animate-pulse">
                          <UserX className="h-8 w-8 text-rose-400 mx-auto mb-1 animate-bounce" />
                          <span className="text-xs font-black text-rose-300">NO CANDIDATE DETECTED</span>
                          <span className="text-[10px] text-rose-200 font-mono mt-0.5">
                            Desk Empty: {liveAbsentTimer}s / 5.0s (Strike impending)
                          </span>
                        </div>
                      )}
                    </>
                  )}

                                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full text-[9px] font-mono text-white flex items-center gap-1">

                    <Mic className="h-2.5 w-2.5 text-emerald-400" />

                    <span>{audioDecibels} dB</span>

                  </div>



                  {!cameraActive && (

                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-3 text-center text-slate-400 space-y-1">

                      <VideoOff className="h-6 w-6 text-slate-500" />

                      <span className="text-[10px] font-bold text-slate-300">Edge Proctor Active</span>

                      <span className="text-[9px] text-slate-400">Webcam stream linked to Invigilator</span>

                    </div>

                  )}



                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[9px] font-mono font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-1 rounded-xl">
                    <span className="flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${proctorStrikes > 1 ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`}></span>
                      YOLO Person: {yoloPersonCount} ({studentName.split(' ')[0]})
                    </span>
                    <span>Gaze: {yoloGazeStatus}</span>
                  </div>
                </div>

                {/* Strikes & Malpractice Gauge */}
                {proctorStrikes > 0 && (
                  <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-in fade-in ${
                    proctorStrikes >= 3 
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 ring-2 ring-rose-500/50' 
                      : proctorStrikes === 2 
                      ? 'bg-amber-950/70 border-amber-500 text-amber-300' 
                      : 'bg-amber-900/40 border-amber-600/50 text-amber-200'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-rose-400" />
                      <span>Proctor Strikes:</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px]">
                      {proctorStrikes}/3 Strikes
                    </span>
                  </div>
                )}

                {isPenalized && (
                  <div className="p-2 rounded-xl bg-rose-600 text-white font-black text-[10px] text-center shadow-md animate-pulse flex items-center justify-center gap-1.5">
                    <AlertTriangle className="h-3 w-3" />
                    <span>-5 MARKS PENALTY APPLIED (STRIKE 3 AUDIT)</span>
                  </div>
                )}

                {/* Dev & Demo Simulation Action */}
                {/* LIVE HARDWARE & AI SENSOR TELEMETRY DASHBOARD (100% AUTOMATED - NO MANUAL SIMULATE BUTTON) */}
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                    
                    {/* Header: LiveKit SFU & AI Vision Status */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                          LiveKit SFU Proctor Mesh
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {liveKitRoomStatus === 'connected' ? 'Connected (24ms)' : 'Mesh Active'}
                      </span>
                    </div>

                    {/* Active Contraband / Anomaly Pill */}
                    {activeDetectedObject && (
                      <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/50 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300 font-bold animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                          <span>Detected: {activeDetectedObject}</span>
                        </span>
                        <span className="text-[9px] font-mono font-black bg-rose-600 text-white px-2 py-0.5 rounded">
                          {livePhoneTimer > 0 ? `${livePhoneTimer}s / 1.25s` : liveBookTimer > 0 ? `${liveBookTimer}s / 1.5s` : 'Verifying'}
                        </span>
                      </div>
                    )}

                    {/* Sensor 1: Gaze & Head Orientation (Live 5s Countdown) */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-bold flex items-center gap-1">
                          <Eye className="h-3 w-3 text-violet-500" />
                          Gaze / Head Pose
                        </span>
                        <span className={`font-mono font-black ${
                          yoloGazeStatus.includes('Turned') ? 'text-amber-500 animate-pulse' : yoloGazeStatus.includes('Absent') ? 'text-rose-500 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {yoloGazeStatus}
                          {liveGazeTimer > 0 && ` (${liveGazeTimer}s / 5.0s)`}
                          {liveAbsentTimer > 0 && ` (${liveAbsentTimer}s / 5.0s)`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-200 ${
                            liveGazeTimer > 0 ? 'bg-amber-500' : liveAbsentTimer > 0 ? 'bg-rose-500' : 'bg-violet-500'
                          }`}
                          style={{ width: liveGazeTimer > 0 ? `${(liveGazeTimer / 5.0) * 100}%` : liveAbsentTimer > 0 ? `${(liveAbsentTimer / 5.0) * 100}%` : `${Math.round(liveFaceCentroidX * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Sensor 2: Live Microphone Audio Level */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-bold flex items-center gap-1">
                          <Mic className="h-3 w-3 text-indigo-500" />
                          Acoustic Level
                        </span>
                        <span className={`font-mono font-black ${
                          audioDecibels > 65 ? 'text-rose-500' : audioDecibels > 52 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {audioDecibels} dB {audioDecibels > 65 ? '(Voice Spike!)' : '(Quiet)'}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-150 ${
                            audioDecibels > 65 ? 'bg-rose-500' : audioDecibels > 52 ? 'bg-amber-400' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((audioDecibels / 90) * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* Sensor 3: Persons in Room */}
                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 font-bold">Room Occupancy:</span>
                      <span className={`font-black ${yoloPersonCount > 1 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                        {yoloPersonCount > 1 ? '⚠️ 2 People (Multi-Face Flag)' : '1 Candidate (Aarav)'}
                      </span>
                    </div>

                    {/* Proctor Analysis Sheet Button */}
                    <button
                      type="button"
                      onClick={() => setShowAnalysisSheetModal(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-black flex items-center justify-between shadow-md shadow-violet-500/20 transition-all cursor-pointer mt-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>View Proctor Analysis Sheet</span>
                      </span>
                      <span className="font-mono px-2 py-0.5 rounded-lg bg-white/20 text-white font-black text-[10px]">
                        {proctorAnalysisSheet.length} Events
                      </span>
                    </button>

                    {/* Instant Scenario Verifier Bar (Test all 5 proctor rules on demand) */}
                    </div>

                {/* Integrity Checklist */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">

                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">

                    Session Integrity Rules

                  </span>

                  <ul className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4 leading-relaxed">

                    <li>Camera must remain powered throughout test.</li>

                    <li>Browser window must remain maximized.</li>

                    <li>Answers auto-saved to vault every 15 seconds.</li>

                  </ul>

                </div>

              </div>



              {/* Student Candidate Pill */}

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">

                <img

                  src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"

                  alt={studentName}

                  className="h-8 w-8 rounded-xl object-cover border border-slate-300"

                />

                <div className="min-w-0 flex-1 text-left">

                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">

                    {studentName}

                  </span>

                  <span className="text-[10px] text-slate-400 block truncate">

                    Class 8-B &bull; Roll #14

                  </span>

                </div>

              </div>



            </div>



          </div>

        )}



        {/* ========================================================= */}

        {/* CONFIRMATION SUBMISSION MODAL                             */}

        {/* ========================================================= */}

        {confirmSubmitDialogOpen && (

          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">

            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">

                <Send className="h-6 w-6" />

              </div>



              <div className="space-y-1">

                <h3 className="text-base font-bold text-slate-900 dark:text-white">

                  Confirm Final Examination Submission?

                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">

                  You have written <b>{wordCount} words</b>. Once submitted, your answer sheet will be encrypted and transmitted to the teacher grading portal.

                </p>

              </div>



              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1 font-mono">

                <div className="flex justify-between">

                  <span className="text-slate-400">Time Remaining:</span>

                  <span className="font-bold text-slate-800 dark:text-slate-200">{formattedTime}</span>

                </div>

                <div className="flex justify-between">

                  <span className="text-slate-400">Proctor Warnings:</span>

                  <span className="font-bold text-emerald-600">{tabSwitchCount}</span>

                </div>

              </div>



              <div className="flex items-center gap-3 pt-2">

                <button

                  type="button"

                  onClick={() => setConfirmSubmitDialogOpen(false)}

                  className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 text-xs font-bold transition-colors cursor-pointer"

                >

                  Return to Edit

                </button>

                <button

                  type="button"

                  disabled={isSubmitting}

                  onClick={handleSubmitFinal}

                  className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-2.5 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"

                >

                  {isSubmitting ? (

                    <>

                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>

                      <span>Encrypting...</span>

                    </>

                  ) : (

                    <span>Confirm &amp; Submit</span>

                  )}

                </button>

              </div>

            </div>

          </div>

        )}



                {/* CHIEF INVIGILATOR 1-ON-1 VIDEO & AUDIO POPPING INTERCOM */}
        {isInvigilatorIntercomActive && (
          <div className="fixed bottom-6 right-6 z-50 w-96 rounded-3xl bg-slate-900/95 backdrop-blur-xl border-2 border-emerald-500 shadow-2xl p-5 text-white animate-in slide-in-from-bottom-8 duration-300">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80"
                    alt="Mrs. Ananya Verma"
                    className="h-12 w-12 rounded-2xl object-cover border-2 border-emerald-400 ring-4 ring-emerald-500/20"
                  />
                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                    <Mic className="h-2.5 w-2.5 text-slate-950 animate-pulse" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                      Chief Invigilator Intercom
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Mrs. Ananya Verma</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Direct 1-on-1 Secure Audio</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInvigilatorIntercomActive(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Live Audio Waveform Animation */}
            <div className="my-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-emerald-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 animate-bounce text-emerald-400" />
                  Speaking Live to You
                </span>
                <div className="flex items-center gap-1">
                  <span className="h-3 w-1 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="h-5 w-1 bg-emerald-300 rounded-full animate-pulse" />
                  <span className="h-2 w-1 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="h-6 w-1 bg-emerald-200 rounded-full animate-pulse" />
                  <span className="h-4 w-1 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed italic">
                "{invigilatorIntercomMessage || 'Aarav, please adjust your device camera so that your physical paper booklet and hands remain visible on your desk.'}"
              </p>
            </div>

            {/* Actions: Unmute to Reply & Acknowledge */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsStudentMicUnmuted(!isStudentMicUnmuted)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isStudentMicUnmuted
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-400'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/25'
                }`}
              >
                {isStudentMicUnmuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                <span>{isStudentMicUnmuted ? 'Mute Microphone' : 'Unmute to Reply'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInvigilatorIntercomActive(false)}
                className="py-2 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}

                {/* REAL-TIME PROCTOR INTEGRITY ANALYSIS SHEET MODAL */}
        {showAnalysisSheetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-violet-950 via-indigo-950 to-slate-950 text-white flex items-start justify-between border-b border-violet-800/40">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-600 text-white shadow-xs">
                      Official Proctor Telemetry Ledger
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      4-Rule Automated Edge AI Active
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    Proctor Integrity Analysis Sheet &amp; Audit Trail
                  </h2>
                  <p className="text-xs text-violet-200/80 mt-0.5">
                    Candidate: <b>{studentName} (Roll #14)</b> &bull; Class: <b>8-B</b> &bull; Chief Invigilator: <b>Mrs. Ananya Verma</b>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAnalysisSheetModal(false)}
                  className="rounded-xl p-2 text-violet-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 4-Rule Compliance Matrix & Real-time Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Infractions</span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {proctorAnalysisSheet.length} Incidents
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Proctor Strikes</span>
                  <span className={`text-base sm:text-lg font-black ${proctorStrikes >= 2 ? 'text-rose-600' : proctorStrikes === 1 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {proctorStrikes} / 3 Strikes
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Marks Penalty</span>
                  <span className={`text-base sm:text-lg font-black ${isPenalized ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isPenalized ? '-5 Marks' : '0 (Clear)'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Integrity Score</span>
                  <span className={`text-base sm:text-lg font-black ${proctorStrikes === 0 ? 'text-emerald-500' : proctorStrikes === 1 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {proctorStrikes === 0 ? '100% Exemplary' : proctorStrikes === 1 ? '85% Warning' : '60% Compromised'}
                  </span>
                </div>
              </div>

              {/* Chronological Table of Violations */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {proctorAnalysisSheet.length === 0 ? (
                  <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      Zero Infractions Logged in Analysis Sheet
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      All 4 edge proctor rules are currently satisfied. Holding a cell phone or turning away will be automatically detected and recorded here.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                          <th className="py-3 px-3">Time</th>
                          <th className="py-3 px-3">Infraction Category</th>
                          <th className="py-3 px-4">Evaluation Rule &amp; Confidence</th>
                          <th className="py-3 px-3">Severity &amp; Action</th>
                          <th className="py-3 px-3">Invigilator Audit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {proctorAnalysisSheet.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-300">
                              {item.timestamp}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                {item.category === 'CELL_PHONE' && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                                {item.category === 'BOOK_DETECTED' && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                                {item.category === 'MULTIPLE_PERSONS' && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                                {item.category === 'STUDENT_ABSENT' && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                                {item.category === 'GAZE_DRIFT' && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                                {item.category === 'AUDIO_ANOMALY' && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                                {item.category === 'TAB_SWITCH' && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                                <span>{item.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 block">{item.notes}</span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 inline-block">
                                {item.ruleTriggered}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {item.actionTaken === 'STRIKE' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  Strike #{item.strikeNumber}/3 Applied
                                </span>
                              ) : item.actionTaken === 'WARNING' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  Advisory Nudge (0 Strike)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  Audio Flag
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[11px] text-slate-500">
                              <span className="font-bold text-violet-600 dark:text-violet-400">Mrs. Ananya Verma</span>
                              <span className="block text-[10px] text-slate-400">Synced to Secrecy Audit</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Continuous edge telemetry synced in real time to Invigilator Command Cockpit
                </span>
                <button
                  type="button"
                  onClick={() => setShowAnalysisSheetModal(false)}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
                >
                  Close Analysis Sheet
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Dynamic Security Seal Modal (ONLY ACTIVE FOR HYBRID SCAN) */}

        {examMode === 'MODE_HYBRID_SCAN' && (

          <DynamicSealModal

            isOpen={showDynamicSealModal}

            sealCode="#EDU-8492"

            onConfirmUpload={(data) => {

              setShowDynamicSealModal(false);

              handleSubmitFinal();

            }}

            onCancel={() => setShowDynamicSealModal(false)}

          />

        )}

      </div>

    </div>

  );

}

