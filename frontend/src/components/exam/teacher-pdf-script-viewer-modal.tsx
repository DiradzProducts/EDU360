'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Award, 
  Check, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Edit3,
  Save,
  AlertTriangle
} from 'lucide-react';

export interface AnswerScriptSubmission {
  candidateId: number;
  studentName: string;
  rollNo: string;
  className: string;
  subject: string;
  examTitle: string;
  sealCode: string;
  fileName: string;
  fileSize: string;
  pageCount: number;
  uploadedAt: string;
  isWithin15MinWindow: boolean;
  pdfUrl?: string;
  score?: number;
  maxScore?: number;
  teacherRemarks?: string;
  isGraded?: boolean;
}

interface TeacherPdfScriptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: AnswerScriptSubmission | null;
  onSaveGrading?: (updated: AnswerScriptSubmission) => void;
}

export function TeacherPdfScriptViewerModal({
  isOpen,
  onClose,
  submission,
  onSaveGrading
}: TeacherPdfScriptViewerModalProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [score, setScore] = useState<number>(submission?.score || 22.5);
  const [maxScore] = useState<number>(submission?.maxScore || 25);
  const [remarks, setRemarks] = useState<string>(
    submission?.teacherRemarks || 'Excellent step-by-step algebraic proofs. Seal code verified on all page headers.'
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen || !submission) return null;

  const totalPages = submission.pageCount || 6;

  const handleSaveMarks = () => {
    setIsSaved(true);
    if (onSaveGrading) {
      onSaveGrading({
        ...submission,
        score,
        maxScore,
        teacherRemarks: remarks,
        isGraded: true
      });
    }
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] rounded-3xl bg-slate-900 border-2 border-slate-800 text-white shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">{submission.studentName}</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-violet-950 text-violet-300 border border-violet-800">
                  Roll #{submission.rollNo} &bull; {submission.className}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {submission.subject}: {submission.examTitle}
              </p>
            </div>
          </div>

          {/* Security Seal Code Verification Badge */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <div className="text-left font-mono">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans font-bold">Security Seal Code</span>
                <span className="text-xs font-black text-amber-300">{submission.sealCode}</span>
              </div>
            </div>

            <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <div className="text-left font-mono">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans font-bold">15-Min Window</span>
                <span className="text-xs font-bold text-emerald-300">✓ On-Time ({submission.uploadedAt})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area: Split View (PDF Page Viewer on Left, Evaluator Grading Card on Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Column: PDF Scanned Document Viewer (Col 8) */}
          <div className="lg:col-span-8 bg-slate-950/70 p-4 sm:p-6 flex flex-col justify-between overflow-y-auto border-r border-slate-800">
            {/* Document Action Ribbon */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-400">
                <span>File: <b>{submission.fileName}</b></span>
                <span>({submission.fileSize})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-mono font-bold text-xs">Page {currentPage} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Simulated High-Res Scanned Sheet Canvas with Seal Code Watermark on Top-Right */}
            <div className="flex-1 my-4 flex items-center justify-center">
              <div className="relative w-full max-w-lg aspect-[1/1.414] bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between border-4 border-slate-200 overflow-hidden font-serif">
                
                {/* Physical Top-Right Seal Code Inscription Stamp */}
                <div className="absolute top-4 right-4 bg-amber-100/90 border-2 border-dashed border-amber-600 px-3 py-1 rounded-lg text-center shadow-xs">
                  <span className="text-[8px] font-sans font-bold uppercase tracking-wider text-amber-800 block">Verified Seal Code</span>
                  <span className="text-sm font-mono font-black text-amber-950">{submission.sealCode}</span>
                </div>

                {/* Simulated Handwritten Exam Page Header */}
                <div className="border-b-2 border-slate-300 pb-3 space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-700 font-sans">
                    <span><b>Candidate:</b> {submission.studentName}</span>
                    <span><b>Roll No:</b> {submission.rollNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans">
                    Exam: {submission.subject} Term-2 Periodic Assessment &bull; Sheet #{currentPage}
                  </div>
                </div>

                {/* Simulated Handwritten Mathematical Proof Lines */}
                <div className="space-y-4 my-auto text-xs sm:text-sm text-slate-800 leading-relaxed font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-sans text-xs">
                    <b>Section B &bull; Question 4:</b> Solve the quadratic equation by factorization method: <br />
                    <code className="text-indigo-600 font-bold">2x² + 7x + 5 = 0</code>
                  </div>

                  <div className="space-y-2 pl-2 border-l-2 border-blue-400 text-xs sm:text-sm italic">
                    <p><b>Step 1:</b> Factor pairs for 2 × 5 = 10 that sum to 7 are (2, 5).</p>
                    <p><b>Step 2:</b> 2x² + 2x + 5x + 5 = 0</p>
                    <p><b>Step 3:</b> 2x(x + 1) + 5(x + 1) = 0</p>
                    <p><b>Step 4:</b> (2x + 5)(x + 1) = 0</p>
                    <p className="font-bold text-slate-900 not-italic">Therefore: x = -5/2 or x = -1 ✓ (Q.E.D.)</p>
                  </div>

                  {currentPage > 1 && (
                    <div className="text-[11px] text-slate-500 italic pt-2">
                      [Continuous theorem derivation and graphical coordinate geometry plot on Sheet #{currentPage} verified with blue ink inscription]
                    </div>
                  )}
                </div>

                {/* Sheet Bottom Footer */}
                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                  <span>EDU360 Official Script Deposit Vault</span>
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
              </div>
            </div>

            {/* Document Navigation Thumbnails */}
            <div className="flex items-center justify-center gap-2 pt-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  type="button"
                  onClick={() => setCurrentPage(pg)}
                  className={`h-8 w-8 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    currentPage === pg
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {pg}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Evaluator Marks Ledger & Grading Desk (Col 4) */}
          <div className="lg:col-span-4 bg-slate-900 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-violet-400" />
                  <span>Evaluation &amp; Marks Entry</span>
                </span>
                {submission.isGraded && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Graded
                  </span>
                )}
              </div>

              {/* Seal Verification Checklist */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-200 block">Invigilator Checklist:</span>
                <div className="space-y-1.5 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Seal Code matches session token: <b>{submission.sealCode}</b></span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Submitted in 15-min scan grace window</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{totalPages} handwritten sheets legible</span>
                  </div>
                </div>
              </div>

              {/* Marks Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Awarded Score:</span>
                  <span className="font-mono text-[11px] text-slate-400">Maximum Marks: {maxScore}</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={maxScore}
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                    className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-lg font-mono font-black text-emerald-400 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                  />
                  <span className="font-mono text-slate-400 font-bold">/ {maxScore}</span>
                </div>
              </div>

              {/* Teacher Feedback / Remarks */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Evaluator Remarks &amp; Feedback:
                </label>
                <textarea
                  rows={4}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add academic feedback or grading notes..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Save & Confirm Action */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              {isSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
                  <Check className="h-4 w-4" />
                  <span>Evaluation &amp; Marks Saved to Official Ledger!</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveMarks}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Marks to Ledger ({score}/{maxScore})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
