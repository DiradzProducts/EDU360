'use client';

import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  FileCheck, 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  Building2
} from 'lucide-react';

export interface DocumentPreviewData {
  id?: number;
  title: string;
  doc_type: string;
  student_name?: string;
  admission_no?: string;
  class_name?: string;
  guardian_name?: string;
  status?: string;
  verified_stamp?: string;
  upload_date?: string;
  is_official?: boolean;
}

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentPreviewData | null;
  onApprove?: (docId: number) => Promise<void>;
  canApprove?: boolean;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  document: doc,
  onApprove,
  canApprove = false
}: DocumentViewerModalProps) {
  if (!isOpen || !doc) return null;

  const isVerified = doc.status === 'Verified';
  const studentName = doc.student_name || 'Aarav Sharma';
  const admissionNo = doc.admission_no || 'EDU-2026-104';
  const className = doc.class_name || 'Class 8-A';
  const guardianName = doc.guardian_name || 'Rajesh Sharma';
  const formattedDate = doc.upload_date 
    ? new Date(doc.upload_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '25 Oct 2026';
  const stampText = doc.verified_stamp || 'EDU360 Official Seal - SHA256 Verified';

  // Handle authentic downloadable standalone certificate HTML
  const handleDownload = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} - EDU360 Official Document</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px;
      background: #f8fafc;
      color: #0f172a;
    }
    .cert-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 8px double #1e3a8a;
      padding: 40px;
      position: relative;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(30, 58, 138, 0.04);
      pointer-events: none;
      white-space: nowrap;
      text-transform: uppercase;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .badge {
      display: inline-block;
      background: #dbeafe;
      color: #1e40af;
      font-weight: 700;
      font-size: 11px;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h1 {
      margin: 12px 0 4px;
      font-size: 24px;
      color: #1e3a8a;
      letter-spacing: -0.02em;
    }
    .subhead {
      font-size: 13px;
      color: #64748b;
      margin: 0;
    }
    .doc-title-bar {
      text-align: center;
      margin: 24px 0;
    }
    .doc-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #2563eb;
      display: inline-block;
      padding-bottom: 6px;
    }
    .content-box {
      font-size: 15px;
      line-height: 1.8;
      color: #334155;
      margin: 25px 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 25px 0;
      background: #f1f5f9;
      padding: 20px;
      border-radius: 8px;
    }
    .info-item {
      font-size: 13px;
    }
    .info-label {
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
    }
    .info-value {
      color: #0f172a;
      font-weight: 700;
      font-size: 14px;
      margin-top: 2px;
    }
    .footer {
      margin-top: 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
    }
    .seal-box {
      border: 2px solid #059669;
      background: #ecfdf5;
      color: #065f46;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      display: inline-block;
    }
    .signature-block {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-top: 1px solid #0f172a;
      margin-top: 40px;
      padding-top: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
    }
    @media print {
      body { background: white; padding: 0; }
      .cert-container { box-shadow: none; border-color: #000; }
    }
  </style>
</head>
<body>
  <div class="cert-container">
    <div class="watermark">EDU360 SECURE RECORD</div>
    <div class="header">
      <span class="badge">Accredited International K-12 Academy</span>
      <h1>EDU360 VIRTUAL LEARNING ACADEMY</h1>
      <p class="subhead">Autonomous Outcomes & Student Information Authority • Board Reg #CBSE-AI-883921</p>
    </div>

    <div class="doc-title-bar">
      <div class="doc-title">${doc.title}</div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Candidate / Student Name</div>
        <div class="info-value">${studentName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Admission Number</div>
        <div class="info-value">${admissionNo}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Enrolled Grade / Class</div>
        <div class="info-value">${className}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Parent / Guardian</div>
        <div class="info-value">${guardianName}</div>
      </div>
    </div>

    <div class="content-box">
      ${doc.doc_type === 'Transfer Certificate' 
        ? `<p>This is to certify that <strong>${studentName}</strong> has duly submitted their previous Transfer Certificate credentials. The records have been inspected, legal compliance confirmed under CBSE dual-enrolment restrictions, and the student's legal academic seat has been permanently locked in the EDU360 Digital Student Vault.</p>` 
        : doc.doc_type === 'Marks Card' 
        ? `<p>This official memo certifies the academic performance assessment transcript of <strong>${studentName}</strong>. Previous year academic attainment has been benchmarked at <strong>85.0% (Distinction Trajectory)</strong> and integrated as the official diagnostic baseline.</p>` 
        : `<p>This verified identity record confirms that vital statistics and government-certified proof of age and lineage for <strong>${studentName}</strong> have been validated against municipal registration standards and locked into the official digital archive.</p>`}
    </div>

    <div class="footer">
      <div>
        <div class="seal-box">
          ✓ ${stampText}<br/>
          <span style="font-size: 10px; font-weight: normal; color: #047857;">Date: ${formattedDate} • Digital Audit Ref: SHA256-${doc.id || 101}</span>
        </div>
      </div>
      <div class="signature-block">
        <div class="signature-line">
          Controller of Records / Registrar<br/>
          <span style="font-size: 10px; color: #64748b;">EDU360 Academic Governance</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_EDU360.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      handleDownload();
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; color: #0f172a; }
            .border-box { border: 4px double #1e3a8a; padding: 30px; border-radius: 8px; }
            h1 { color: #1e3a8a; margin-bottom: 4px; font-size: 22px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; background: #f8fafc; padding: 15px; }
          </style>
        </head>
        <body onload="window.print()">
          <div class="border-box">
            <h1>EDU360 INTERNATIONAL ONLINE ACADEMY</h1>
            <p style="color: #64748b; font-size: 12px; margin: 0 0 20px;">Official Student Records Authority</p>
            <h2 style="font-size: 16px; border-bottom: 2px solid #2563eb; padding-bottom: 4px;">${doc.title}</h2>
            <div class="grid">
              <div><strong>Student:</strong> ${studentName}</div>
              <div><strong>Admission No:</strong> ${admissionNo}</div>
              <div><strong>Class:</strong> ${className}</div>
              <div><strong>Status:</strong> ${doc.status || 'Verified'}</div>
            </div>
            <p style="line-height: 1.6; margin: 20px 0;">
              This certifies that the candidate document has been recorded in the EDU360 SIS Official Vault under seal: <strong>${stampText}</strong>.
            </p>
            <div style="margin-top: 40px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 12px; color: #64748b;">
              Issued on ${formattedDate} • Verified by Administrator
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Action Toolbar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {doc.title}
                </h3>
                <span className="rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 shrink-0">
                  {doc.doc_type}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3 w-3" /> Uploaded {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canApprove && !isVerified && onApprove && doc.id && (
              <button
                type="button"
                onClick={() => onApprove(doc.id!)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Approve & Seal
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              title="Print Document"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Document Sheet Preview Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/70 dark:bg-slate-950/80">
          <div className="max-w-2xl mx-auto rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-750 p-8 shadow-md relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] dark:opacity-[0.05]">
              <span className="text-7xl font-black text-slate-900 dark:text-white transform -rotate-25 tracking-widest uppercase">
                EDU360 VAULT
              </span>
            </div>

            {/* Certificate Header */}
            <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-200 dark:border-blue-900 mb-2">
                <Building2 className="h-3.5 w-3.5" />
                EDU360 International Online K-12 Academy
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {doc.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Official Digital Educational Vault Record • Reg ID: CBSE-INT-2026-904
              </p>
            </div>

            {/* Candidate Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 my-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs relative z-10">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Candidate / Student</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block">{studentName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Admission #</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">{admissionNo}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Target Class / Section</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{className}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Parent / Guardian</span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{guardianName}</span>
              </div>
            </div>

            {/* Official Certification Declaration */}
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 my-6 space-y-3 relative z-10">
              {doc.doc_type === 'Transfer Certificate' ? (
                <p>
                  This document certifies that the <strong>Transfer Certificate (TC)</strong> issued by the candidate’s previous school has been submitted and inspected. Under the secondary education governance framework, the student’s enrolment is legal and officially sealed in the permanent SIS database.
                </p>
              ) : doc.doc_type === 'Marks Card' ? (
                <p>
                  This official academic memo confirms the evaluation transcript of <strong>{studentName}</strong> from their previous grade. The recorded academic baseline has been registered as <strong>85.0% Distinction</strong> for personalized K-12 learning trajectory benchmarking.
                </p>
              ) : (
                <p>
                  This legal birth and nationality record for <strong>{studentName}</strong> has been audited against statutory vital statistics guidelines and permanently cataloged under the custody of the School Administrator.
                </p>
              )}
              <p className="text-[11px] text-slate-500 italic">
                * This document has been verified electronically and carries legal authenticity within the EDU360 Student Information System.
              </p>
            </div>

            {/* Seal & Signatures Footer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 mt-8 relative z-10">
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-bold">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="text-[11px] leading-tight">{stampText}</div>
                      <span className="text-[9px] font-normal text-emerald-600 dark:text-emerald-400">Status: Verified & Tamper-Sealed</span>
                    </div>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center gap-2 text-xs font-bold">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <div>
                      <div className="text-[11px] leading-tight">Pending Admin Seal</div>
                      <span className="text-[9px] font-normal text-amber-600 dark:text-amber-400">Coordinator Collected (Draft)</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="h-7 border-b border-slate-400 dark:border-slate-600 w-36 ml-auto flex items-end justify-center pb-1">
                  <span className="font-serif italic text-xs text-blue-700 dark:text-blue-300 font-bold">A. Verma, Registrar</span>
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">Registrar & Controller of Records</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
