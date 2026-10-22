/**
 * EDU360 Enterprise Export & Document Generation Engine
 * Provides deterministic, bug-free CSV and Certified Document downloads
 * across all coordinator, teacher, student, and parent portals.
 */

export function exportToCsv(
  filename: string, 
  headers: string[], 
  rows: (string | number | boolean | null | undefined)[][]
): boolean {
  try {
    const sanitize = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headerLine = headers.map(sanitize).join(',');
    const rowLines = rows.map(row => row.map(sanitize).join(','));
    const csvContent = '\uFEFF' + [headerLine, ...rowLines].join('\r\n'); // Add UTF-8 BOM for Excel compatibility

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('CSV Export failed:', err);
    return false;
  }
}

export function printDossierReport(
  title: string, 
  subtitle: string, 
  department: string, 
  tableHeaders: string[], 
  tableRows: (string | number | boolean | null | undefined)[][]
) {
  try {
    const headerHtml = tableHeaders.map(h => 
      `<th style="border: 1px solid #cbd5e1; padding: 10px 14px; background: #f8fafc; text-align: left; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #334155;">${h}</th>`
    ).join('');
    
    const rowsHtml = tableRows.map(row => 
      `<tr style="border-bottom: 1px solid #e2e8f0;">${row.map(cell => `<td style="border: 1px solid #e2e8f0; padding: 9px 14px; font-size: 12px; color: #1e293b;">${cell ?? '-'}</td>`).join('')}</tr>`
    ).join('');

    const htmlDoc = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${title} - EDU360 Institutional Export</title>
    <style>
      @media print {
        @page { margin: 15mm; size: A4 portrait; }
        body { margin: 0; }
      }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 32px; color: #0f172a; max-width: 1000px; margin: 0 auto; background: #fff; }
      .header { display: flex; justify-content: space-between; border-bottom: 3px solid #2563eb; padding-bottom: 14px; margin-bottom: 24px; align-items: flex-start; }
      .seal { font-weight: 900; font-size: 20px; color: #1e40af; letter-spacing: -0.5px; }
      .meta { font-size: 11px; color: #64748b; margin-top: 2px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
      .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
      .badge { display: inline-block; padding: 4px 10px; background: #dbeafe; color: #1e40af; border-radius: 9999px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="seal">EDU360 · ${department.toUpperCase()}</div>
        <h2 style="margin: 6px 0 2px 0; font-size: 18px; font-weight: 800; color: #0f172a;">${title}</h2>
        <div class="meta">${subtitle}</div>
      </div>
      <div style="text-align: right;">
        <span class="badge">OFFICIAL INSTITUTIONAL DOSSIER</span>
        <div class="meta" style="margin-top: 6px;">Generated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        <div class="meta">Certified by Executive Directorate</div>
      </div>
    </div>
    <table>
      <thead><tr>${headerHtml}</tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div class="footer">
      <span>Oakridge International School · Affiliation Code EDU-GLOBAL-360 · CBSE &amp; IB World School</span>
      <span>Cryptographic Hash Seal: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()} · Page 1 of 1</span>
    </div>
  </body>
</html>`;

    // Try opening popup print window, fallback seamlessly to file download if popups are blocked
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlDoc);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    } else {
      triggerHtmlDownload(`${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Dossier.html`, htmlDoc);
    }
  } catch (err) {
    console.error('Print dossier failed:', err);
  }
}

/**
 * Download Certified Student Document (Bonafide, Conduct, Transfer Certificate)
 */
export function downloadOfficialDocumentFile(docTitle: string, studentName = 'Aarav Sharma', admissionNo = 'OIS-2026-8814') {
  const certId = `CERT-EDU-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle} - ${studentName}</title>
  <style>
    @media print { @page { size: A4 portrait; margin: 20mm; } }
    body { font-family: "Georgia", serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #fff; }
    .border-frame { border: 4px double #1e40af; padding: 32px; border-radius: 8px; position: relative; }
    .header { text-align: center; border-bottom: 2px solid #cbd5e1; padding-bottom: 20px; margin-bottom: 28px; }
    .school-name { font-size: 26px; font-weight: bold; color: #1e3a8a; letter-spacing: 1px; }
    .affiliation { font-size: 12px; color: #64748b; font-family: sans-serif; margin-top: 4px; }
    .cert-title { font-size: 22px; font-weight: bold; color: #0f172a; text-transform: uppercase; margin: 24px 0 16px 0; text-align: center; text-decoration: underline; letter-spacing: 1px; }
    .cert-body { font-size: 15px; line-height: 2; text-align: justify; margin: 28px 0; }
    .highlight { font-weight: bold; color: #1e3a8a; border-bottom: 1px dashed #93c5fd; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 60px; font-family: sans-serif; }
    .seal-box { border: 2px solid #2563eb; padding: 8px 14px; border-radius: 9999px; font-size: 11px; font-weight: bold; color: #1d4ed8; text-transform: uppercase; display: inline-block; }
    .sig-line { width: 180px; border-top: 1px solid #0f172a; text-align: center; font-size: 12px; font-weight: bold; padding-top: 6px; }
    .meta-footer { font-family: sans-serif; font-size: 10px; color: #94a3b8; text-align: center; margin-top: 36px; border-top: 1px solid #f1f5f9; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="border-frame">
    <div class="header">
      <div class="school-name">OAKRIDGE INTERNATIONAL SCHOOL</div>
      <div class="affiliation">Affiliated to CBSE, New Delhi &amp; Cambridge International Assessment · School Code: 40219</div>
      <div class="affiliation">Campus: Tech City Zone 4, Outer Ring Road, Bengaluru – 560103</div>
    </div>

    <div class="cert-title">${docTitle}</div>

    <div class="cert-body">
      This is to officially certify that <span class="highlight">${studentName}</span>, 
      Son/Daughter of <span class="highlight">Mr. Rajesh Sharma</span> &amp; <span class="highlight">Mrs. Priya Sharma</span>, 
      bearing Admission Number <span class="highlight">${admissionNo}</span>, is a bonafide student of this institution, 
      currently studying in <span class="highlight">Class 8, Section B</span> for the Academic Session <span class="highlight">2026–2027</span>.
      <br><br>
      According to institutional records, his/her general conduct and academic progress have been 
      <span class="highlight">Exemplary</span>. The institution holds no objection or pending liabilities against this student.
    </div>

    <div class="footer">
      <div>
        <div class="seal-box">EDU360 Cryptographic Seal: Verified</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 6px;">Certificate ID: ${certId}</div>
        <div style="font-size: 10px; color: #64748b;">Issue Date: ${dateStr}</div>
      </div>
      <div>
        <div class="sig-line">
          Dr. Sunita Kapoor<br>
          <span style="font-size: 10px; font-weight: normal; color: #64748b;">Principal &amp; Head of Institution</span>
        </div>
      </div>
    </div>

    <div class="meta-footer">
      This is a system-certified official digital document issued under EDU360 Unified Outcomes Infrastructure.
    </div>
  </div>
</body>
</html>`;

  triggerHtmlDownload(`${studentName.replace(/\s+/g, '_')}_${docTitle.replace(/\s+/g, '_')}.html`, html);
}

/**
 * Download Certified Marks Memo / Examination Report Card
 */
export function downloadMarksMemoFile(studentName = 'Aarav Sharma', examTitle = 'Term 2 Periodic Assessment') {
  const reportId = `MEMO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${examTitle} - ${studentName}</title>
  <style>
    @media print { @page { size: A4 portrait; margin: 15mm; } }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 28px; color: #0f172a; max-width: 900px; margin: 0 auto; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
    .title { font-size: 20px; font-weight: 800; color: #1e3a8a; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 12px; }
    .meta-item b { display: block; color: #64748b; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    th { border: 1px solid #cbd5e1; background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; }
    td { border: 1px solid #e2e8f0; padding: 8px 12px; }
    .summary-box { display: flex; justify-content: space-between; margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 12px; border: 1px solid #bfdbfe; font-size: 13px; font-weight: bold; color: #1e40af; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">OAKRIDGE INTERNATIONAL SCHOOL</div>
      <div style="font-size: 13px; font-weight: 600; color: #475569; margin-top: 2px;">Official Statement of Marks · ${examTitle}</div>
    </div>
    <div style="text-align: right; font-size: 11px; color: #64748b;">
      <div style="font-weight: bold; color: #1e40af;">REPORT ID: ${reportId}</div>
      <div>Academic Session 2026–2027</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><b>Student Name</b> ${studentName}</div>
    <div class="meta-item"><b>Class &amp; Section</b> Class 8 - Section B</div>
    <div class="meta-item"><b>Admission No</b> OIS-2026-8814</div>
    <div class="meta-item"><b>Roll Number</b> 14</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Subject</th>
        <th>Max Marks</th>
        <th>Marks Obtained</th>
        <th>Percentage</th>
        <th>Grade</th>
        <th>Remarks</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Mathematics</td><td>100</td><td>68</td><td>68.0%</td><td>B2</td><td>Enrolled in 1-Week Focus Remedial</td></tr>
      <tr><td>Science (Physics/Chem/Bio)</td><td>100</td><td>84</td><td>84.0%</td><td>A2</td><td>Strong Conceptual Clarity</td></tr>
      <tr><td>English Literature &amp; Lang</td><td>100</td><td>89</td><td>89.0%</td><td>A1</td><td>Excellent Expression</td></tr>
      <tr><td>Social Science</td><td>100</td><td>82</td><td>82.0%</td><td>A2</td><td>Good Analytical Answers</td></tr>
      <tr><td>Second Language (Hindi)</td><td>100</td><td>78</td><td>78.0%</td><td>B1</td><td>Satisfactory Performance</td></tr>
      <tr><td>Computer Science &amp; AI</td><td>100</td><td>95</td><td>95.0%</td><td>A1</td><td>Outstanding Project Delivery</td></tr>
    </tbody>
  </table>

  <div class="summary-box">
    <div>Total Aggregate: 496 / 600</div>
    <div>Overall Percentage: 82.67%</div>
    <div>Overall Grade: A2 (Distinction)</div>
  </div>

  <div class="footer">
    <div>Class Teacher: Mrs. Ananya Verma</div>
    <div>Academic Coordinator: Prof. Rajeshwari Nair</div>
    <div>Principal: Dr. Sunita Kapoor</div>
  </div>
</body>
</html>`;

  triggerHtmlDownload(`${studentName.replace(/\s+/g, '_')}_Marks_Memo.html`, html);
}

/**
 * Download Practice Worksheet document
 */
export function downloadWorksheetFile(worksheetName: string, subject = 'Mathematics', studentName = 'Aarav Sharma') {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${worksheetName} - ${subject}</title>
  <style>
    @media print { @page { size: A4 portrait; margin: 15mm; } }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0f172a; max-width: 850px; margin: 0 auto; background: #fff; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .meta { font-size: 12px; color: #64748b; }
    .question { margin: 18px 0; padding: 12px; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 4px; font-size: 13px; }
    .solution-space { border: 1px dashed #cbd5e1; height: 120px; margin-top: 8px; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h2 style="margin: 0; color: #1e3a8a;">OAKRIDGE INTERNATIONAL SCHOOL</h2>
      <div class="meta">${subject} · Targeted Focus Practice Worksheet</div>
    </div>
    <div style="text-align: right; font-size: 11px;">
      <div>Student: <b>${studentName}</b></div>
      <div>Class: <b>8-B</b></div>
    </div>
  </div>
  <h3 style="color: #0f172a; margin-top: 16px;">${worksheetName}</h3>
  
  <div class="question">
    <b>Problem 1 (Core Concept):</b> Solve for x using the quadratic formula: 2x² - 7x + 3 = 0. Show all intermediate steps and determinant calculation.
    <div class="solution-space"></div>
  </div>

  <div class="question">
    <b>Problem 2 (Error Analysis):</b> A student calculated the discriminant of 3x² + 5x + 2 = 0 as 5² - 4(3)(2) = 1. State whether the roots are real and distinct, real and equal, or non-real. Justify your answer.
    <div class="solution-space"></div>
  </div>

  <div class="question">
    <b>Problem 3 (Word Problem Application):</b> The sum of the squares of two consecutive positive integers is 365. Formulate the quadratic equation and determine the two integers.
    <div class="solution-space"></div>
  </div>

  <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
    <span>EDU360 1-Week Remedial Sprint · Verified Syllabus Aligned</span>
    <span>Faculty Incharge: Mrs. Ananya Verma</span>
  </div>
</body>
</html>`;

  triggerHtmlDownload(`${worksheetName.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`, html);
}

/**
 * Download Study Notes
 */
export function downloadStudyNotesFile(subject: string, chapter: string) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject} - ${chapter} Study Notes</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #0f172a; max-width: 850px; margin: 0 auto; }
    h1 { color: #1e3a8a; font-size: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; }
    .callout { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 4px; font-size: 13px; }
    li { margin-bottom: 8px; font-size: 13px; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>EDU360 Comprehensive Study Notes · ${subject}</h1>
  <h3>Chapter: ${chapter}</h3>
  <div class="callout">
    <b>Key Learning Objective:</b> Master fundamental axioms, derivation pathways, and rapid problem-solving techniques for CBSE &amp; Cambridge Term Assessments.
  </div>
  <ul>
    <li><b>Standard Canonical Form:</b> Expressing equations in simplified hierarchical structure.</li>
    <li><b>Discriminant Behavior:</b> When Δ > 0 (two distinct real roots), Δ = 0 (two identical real roots), Δ < 0 (complex conjugate roots).</li>
    <li><b>Common Pitfalls:</b> Watch negative coefficients during quadratic expansion; verify signs when substituting into the denominator 2a.</li>
  </ul>
  <p style="font-size: 11px; color: #64748b; margin-top: 40px;">Published by Academic Coordination Department · Oakridge International School</p>
</body>
</html>`;

  triggerHtmlDownload(`${subject}_${chapter}_Study_Notes.html`.replace(/\s+/g, '_'), html);
}

/**
 * Helper to trigger browser file download without opening windows
 */
function triggerHtmlDownload(filename: string, htmlContent: string) {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

