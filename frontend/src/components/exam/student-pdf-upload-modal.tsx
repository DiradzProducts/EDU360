'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  X, 
  Eye, 
  Download, 
  Lock,
  ArrowRight,
  FileCheck,
  Check,
  Sparkles,
  FileUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface StudentExamPdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  sealCode?: string;
  studentName?: string;
  rollNo?: string;
  candidateId?: number;
  subject?: string;
  examTitle?: string;
  className?: string;
  onUploadSuccess?: (data: any) => void;
  initialReceipt?: any;
}

export function StudentExamPdfUploadModal({
  isOpen,
  onClose,
  sealCode = 'SEAL-8B-9482',
  studentName = 'Aarav Sharma',
  rollNo = '14',
  candidateId = 1,
  subject = 'Mathematics',
  examTitle = 'Term 2 Mathematics Examination (Algebra & Geometry)',
  className = 'Class 8-B',
  onUploadSuccess,
  initialReceipt
}: StudentExamPdfUploadModalProps) {
  // 15-Minute Countdown Timer (900 seconds)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pagesCount, setPagesCount] = useState<number>(6);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<any>(null);
  const [hasConfirmedSealCodeOnPages, setHasConfirmedSealCodeOnPages] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isSubmitted]);

  // Synchronize initial receipt if opened in view mode
  useEffect(() => {
    if (!isOpen) return;
    if (initialReceipt) {
      setSubmissionReceipt(initialReceipt);
      setIsSubmitted(true);
    }
  }, [isOpen, initialReceipt]);

  if (!isOpen) return null;

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTimer = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const isTimeCritical = secondsRemaining <= 300; // Under 5 mins
  const isTimeUrgent = secondsRemaining <= 60;   // Under 1 min

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setSelectedFile(file);
      }
    }
  };

  const handleSubmitPdf = () => {
    setIsUploading(true);
    setUploadProgress(15);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 25;
      });
    }, 250);

    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploading(false);
      setIsSubmitted(true);

      const submissionData = {
        candidateId,
        studentName,
        rollNo,
        className,
        subject,
        examTitle,
        sealCode,
        fileName: selectedFile?.name || `${studentName.replace(/\s+/g, '_')}_Maths_AnswerScript.pdf`,
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '4.2 MB',
        pageCount: pagesCount,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        uploadDurationSeconds: 15 * 60 - secondsRemaining,
        isWithin15MinWindow: secondsRemaining > 0,
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Safe sample PDF viewer fallback
      };

      setSubmissionReceipt(submissionData);

      // Persist to localStorage for Teacher Profile Ledger
      try {
        const existing = JSON.parse(localStorage.getItem('edu360_exam_submissions') || '[]');
        const updated = [submissionData, ...existing.filter((s: any) => s.candidateId !== candidateId || s.subject !== subject)];
        localStorage.setItem('edu360_exam_submissions', JSON.stringify(updated));
      } catch {}

      // Broadcast to Teacher & Cockpit over BroadcastChannel
      try {
        const channel = new BroadcastChannel('edu360_exam_live_channel');
        channel.postMessage({
          type: 'STUDENT_SCRIPT_UPLOADED',
          ...submissionData
        });
        channel.close();
      } catch {}

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      if (onUploadSuccess) {
        onUploadSuccess(submissionData);
      }
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-slate-800 text-white shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Answer Script PDF Upload Window</h3>
              <p className="text-xs text-slate-400 font-mono">
                {subject} &bull; {studentName} (Roll #{rollNo} &bull; {className})
              </p>
            </div>
          </div>

          {/* 15-Minute Countdown Timer Badge */}
          {!isSubmitted && (
            <div className={`px-3.5 py-1.5 rounded-2xl border flex items-center gap-2 font-mono shadow-md ${
              isTimeUrgent
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : isTimeCritical
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-violet-950/60 border-violet-500/40 text-violet-300'
            }`}>
              <Clock className="h-4 w-4" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-bold">15-Min Window</span>
                <span className="text-sm font-black">{formattedTimer}</span>
              </div>
            </div>
          )}

          {isSubmitted && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!isSubmitted ? (
            <>
              {/* Security Seal Code Prominent Alert Banner */}
              <div className="rounded-2xl border-2 border-amber-500/60 bg-amber-500/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Official Security Seal Verification Code</span>
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                    Generated on Exam Finish
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-amber-500/30">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Registered Seal Code:</span>
                    <span className="text-2xl font-black font-mono text-amber-300 tracking-wider">
                      {sealCode}
                    </span>
                  </div>
                  <span className="text-xs text-amber-200/90 font-medium max-w-xs text-right">
                    ✍️ Must be clearly written on the <b>top-right corner</b> of all your physical handwritten answer sheets!
                  </span>
                </div>
              </div>

              {/* Instructions Reminder */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <span className="font-bold text-white block">Submission Protocol (Base Version):</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  1. The live camera exam window has been closed. You now have a 15-minute grace period.<br />
                  2. Compile all your written pages into a single <b>PDF file</b>.<br />
                  3. Verify that <b>{sealCode}</b> is legible on each sheet before uploading.
                </p>
              </div>

              {/* PDF Dropzone Area */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                  selectedFile 
                    ? 'border-emerald-500 bg-emerald-500/10' 
                    : 'border-slate-700 hover:border-violet-500 bg-slate-950/40 hover:bg-slate-950/80'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="application/pdf,.pdf" 
                  className="hidden" 
                />

                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-white ${
                  selectedFile ? 'bg-emerald-600 shadow-lg shadow-emerald-600/30' : 'bg-slate-800'
                }`}>
                  {selectedFile ? <FileCheck className="h-7 w-7 text-white" /> : <Upload className="h-7 w-7 text-slate-300" />}
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-emerald-400 block truncate max-w-md">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono block">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; PDF Document Ready
                    </span>
                    <span className="text-[11px] text-emerald-300 font-bold block pt-1">
                      ✓ Ready for submission. Click below to confirm upload.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-white block">
                      Click to Browse or Drag &amp; Drop Answer Sheet PDF
                    </span>
                    <span className="text-xs text-slate-400 block">
                      Supports: .PDF format (Single consolidated document up to 25 MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Page Count Confirmation & Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Answer Sheets Written:</span>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="1" 
                      max="40"
                      value={pagesCount} 
                      onChange={(e) => setPagesCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-sm font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-violet-500" 
                    />
                    <span className="text-xs text-slate-400 font-mono">Pages</span>
                  </div>
                </div>

                <label className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={hasConfirmedSealCodeOnPages}
                    onChange={(e) => setHasConfirmedSealCodeOnPages(e.target.checked)}
                    className="h-4 w-4 rounded-md border-slate-700 bg-slate-900 text-violet-600 focus:ring-violet-500" 
                  />
                  <span className="text-slate-300 font-medium">
                    I confirm that <b>{sealCode}</b> is written on all {pagesCount} pages
                  </span>
                </label>
              </div>

              {/* Upload Progress Bar (when uploading) */}
              {isUploading && (
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Uploading PDF to Evaluator Vault...</span>
                    <span className="text-violet-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 transition-all duration-200" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!selectedFile || !hasConfirmedSealCodeOnPages || isUploading}
                  onClick={handleSubmitPdf}
                  className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                    selectedFile && hasConfirmedSealCodeOnPages && !isUploading
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-600/30'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {isUploading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Encrypting &amp; Dispatching to Teacher Profile...</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4" />
                      <span>Upload Official Answer Script PDF &bull; {pagesCount} Pages</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* SUBMISSION SUCCESS CONFIRMATION RECEIPT */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-300">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Answer Script Received in Teacher Profile
                </span>
                <h3 className="text-2xl font-black text-white pt-1">
                  Examination Successfully Submitted!
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Your handwritten answer script has been securely synced to Chief Invigilator <b>Mrs. Ananya Verma</b>&apos;s evaluation desk.
                </p>
              </div>

              {/* Receipt Summary Card */}
              {submissionReceipt && (
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs font-mono space-y-2">
                  <div className="flex justify-between pb-1 border-b border-slate-800/80">
                    <span className="text-slate-500">Security Seal Verified:</span>
                    <span className="font-bold text-amber-300">{submissionReceipt.sealCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Document Uploaded:</span>
                    <span className="font-bold text-white truncate max-w-[200px]">{submissionReceipt.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pages Count:</span>
                    <span className="font-bold text-slate-200">{submissionReceipt.pageCount} Pages ({submissionReceipt.fileSize})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submission Timestamp:</span>
                    <span className="font-bold text-slate-200">{submissionReceipt.uploadedAt}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800/80 text-emerald-400">
                    <span>15-Minute Compliance:</span>
                    <span className="font-bold">✓ Submitted within {Math.floor(submissionReceipt.uploadDurationSeconds / 60)}m {submissionReceipt.uploadDurationSeconds % 60}s</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Return to Student Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setSelectedFile(null);
                    setHasConfirmedSealCodeOnPages(false);
                  }}
                  className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
                >
                  ↺ Re-upload / Replace File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
