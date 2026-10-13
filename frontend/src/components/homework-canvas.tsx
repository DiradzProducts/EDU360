'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, 
  Check, 
  Type, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  HelpCircle,
  FileText,
  Sparkles,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HomeworkSubmission } from '@/lib/types';

interface HomeworkCanvasProps {
  submission: HomeworkSubmission;
  onSave: (marks: number, remarks: string, annotationsJson: string) => Promise<void>;
  readOnly?: boolean;
}

type ToolMode = 'pen' | 'tick' | 'text';

interface AnnotationItem {
  type: 'tick' | 'text' | 'circle' | 'stroke';
  x: number;
  y: number;
  color?: string;
  text?: string;
  points?: { x: number; y: number }[];
}

export function HomeworkCanvas({ submission, onSave, readOnly = false }: HomeworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<ToolMode>('tick');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>([]);
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [marks, setMarks] = useState<number>(submission.marks_obtained || 17.5);
  const [remarks, setRemarks] = useState<string>(
    submission.teacher_remarks || "Good method in Q2, revise formula in Q4 before test!"
  );
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [textInputVal, setTextInputVal] = useState("Revise formula sign in Q4");

  // Load existing annotations
  useEffect(() => {
    if (submission.annotations_json) {
      try {
        const parsed = JSON.parse(submission.annotations_json);
        if (Array.isArray(parsed)) {
          setAnnotations(parsed);
        }
      } catch (e) {
        console.error("Failed to parse annotations JSON", e);
      }
    }
  }, [submission]);

  // Redraw canvas whenever annotations change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background worksheet simulation
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw clean lined worksheet paper
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header bar on worksheet
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, 60);
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText("Class 8B • Mathematics Assignment #4: Quadratic Factoring", 24, 35);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Student: Aarav Sharma • Roll #14 • Adm #EDU-2024-082", 24, 52);

    // Draw question lines and student handwritten math simulation
    drawWorksheetContent(ctx);

    // Draw saved annotations
    annotations.forEach(item => {
      if (item.type === 'tick') {
        ctx.fillStyle = item.color || "#10b981";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText("✓", item.x, item.y);
      } else if (item.type === 'circle') {
        ctx.strokeStyle = item.color || "#ef4444";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 35, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (item.type === 'text') {
        ctx.fillStyle = item.color || "#ef4444";
        ctx.font = "bold 13px sans-serif";
        ctx.fillText(`✎ ${item.text || ''}`, item.x, item.y);
      } else if (item.type === 'stroke' && item.points && item.points.length > 1) {
        ctx.strokeStyle = item.color || "#ef4444";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(item.points[0].x, item.points[0].y);
        for (let i = 1; i < item.points.length; i++) {
          ctx.lineTo(item.points[i].x, item.points[i].y);
        }
        ctx.stroke();
      }
    });
  }, [annotations]);

  function drawWorksheetContent(ctx: CanvasRenderingContext2D) {
    // Q1
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Q1. Solve x² + 7x + 12 = 0 by factoring.", 24, 100);
    ctx.font = "13px 'Courier New', monospace";
    ctx.fillStyle = "#2563eb";
    ctx.fillText("     x² + 3x + 4x + 12 = 0", 24, 125);
    ctx.fillText("     x(x + 3) + 4(x + 3) = 0", 24, 145);
    ctx.fillText("     (x + 3)(x + 4) = 0  ==>  Roots: x = -3, x = -4", 24, 165);

    // Divider line
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 195);
    ctx.lineTo(600, 195);
    ctx.stroke();

    // Q2
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Q2. Solve 2x² - 5x - 3 = 0 using splitting method.", 24, 230);
    ctx.font = "13px 'Courier New', monospace";
    ctx.fillStyle = "#2563eb";
    ctx.fillText("     Product = 2 * (-3) = -6, Sum = -5", 24, 255);
    ctx.fillText("     2x² - 6x + 1x - 3 = 0", 24, 275);
    ctx.fillText("     2x(x - 3) + 1(x - 3) = 0  ==>  Roots: x = 3, x = -1/2", 24, 295);

    // Divider line
    ctx.beginPath();
    ctx.moveTo(20, 325);
    ctx.lineTo(600, 325);
    ctx.stroke();

    // Q3
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText("Q4. Calculate Discriminant Δ for 3x² - 4x + 5 = 0.", 24, 360);
    ctx.font = "13px 'Courier New', monospace";
    ctx.fillStyle = "#2563eb";
    ctx.fillText("     a = 3, b = -4, c = 5", 24, 385);
    ctx.fillText("     Δ = b² - 4ac = (-4)² - 4(3)(5)", 24, 405);
    ctx.fillText("     Δ = 16 - 60 = -44  ==> (Complex Conjugate Roots)", 24, 425);
  }

  // Handle Canvas clicks & drawing
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;
    const { x, y } = getCanvasCoords(e);

    if (activeTool === 'tick') {
      setAnnotations(prev => [...prev, { type: 'tick', x, y, color: '#10b981' }]);
    } else if (activeTool === 'text') {
      setAnnotations(prev => [...prev, { type: 'text', x, y, text: textInputVal, color: '#ef4444' }]);
    } else if (activeTool === 'pen') {
      setIsDrawing(true);
      setCurrentStroke([{ x, y }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !isDrawing || activeTool !== 'pen') return;
    const { x, y } = getCanvasCoords(e);
    setCurrentStroke(prev => [...prev, { x, y }]);

    // Live render current stroke
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    if (isDrawing && currentStroke.length > 1) {
      setAnnotations(prev => [...prev, { type: 'stroke', x: 0, y: 0, points: currentStroke, color: '#ef4444' }]);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  const handleClear = () => {
    setAnnotations([]);
  };

  const handleSaveAndReturn = async () => {
    setSaving(true);
    try {
      await onSave(marks, remarks, JSON.stringify(annotations));
      setSavedSuccess(true);
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 }
      });
      setTimeout(() => setSavedSuccess(false), 3500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
      {/* Left: Canvas Area */}
      <div className="flex-1 flex flex-col items-center">
        {/* Canvas Toolbar */}
        {!readOnly && (
          <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 mr-2">Tools:</span>
              
              <button
                type="button"
                onClick={() => setActiveTool('tick')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTool === 'tick'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Click anywhere to place green checkmark"
              >
                <Check className="h-4 w-4" />
                <span>Green Tick</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('pen')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTool === 'pen'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Freehand red pen to circle or underline"
              >
                <PenTool className="h-4 w-4" />
                <span>Red Pen</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTool('text')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTool === 'text'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                title="Click to stamp typed remarks"
              >
                <Type className="h-4 w-4" />
                <span>Text Remark</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors ml-2"
                title="Clear all annotations"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {activeTool === 'text' && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={textInputVal}
                  onChange={(e) => setTextInputVal(e.target.value)}
                  placeholder="Type remark to stamp..."
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
                />
              </div>
            )}
          </div>
        )}

        {/* The Interactive Canvas */}
        <div className="relative border-2 border-slate-200 rounded-xl overflow-hidden shadow-inner bg-slate-100">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className={`w-full max-w-[640px] h-auto ${readOnly ? 'cursor-default' : 'cursor-crosshair'}`}
          />
        </div>
        
        <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
          {readOnly 
            ? "Official annotated copy rendered directly from teacher's digital marking canvas."
            : "Click on equations to stamp ticks or switch to Red Pen to circle formulas. All edits version in real time."}
        </p>
      </div>

      {/* Right: Teacher Remarks & Marks Panel */}
      <div className="w-full lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 pt-5 lg:pt-0 lg:pl-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Evaluation</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                submission.status === 'graded' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {submission.status === 'graded' ? 'Graded & Returned' : 'Pending Review'}
              </span>
            </div>
            <h4 className="mt-1 text-base font-bold text-slate-900">
              Worksheet #4 Assessment
            </h4>
          </div>

          {/* Marks input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Score Obtained (out of 20)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="20"
                step="0.5"
                disabled={readOnly}
                value={marks}
                onChange={(e) => setMarks(parseFloat(e.target.value) || 0)}
                className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 tabular-nums"
              />
              <span className="text-sm font-bold text-slate-500">/ 20</span>
              <span className={`ml-auto font-bold text-xs px-2.5 py-1 rounded-lg ${
                marks >= 16 ? 'bg-emerald-50 text-emerald-700' : marks >= 12 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
              }`}>
                {((marks / 20) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Remarks text */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teacher Pedagogical Feedback
            </label>
            <textarea
              rows={4}
              disabled={readOnly}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Good method in Q2, revise formula in Q4..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 leading-relaxed"
            />
          </div>

          <div className="rounded-xl bg-purple-50 p-3 border border-purple-200">
            <span className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
              <Sparkles className="h-3.5 w-3.5 text-purple-700" />
              Focus Table Integration
            </span>
            <p className="mt-1 text-[11px] text-purple-800 leading-snug">
              Submissions scoring below 70% automatically highlight weak concept in the child's co-shared Focus Table with parents.
            </p>
          </div>
        </div>

        {/* Save button */}
        {!readOnly && (
          <div className="mt-6 pt-4 border-t border-slate-200">
            {savedSuccess ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md">
                <CheckCircle2 className="h-4 w-4" />
                <span>Saved & Returned to Student & Parent!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSaveAndReturn}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <span>Saving & Versioning...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save & Return to Student</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
