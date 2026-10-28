import os
import fitz

def build_pdf():
    base_dir = r"e:\Diradz\EDU360"
    pdf_out = os.path.join(base_dir, "docs", "workflows", "EDU360_WORKFLOWS_AND_KT_GUIDE.pdf")
    os.makedirs(os.path.dirname(pdf_out), exist_ok=True)

    html_content = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: A4;
    margin: 36pt;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 8.5pt;
    color: #0f172a;
    line-height: 1.45;
  }
  
  /* Headings */
  h1 {
    font-size: 16pt;
    font-weight: 800;
    color: #0369a1;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 4px;
    margin-top: 0;
    margin-bottom: 4px;
  }
  .doc-subtitle {
    font-size: 9.5pt;
    font-weight: 600;
    color: #475569;
    margin-bottom: 10px;
  }
  h2 {
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
    background-color: #f1f5f9;
    border-left: 4px solid #0284c7;
    padding: 4px 8px;
    margin-top: 12px;
    margin-bottom: 6px;
  }
  h3 {
    font-size: 9pt;
    font-weight: 700;
    color: #0369a1;
    margin-top: 8px;
    margin-bottom: 4px;
  }
  p {
    margin: 3px 0 5px 0;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0 10px 0;
    font-size: 7.6pt;
  }
  th, td {
    border: 0.5px solid #cbd5e1;
    padding: 4px 6px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #f8fafc;
    color: #0f172a;
    font-weight: 700;
    border-bottom: 1.5px solid #94a3b8;
  }
  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  /* Flow Diagram Containers */
  .workflow-card {
    border: 1px solid #cbd5e1;
    background-color: #ffffff;
    border-radius: 6px;
    padding: 8px 10px;
    margin: 8px 0 10px 0;
  }
  .wf-title-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
    margin-bottom: 6px;
  }
  .wf-title {
    font-size: 9.2pt;
    font-weight: 800;
    color: #0369a1;
  }
  .wf-badge {
    background-color: #e0f2fe;
    color: #0369a1;
    border: 0.5px solid #7dd3fc;
    font-size: 6.8pt;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
  }
  
  /* Visual Step Pipeline */
  .pipeline-box {
    background-color: #f8fafc;
    border: 0.5px solid #cbd5e1;
    border-radius: 4px;
    padding: 6px 8px;
    margin: 5px 0;
    font-family: monospace;
    font-size: 7.4pt;
    line-height: 1.4;
    color: #1e293b;
  }
  .step-row {
    margin: 3px 0;
  }
  .step-num {
    font-weight: 700;
    color: #0284c7;
  }
  .step-arrow {
    color: #0284c7;
    font-weight: 700;
  }
  .step-outcome {
    font-weight: 700;
    color: #059669;
  }

  /* Speaker Script Box */
  .speaker-box {
    background-color: #f0fdf4;
    border-left: 3px solid #10b981;
    padding: 4px 8px;
    margin-top: 5px;
    font-size: 7.6pt;
    color: #064e3b;
  }
  .speaker-box strong {
    color: #047857;
  }

  /* Info / Callout Boxes */
  .info-box {
    background-color: #eff6ff;
    border-left: 3px solid #3b82f6;
    padding: 5px 8px;
    margin: 6px 0;
    font-size: 7.8pt;
    color: #1e3a8a;
  }
  
  ul {
    margin: 3px 0 5px 16px;
    padding: 0;
  }
  li {
    margin-bottom: 2px;
  }
</style>
</head>
<body>

  <h1>EDU360: Virtual K-12 Academy — Complete Workflows & KT Guide</h1>
  <div class="doc-subtitle">
    Master Knowledge Transfer Handbook &bull; Plain English Walkthrough &bull; Admin Tasks &bull; Admissions-to-Accounts Financial Flow
  </div>

  <div class="info-box">
    <strong>Audience &amp; Purpose:</strong> This document is designed for giving a comprehensive, crystal-clear <strong>Knowledge Transfer (KT)</strong>. 
    It explains how the entire online schooling platform operates in <strong>simple, everyday English</strong> without complicated jargon. 
    It includes full details on <strong>Admin Task Auto-Triggers</strong>, the <strong>Admissions-to-Accounts Billing Lifecycle</strong>, and the <strong>Closed-Loop Workflows</strong> connecting all 8 roles.
  </div>

  <h2>1. Executive Summary &amp; The 8 Canonical Roles</h2>
  <p>
    Traditional school ERPs (Fedena, Entab, Teachmint) act as <em>passive filing cabinets</em>. They record historical marks and attendance after the fact, but offer zero proactive help when a student is falling behind.
  </p>
  <p>
    <strong>EDU360 is an Active Outcomes Engine built 100% for Pure Online Schooling:</strong>
  </p>
  <ul>
    <li><strong>Zero Physical School Clutter:</strong> Physical campus overheads (buses, chemistry stores, uniform stock) are completely removed. We focus 100% on virtual classroom excellence.</li>
    <li><strong>The 8 Canonical Roles:</strong> Super Admin, Academic Coordinator, Exam Coordinator, Accounts Coordinator, Admissions Coordinator, Teacher, Student, and Parent.</li>
    <li><strong>Actionable Closed Loops:</strong> An event in one role automatically triggers the next action in another role without manual emails or paper forms.</li>
  </ul>

  <table>
    <tr>
      <th style="width: 24%;">Role &amp; Portal Route</th>
      <th style="width: 22%;">Primary Device</th>
      <th>Key Mission in Simple English</th>
    </tr>
    <tr>
      <td><strong>1. Super Admin</strong> (Principal)<br><code>/admin</code></td>
      <td>Desktop / Laptop</td>
      <td>Executive cockpit. Priority Triage (Red/Orange/Green), automated compliance audit trails, task escalation oversight, and dual-signature exit clearance.</td>
    </tr>
    <tr>
      <td><strong>2. Academic Coordinator</strong><br><code>/academic_coordinator</code></td>
      <td>Desktop / Tablet</td>
      <td>Curriculum pacing surveillance (weeks vs units delivered), AI Timetable Governor (1-click substitute allocation), and faculty SLA workload relief.</td>
    </tr>
    <tr>
      <td><strong>3. Exam Coordinator</strong><br><code>/exam_coordinator</code></td>
      <td>Desktop</td>
      <td>Exam schedule planning, question paper blueprint freezes (72h prior), accounts-gated hall tickets, and paper moderation distribution.</td>
    </tr>
    <tr>
      <td><strong>4. Accounts Coordinator</strong><br><code>/accounts_coordinator</code></td>
      <td>Desktop / POS</td>
      <td>Real-time arrears aging ledger (0-15d, 16-30d, 30+d), admission fee reconciliation, hardship fee waivers, and exam clearance overrides.</td>
    </tr>
    <tr>
      <td><strong>5. Admissions Coordinator</strong><br><code>/admissions_coordinator</code></td>
      <td>Desktop CRM / Mobile</td>
      <td>Virtual enquiry pipeline, telephonic call notes &amp; lead temperature, entrance evaluation, and 1-click atomic SIS student conversion.</td>
    </tr>
    <tr>
      <td><strong>6. Teacher</strong><br><code>/teacher</code></td>
      <td>Desktop / Canvas</td>
      <td>10-Minute live auto-attendance, in-browser SpeedGrader with digital red pen, 1-Week Remedial Focus Table, and syllabus delivery logging.</td>
    </tr>
    <tr>
      <td><strong>7. Student</strong> (Sec &amp; Jr)<br><code>/student</code> &amp; <code>/junior</code></td>
      <td>Laptop / Tablet</td>
      <td>Secondary LMS (1-click live join, homework dropzone, AI Socratic tutor) + Junior K-5 gamified adventure timetable and quests.</td>
    </tr>
    <tr>
      <td><strong>8. Parent</strong><br><code>/parent</code></td>
      <td>Mobile Phone</td>
      <td>Anti-spam moving announcement slider, 10-minute nightly rough-book verification, live class radar, and instant fee checkout with PDF receipt.</td>
    </tr>
  </table>

  <h2>2. Deep-Dive: How Admin Tasks are Triggered, Relieved &amp; Escalated</h2>
  <p>
    One of the core features of the Super Admin and Coordinator cockpits is the <strong>Automated Administrative Tasks Engine</strong>. 
    Tasks are not just manually typed to-do lists—they are <strong>event-driven system triggers</strong> governed by SLA countdown timers.
  </p>

  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">A. Event-Driven Task Auto-Triggers (System Automation)</span>
      <span class="wf-badge">Backend Engine: /api/admin/tasks/auto-trigger</span>
    </div>
    <p>When specific critical events happen in the school, the system automatically creates an Admin Task with an assigned role and SLA timer:</p>
    <ul>
      <li><strong>Event 1: <code>absence_streak</code> (Welfare Intervention)</strong><br>
        <em>Trigger:</em> A student misses 3 consecutive online class days without an approved leave note.<br>
        <em>Generated Task:</em> "Student Absent 3+ Consecutive Days: Initiate Welfare Phone Check" assigned to Class Teacher with an <strong>8-Hour SLA</strong>.
      </li>
      <li><strong>Event 2: <code>exam_concluded</code> (Moderation Dossier)</strong><br>
        <em>Trigger:</em> Examination period ends.<br>
        <em>Generated Task:</em> "Publish Grade Moderation &amp; Verification Dossier" assigned to Exam Coordinator with a <strong>120-Hour (5 Days) SLA</strong>.
      </li>
      <li><strong>Event 3: <code>remedial_pending</code> (Remedial Sprint Review)</strong><br>
        <em>Trigger:</em> Term exam papers graded and students score &le; 70%.<br>
        <em>Generated Task:</em> "Verify 1-Week Remedial Sprint Day 1 Rough Notebooks" assigned to Subject Teacher with a <strong>48-Hour SLA</strong>.
      </li>
      <li><strong>Event 4: <code>pacing_lag</code> (Curriculum Delay)</strong><br>
        <em>Trigger:</em> A department's delivered units fall &gt; 15% behind the academic calendar.<br>
        <em>Generated Task:</em> "Curriculum Pacing Recovery Plan" assigned to Academic Coordinator with a <strong>72-Hour SLA</strong>.
      </li>
    </ul>
  </div>

  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">B. The Human-in-the-Loop Task Relief &amp; Escalation Lifecycle</span>
      <span class="wf-badge">State Machine: Pending ➔ Relief Requested ➔ Extension / Migration / Escalation</span>
    </div>
    <div class="pipeline-box">
      <div class="step-row"><span class="step-num">State 1: PENDING</span> ➔ Task is active with dynamic SLA countdown (e.g., 48 hours remaining).</div>
      <div class="step-row"><span class="step-num">State 2: WORKLOAD STRAIN</span> ➔ Teacher has heavy class duties or illness ➔ Clicks <strong>[Request Task Relief]</strong> and submits a reason note.</div>
      <div class="step-row"><span class="step-num">State 3: SLA CLOCK PAUSED</span> ➔ <span class="step-outcome">Zero Penalty:</span> The SLA timer stops immediately. The task transitions to <code>relief_requested</code>. Academic Coordinator is alerted.</div>
      <div class="step-row"><span class="step-num">State 4: COORDINATOR DECISION</span> ➔ Academic Coordinator chooses one of three options:
        <br>&bull; <strong>Option A (Grant Extension):</strong> Extends deadline by +12h, +24h, +48h, or +72h. SLA clock resumes with new due date.
        <br>&bull; <strong>Option B (Migrate Task):</strong> Reassigns the task to an available peer teacher with zero negative marks on the original teacher.
        <br>&bull; <strong>Option C (Escalate to Principal):</strong> If the issue involves statutory compliance or unresolved departmental failure, escalates to Super Admin with mandatory justification.
      </div>
    </div>
    <div class="speaker-box">
      <strong>🎙️ What to Say in KT:</strong> 
      "Explain that tasks in EDU360 are living automated workflows. The system automatically creates tasks when emergencies happen (like 3 absences in a row). And teachers can pause the clock with one click if they feel overwhelmed, allowing coordinators to give extra time or peer support."
    </div>
  </div>

  <h2>3. Deep-Dive: Admissions ➔ Accounts Fee Flow &amp; Financial Lifecycle</h2>
  <p>
    In many schools, admissions and fee collection are disconnected. In EDU360, when a new student is admitted, it triggers an <strong>atomic financial handshake</strong> into the Accounts Coordinator's ledger.
  </p>

  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">A. The 1-Click SIS Conversion &amp; Billing Event</span>
      <span class="wf-badge">Endpoint: POST /api/admin/crm/enquiries/{id}/convert</span>
    </div>
    <div class="pipeline-box">
      <div class="step-row"><span class="step-num">Step 1 (Admissions Lead):</span> Parent submits online enquiry ➔ Admissions logs phone notes ➔ Sets lead temperature (Hot/Warm/Cold) ➔ Schedules entrance evaluation.</div>
      <div class="step-row"><span class="step-num">Step 2 (Entrance Cleared):</span> Student clears entrance exam ➔ Admissions Coordinator selects Class &amp; Section, enters Admission Fee (e.g., ₹25,000), fee status, and clicks <strong>[Convert to SIS]</strong>.</div>
      <div class="step-row"><span class="step-num">Step 3 (Atomic SIS Creation):</span>
        <br>&bull; Student record created in SIS database with unique Admission No: <strong>EDU-2026-XXX</strong> and permanent Roll Number.
        <br>&bull; Uploaded intake documents (Birth Certificate, Previous Report Card, Transfer Certificate) are promoted to <strong>OfficialDocument</strong> in the SIS Vault with status <em>Pending Verification (Awaiting Principal Seal)</em>.
      </div>
      <div class="step-row"><span class="step-num">Step 4 (Automated Accounts Ledger Routing):</span>
        <br>&bull; <strong>Scenario A (Fee Paid at Counter/Online):</strong> System creates a reconciled <code>PaymentTransaction</code> with unique UTR number (<code>UPI/timestamp/ADMISSION</code>) linked to HDFC Collections Gateway, generating official receipt <strong>REC-ADM-2026-XXX</strong>.
        <br>&bull; <strong>Scenario B (Fee Unpaid / Partial):</strong> System creates a <code>FeeDefaulter</code> record with <code>is_admission_fee = True</code> and <code>amount_due = ₹25,000</code>. It immediately enters the Accounts Arrears Aging Ledger!
      </div>
    </div>
  </div>

  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">B. Accounts Coordinator Management (Arrears, Waivers &amp; Hall Ticket Gating)</span>
      <span class="wf-badge">Portal: /accounts_coordinator &amp; /admin</span>
    </div>
    <p>Once the admission fee or regular term fee enters the Accounts ledger, the Accounts Coordinator manages it using four built-in financial tools:</p>
    <ul>
      <li><strong>1. Real-Time Arrears Aging Buckets:</strong> Automatically organizes unpaid student balances into <strong>0–15 Days</strong>, <strong>16–30 Days</strong>, and <strong>30+ Days Overdue</strong> buckets.</li>
      <li><strong>2. Counter Payment Collection &amp; UTR Reconciliation:</strong> If a parent pays at the counter via Cash, Cheque, Demand Draft, or Bank Transfer, the bursar logs the payment, enters the bank UTR reference, and issues a tamper-evident receipt.</li>
      <li><strong>3. Management Hardship Waivers &amp; Concessions:</strong> If a family faces financial distress, the bursar can grant an authorized fee discount (e.g., ₹5,000 waiver). The system records <code>waiver_amount</code>, <code>waiver_reason</code>, and <code>waiver_approved_by</code> without deleting the original invoice history.</li>
      <li><strong>4. Institutional Exam Clearance Override:</strong> Normally, students with unpaid fees have their term exam hall tickets locked. If the family has an agreement with the school, the Accounts Coordinator can toggle <code>exam_clearance = True</code>. This <strong>unlocks the hall ticket immediately</strong> while keeping the unpaid fee balance active in the financial ledger!</li>
    </ul>
    <div class="speaker-box">
      <strong>🎙️ What to Say in KT:</strong> 
      "Highlight how Admissions and Accounts are completely synchronized. Converting a lead creates the student profile, puts intake documents into the vault, and creates the fee bill. And in Accounts, the bursar can collect payments, grant hardship waivers, or unlock an exam hall ticket with one click without losing track of the money."
    </div>
  </div>

  <h2>4. The 7 Core Operational Workflows (Summary Guide)</h2>

  <!-- WF 1 -->
  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">WF 1: 10-Minute Live Class Auto-Attendance Rule</span>
      <span class="wf-badge">Live Classes ➔ Attendance ➔ Parent</span>
    </div>
    <div class="pipeline-box">
      Teacher launches class (T=0) ➔ Student clicks 1-Click Join ➔ Webhook records join timestamp &Delta;T.
      <br>&bull; &Delta;T &le; 10m: <strong>PRESENT</strong> in SIS.
      <br>&bull; 10m &lt; &Delta;T &le; 25m: <strong>LATE</strong> (Teacher 1-click acknowledge).
      <br>&bull; &Delta;T &gt; 25m or No Join: <strong>ABSENT</strong>.
      <br>&bull; <strong>3 Consecutive Absences:</strong> Triggers CRITICAL RED alert on Admin dashboard + Priority WhatsApp to parent.
    </div>
  </div>

  <!-- WF 2 -->
  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">WF 2: In-Browser SpeedGrader Canvas &amp; Digital Red Pen</span>
      <span class="wf-badge">Teacher ➔ Student ➔ SIS Marks</span>
    </div>
    <div class="pipeline-box">
      Student uploads worksheet ➔ Teacher opens SpeedGrader in browser (zero file downloads) ➔ Uses Digital Red Pen to draw checkmarks and write notes on canvas ➔ Selects rubric deduction tags (-2) ➔ Clicks [Finalize] ➔ Marks locked to SIS report card immediately.
    </div>
  </div>

  <!-- WF 3 -->
  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">WF 3: The 1-Week Remedial Focus Sprint (&le; 70% Score)</span>
      <span class="wf-badge">Exams ➔ Remedial Table ➔ Rough Book Practice</span>
    </div>
    <div class="pipeline-box">
      Exam graded ➔ If score &le; 70%, student is auto-enrolled in 7-day Math Focus Sprint (Mrs. Ananya Verma, Class 8-B).
      <br>&bull; Student solves daily micro-problem in <strong>physical rough notebook</strong> &amp; uploads photo.
      <br>&bull; Teacher checks rough work steps against rubric checkpoint &amp; approves.
      <br>&bull; <strong>Nightly Parent Co-Tracking:</strong> Parent checks physical rough book for 10 minutes at night &amp; signs off in app ➔ Unlocks Day 2!
    </div>
  </div>

  <!-- WF 4 -->
  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">WF 4: 15-Minute Missed Homework Cutoff &amp; Backlog Evidence</span>
      <span class="wf-badge">Background Worker ➔ Parent App</span>
    </div>
    <div class="pipeline-box">
      Teacher sets 5:00 PM cutoff ➔ Background worker sweeps unsubmitted homework every 15 minutes ➔ Clock passes 5:00 PM ➔ Status transitions from PENDING to BACKLOG ➔ Generates timestamped forensic evidence ID <strong>#EVD-BKLOG-X</strong> ➔ Appears in Parent app as unresolved backlog.
    </div>
  </div>

  <!-- WF 5 -->
  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">WF 5: Teacher Sick Leave ➔ AI Timetable Governor ➔ Substitute Cover</span>
      <span class="wf-badge">Academic Coord ➔ Peer Teacher Portal</span>
    </div>
    <div class="pipeline-box">
      Teacher submits sick leave ➔ AI Timetable Governor scans master schedule for free teachers qualified in compatible subjects ➔ Academic Coordinator clicks [Assign Cover] ➔ Injects purple <code>SUBSTITUTION_COVER</code> badge into substitute teacher's timetable.
    </div>
  </div>

  <!-- WF 6 -->
  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">WF 6: Exam Blueprint Freeze &amp; Accounts-Gated Hall Tickets</span>
      <span class="wf-badge">Exam Coord ➔ Accounts Gating</span>
    </div>
    <div class="pipeline-box">
      Exam blueprints frozen 72h before exam ➔ Hall ticket download queries Accounts ledger ➔ Defaulters have download locked ➔ Bursar waiver or counter payment unlocks hall ticket in real-time.
    </div>
  </div>

  <!-- WF 7 -->
  <div class="workflow-card">
    <div class="wf-title-bar">
      <span class="wf-title">WF 7: Dual-Signature Student Exit &amp; Transfer Certificate (TC) Vault</span>
      <span class="wf-badge">Admin ➔ Parent ➔ Legal Lock</span>
    </div>
    <div class="pipeline-box">
      Student leaves school ➔ Accounts &amp; Academic clearances granted ➔ Admin generates TC ➔ Parent enters Digital OTP Sign-Off (timestamped in SIS) ➔ Hardcopy certificate handed over / couriered ➔ Admin scans signed receipt slip to SIS Vault ➔ Permanent legal lock with zero future dispute risk.
    </div>
  </div>

  <h2>5. Technical Transparency (Real Code vs Gemini AI vs Fallbacks)</h2>
  <table>
    <tr>
      <th style="width: 25%;">System Feature</th>
      <th style="width: 35%;">How it Runs in Real Production</th>
      <th>Fallback Mode (If AI / Network is Down)</th>
    </tr>
    <tr>
      <td><strong>Priority Triage (Red/Orange)</strong></td>
      <td><strong>100% Real Code:</strong> FastAPI background rules scanning attendance streaks, grade drops, and fee dues every 60 seconds.</td>
      <td>Always active. Zero external dependencies.</td>
    </tr>
    <tr>
      <td><strong>10-Min Auto-Attendance</strong></td>
      <td><strong>100% Real Code:</strong> Webhook listener calculating delta between student join time and class start time.</td>
      <td>Always active. Zero external dependencies.</td>
    </tr>
    <tr>
      <td><strong>SpeedGrader Digital Red Pen</strong></td>
      <td><strong>100% Real Code:</strong> HTML5 Canvas engine with variable red-pen stroke weights, stamps, and rubric marks deduction.</td>
      <td>Always active. Zero external dependencies.</td>
    </tr>
    <tr>
      <td><strong>Admin Task Auto-Triggers</strong></td>
      <td><strong>100% Real Code:</strong> Event-driven task creation with SLA timers, human relief state machine, and escalation paths.</td>
      <td>Always active. Runs directly inside SQLite/PostgreSQL.</td>
    </tr>
    <tr>
      <td><strong>Admissions-to-Accounts Handshake</strong></td>
      <td><strong>100% Real Code:</strong> Atomic database transaction creating Student profile, vault documents, and fee ledger entry.</td>
      <td>Always active. Zero external dependencies.</td>
    </tr>
    <tr>
      <td><strong>1-Week Remedial Sprint</strong></td>
      <td>Calls Google Gemini 1.5/2.0 API with weak concepts to generate 7-day micro-practice syllabus.</td>
      <td>Uses an algorithmic math curriculum template so the 7-day sprint generates instantly without failure.</td>
    </tr>
    <tr>
      <td><strong>Rough Work Pre-Check</strong></td>
      <td>Uses Gemini Vision to read student handwritten rough work photos against the teacher's rubric checkpoint.</td>
      <td>Shows the question and rubric side-by-side so the teacher can verify the paper manually in seconds.</td>
    </tr>
    <tr>
      <td><strong>AI Socratic Doubt Tutor</strong></td>
      <td>Calls Gemini Chat API instructed to guide students with step-by-step hints without giving direct answers.</td>
      <td>Uses a curated dictionary of Socratic questions sorted by math chapters.</td>
    </tr>
  </table>

  <h2>6. Live Product Demo Click Cheat-Sheet (5-Minute Screen Share)</h2>
  <table>
    <tr>
      <th style="width: 14%;">Portal &amp; Role</th>
      <th style="width: 22%;">Login Credentials</th>
      <th>Exact Click Path to Demonstrate on Screen</th>
    </tr>
    <tr>
      <td><strong>1. Super Admin</strong><br><code>/admin</code></td>
      <td><code>admin</code><br><code>Password123</code></td>
      <td>Show top <strong>Priority Triage Cards</strong> (Red alert for 3 absences). Open <strong>Admin Tasks</strong> table ➔ Show SLA countdown timer, [Request Relief], and 1-click statutory audit export.</td>
    </tr>
    <tr>
      <td><strong>2. Admissions</strong><br><code>/admissions_coordinator</code></td>
      <td><code>admissions_coordinator</code><br><code>Password123</code></td>
      <td>Open enquiry pipeline. Click on a student lead ➔ Click <strong>[Convert to SIS]</strong>. Show that Roll No is minted, documents promoted to Vault, and fee invoice sent to Accounts!</td>
    </tr>
    <tr>
      <td><strong>3. Accounts</strong><br><code>/accounts_coordinator</code></td>
      <td><code>accounts_coordinator</code><br><code>Password123</code></td>
      <td>Show the <strong>Arrears Aging Ledger</strong>. Find the converted student's admission fee. Demonstrate collecting counter payment with UTR or toggling [Exam Clearance Override].</td>
    </tr>
    <tr>
      <td><strong>4. Teacher</strong><br><code>/teacher</code></td>
      <td><code>teacher_mat</code><br><code>Password123</code></td>
      <td>Filter Focus Table by <code>Class 8-B</code>. Show &le; 70% remedial enrollment. Click Day 2 rough work modal. Open SpeedGrader ➔ Draw red-pen checkmark on canvas &amp; click [Finalize Grade].</td>
    </tr>
    <tr>
      <td><strong>5. Parent</strong><br><code>/parent</code></td>
      <td><code>parent</code><br><code>Password123</code></td>
      <td>Show the top moving announcement carousel. Open the <strong>10-Minute Nightly Co-Tracking Card</strong> and click [Sign-off Rough Book]. Show live video class radar.</td>
    </tr>
    <tr>
      <td><strong>6. Junior K-5</strong><br><code>/junior</code></td>
      <td><code>junior</code><br><code>Password123</code></td>
      <td>Show the illustrated <strong>Adventure Quest Timetable</strong>, magic booster chests, and visual live class launchpad designed for elementary children.</td>
    </tr>
  </table>

  <div class="info-box" style="margin-top: 10px;">
    <strong>Universal Login Password:</strong> Every single test account uses the universal password: <code>Password123</code>.<br>
    <strong>Offline Login Resilience:</strong> Even if the backend server is stopped, the frontend uses an instant 3-second offline cache so you will never get locked out during a demo.
  </div>

</body>
</html>"""

    print("Compiling publication-grade KT Guide PDF via PyMuPDF...")
    mediabox = fitz.paper_rect("a4")
    margin_x = 36
    margin_y = 36
    rect = fitz.Rect(margin_x, margin_y, mediabox.width - margin_x, mediabox.height - margin_y)

    story = fitz.Story(html=html_content)

    def rectfn(rect_num, filled):
        return mediabox, rect, None

    raw_temp = os.path.join(base_dir, "raw_kt_guide_temp.pdf")
    if os.path.exists(raw_temp):
        try: os.remove(raw_temp)
        except Exception: pass

    writer = fitz.DocumentWriter(raw_temp)
    story.write(writer, rectfn)
    writer.close()

    # Stamp running headers and footers
    doc = fitz.open(raw_temp)
    total_pages = len(doc)
    print(f"Base PDF compiled: {total_pages} pages. Stamping running headers and footers...")

    for page_num in range(total_pages):
        page = doc[page_num]
        
        # Header on pages 2+
        if page_num > 0:
            header_text = "EDU360 Virtual K-12 Academy — Workflows & Knowledge Transfer (KT) Guide"
            page.insert_text(
                fitz.Point(margin_x, 22),
                header_text,
                fontsize=7,
                fontname="helv",
                color=(0.3, 0.4, 0.5)
            )
            page.draw_line(
                fitz.Point(margin_x, 26),
                fitz.Point(mediabox.width - margin_x, 26),
                color=(0.8, 0.85, 0.9),
                width=0.5
            )

        # Footer on all pages
        footer_text = "CONFIDENTIAL &bull; EDU360 VIRTUAL K-12 ACADEMY &bull; KNOWLEDGE TRANSFER HANDBOOK"
        page_str = f"Page {page_num + 1} of {total_pages}"
        
        page.draw_line(
            fitz.Point(margin_x, mediabox.height - 24),
            fitz.Point(mediabox.width - margin_x, mediabox.height - 24),
            color=(0.8, 0.85, 0.9),
            width=0.5
        )
        page.insert_text(
            fitz.Point(margin_x, mediabox.height - 14),
            footer_text,
            fontsize=6.5,
            fontname="helv",
            color=(0.4, 0.45, 0.5)
        )
        page.insert_text(
            fitz.Point(mediabox.width - margin_x - 50, mediabox.height - 14),
            page_str,
            fontsize=7,
            fontname="helv",
            color=(0.2, 0.25, 0.3)
        )

    if os.path.exists(pdf_out):
        try: os.remove(pdf_out)
        except Exception: pass

    doc.save(pdf_out)
    doc.close()

    if os.path.exists(raw_temp):
        try: os.remove(raw_temp)
        except Exception: pass

    file_size_kb = os.path.getsize(pdf_out) / 1024
    print(f"SUCCESS! Final PDF created at: {pdf_out}")
    print(f"Total Pages: {total_pages}, Size: {file_size_kb:.1f} KB")

if __name__ == "__main__":
    build_pdf()
