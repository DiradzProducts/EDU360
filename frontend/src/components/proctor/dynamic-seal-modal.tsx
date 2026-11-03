import React, { useState } from 'react';
import { 
  Key, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Upload, 
  FileText, 
  Lock,
  X
} from 'lucide-react';

interface DynamicSealModalProps {
  isOpen: boolean;
  sealCode?: string;
  onConfirmUpload: (fileData: { fileName: string; pagesCount: number; checksum: string }) => void;
  onCancel?: () => void;
}

export function DynamicSealModal({
  isOpen,
  sealCode = '#EDU-8492',
  onConfirmUpload,
  onCancel
}: DynamicSealModalProps) {
  const [step, setStep] = useState<'seal' | 'uploading' | 'completed'>('seal');
  const [pagesCount, setPagesCount] = useState(5);
  const [fileName, setFileName] = useState('Aarav_Sharma_Math_AnswerScript.pdf');
  const [writingDetected, setWritingDetected] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setUploadProgress(true);
    setTimeout(() => {
      setUploadProgress(false);
      setStep('completed');
      onConfirmUpload({
        fileName,
        pagesCount,
        checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 text-center">
        
        {/* Dynamic Header */}
        <div className="space-y-1.5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-700 shadow-md">
            <Lock className="h-6 w-6" />
          </div>
          <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 border border-amber-200 dark:border-amber-800">
            Exam Writing Time Ended &bull; 15-Min Scan Grace Window
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Dynamic Session Security Seal
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Write the ephemeral security seal code directly on the top corner of all your answer pages now. Unbroken camera custody is active.
          </p>
        </div>

        {/* 4-Digit Ephemeral Security Seal Code Box */}
        <div className="rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/60 dark:bg-amber-950/30 p-5 space-y-2">
          <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-widest block">
            Step 1: Write this code in ink on ALL answer pages
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-black text-amber-900 dark:text-amber-200 tracking-wider">
            {sealCode}
          </div>
          <span className="text-[10px] text-slate-500 block">
            Generated at 12:00:00 PM &bull; Valid exclusively for this exam session
          </span>
        </div>

        {/* Live Proctor Camera Feed Status during Upload */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              Unbroken Proctor Camera: Active
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
              DL Pose: Scanning Mode
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Keep your laptop camera on and stay in frame while capturing pages with your phone scanner. Writing paragraphs now is prohibited.
          </p>

          {/* Simulated Writing Warning Toggle */}
          {writingDetected && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>YOLO Anomaly: Pen-stroke motion detected. Please scan only!</span>
            </div>
          )}
        </div>

        {/* Upload Action Area */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Pages to upload:</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPagesCount(Math.max(1, pagesCount - 1))}
                className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black"
              >-</button>
              <span className="font-mono text-sm">{pagesCount} Pages</span>
              <button 
                onClick={() => setPagesCount(pagesCount + 1)}
                className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black"
              >+</button>
            </div>
          </div>

          <button
            onClick={handleSimulateScan}
            disabled={uploadProgress}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs py-3.5 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {uploadProgress ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating SHA-256 Checksum &amp; Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Simulate In-App Mobile Scan &amp; Upload PDF</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
