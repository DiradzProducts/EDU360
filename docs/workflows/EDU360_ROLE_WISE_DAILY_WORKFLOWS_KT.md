# 🎓 EDU360 — Role-Wise Daily Activities & Operational Workflows
### The Master 8-Role Daily Lifecycle, Inter-Role Connections & Action Runbook
**Document Version:** 2.1 (Role-Wise Operational Blueprint — Fully Synchronized)  
**Target Audience:** Engineering Leads, Product Managers, Trainers, Operations & School Stakeholders  
**Scope:** 100% Pure Online Virtual Schooling (The 8 Canonical Roles)  

---

## 📋 Table of Contents
1. [Executive Overview & Daily Life Cycle Architecture](#1-executive-overview--daily-life-cycle-architecture)
2. [Role 1: Super Admin / Principal (`/admin`)](#2-role-1-super-admin--principal-admin)
3. [Role 2: Academic Coordinator (`/academic_coordinator`)](#3-role-2-academic-coordinator-academic_coordinator)
4. [Role 3: Exam Coordinator (`/exam_coordinator`)](#4-role-3-exam-coordinator-exam_coordinator)
5. [Role 4: Accounts Coordinator (`/accounts_coordinator`)](#5-role-4-accounts-coordinator-accounts_coordinator)
6. [Role 5: Admissions Coordinator (`/admissions_coordinator`)](#6-role-5-admissions-coordinator-admissions_coordinator)
7. [Role 6: Teacher Portal (`/teacher`)](#7-role-6-teacher-portal-teacher)
8. [Role 7: Student Portals (Secondary `/student` & Junior K–5 `/junior`)](#8-role-7-student-portals-secondary-student--junior-k5-junior)
9. [Role 8: Parent Portal (`/parent`)](#9-role-8-parent-portal-parent)
10. [Master Cross-Role Handshake Summary Table](#10-master-cross-role-handshake-summary-table)

---

## 1. Executive Overview & Daily Life Cycle Architecture

In a pure online virtual school, students, teachers, and school leaders do not see each other in physical hallways. **Software is the school.** 

If a role operates in a silo without continuous handshakes, the school fails: attendance slips, late homework piles up, fee arrears grow unnoticed, and struggling students drop out.

**EDU360 coordinates all 8 canonical roles through a structured daily chronological rhythm:**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           A TYPICAL ACADEMIC DAY IN EDU360                                      │
├──────────────────────┬──────────────────────────────────────────────────────────────────────────┤
│ 08:00 AM – 09:00 AM  │ Morning Preparedness & Substitution Cover (Academic Coord + Teachers)     │
│ 09:00 AM – 01:00 PM  │ Live Video Instruction & 10-Min Auto-Attendance (Teachers + Students)    │
│ 01:00 PM – 03:00 PM  │ CRM Lead Outreach, Admissions SIS Conversion & Accounts Ledger Sync     │
│ 03:00 PM – 05:00 PM  │ In-Browser SpeedGrader Canvas Marking & 1-Week Focus Table Reviews       │
│ 05:00 PM – 05:15 PM  │ Strict Homework Cutoff & 15-Minute Automated Backlog Sweeper Worker      │
│ 07:00 PM – 08:30 PM  │ Nightly 10-Minute Parent Rough-Book Co-Tracking & Sign-Off (Parents)     │
│ Continuous (24x7)    │ 60-Second Priority Triage & Automated Task SLA Governance (Admin)        │
└──────────────────────┴──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Role 1: Super Admin / Principal (`/admin`)

> **Primary Mission:** Institutional health surveillance, statutory legal compliance, high-priority triage intervention, and dual-signature school exit authorization.

```
                  ┌──────────────────────────────────────────────┐
                  │       SUPER ADMIN DAILY WORKFLOW             │
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[08:30 AM Morning]              [01:00 PM Mid-Day]               [04:30 PM Closing]
Review Priority Triage          Task Escalation Reviews          CBSE Statutory Audit Export
- Red: Unexcused Absences       - SLA breaches from Coord        Dual-Signature Exit Archive
- Red: >= 15% Score Drops       - Direct intervention orders     Annual Promotion Rollovers
- Orange: 30d Fee Arrears
```

### 🌅 A. Morning Routine (08:30 AM – 10:00 AM)
1. **Priority Triage Cockpit Scan (`/admin` Top Cards)**:
   - Evaluates the **Red / Orange / Green** automated intelligence cards.
   - **RED Flag Check (Attendance Radar)**: Identifies any student with $\ge 3$ consecutive unexcused online class absences.
   - **Excused Leave Auto-Filter Invariant**: Students with teacher-approved parent leaves on file (`LeaveRequest.status == "Approved"`) are **automatically excluded** from the unexcused absence count. Triage shows: *"Attendance Radar: Filtered unexcused absences ({count} student(s) on approved medical/parent leaves excluded from disciplinary triage escalation)"*.
   - **RED Flag Check (Academics)**: Identifies any class section with $\ge 15\%$ sudden grade drops in recent test submissions.
   - **ORANGE Flag Check (Finance)**: Reviews total institutional fee arrears crossing 30+ days overdue.
   - **Action**: Clicks `[Initiate Care Case]` or `[Assign Class Teacher to Call Parents]` on critical red flags.

### ☀️ B. Core Day Operations (10:00 AM – 03:30 PM)
1. **Executive Task Escalation Governance**:
   - Opens the **Admin Tasks Cockpit**.
   - Filters by `status = escalated_to_principal`.
   - When an Academic Coordinator or Exam Controller cannot resolve an SLA breach, Principal reviews the formal documented rationale and takes executive action.
2. **Admissions CRM & Enrollment Monitoring**:
   - Monitors the virtual admissions funnel (`New Lead` $\to$ `Follow-Up` $\to$ `Entrance Cleared` $\to$ `Converted to SIS`).
   - Ensures admissions conversion targets are met without operational bottlenecks.

### 🌆 C. Evening / Closing Activities (03:30 PM – 05:30 PM)
1. **Dual-Signature Student Exit & Transfer Certificate (TC) Sealing**:
   - When a student applies for school transfer, Principal verifies that Accounts clearance (zero balance) and Academic clearance (grades recorded) are marked.
   - Reviews the parent's digital OTP acceptance timestamp and scanned handover slip.
   - Applies the **Permanent Digital Principal Seal**, locking the Transfer Certificate in the SIS Vault with zero legal dispute risk.
2. **CBSE Statutory Compliance Audit Export**:
   - Clicks `[Export Statutory Audit Logs]`, generating a cryptographically checksummed CSV stream recording every administrative override, login, grade alteration, and fee concession.

---

## 3. Role 2: Academic Coordinator (`/academic_coordinator`)

> **Primary Mission:** Teacher coverage governance, curriculum pacing surveillance, and faculty SLA workload relief.

```
               ┌───────────────────────────────────────────────────────┐
               │         ACADEMIC COORDINATOR DAILY WORKFLOW           │
               └──────────────────────────┬────────────────────────────┘
                                          │
        ┌─────────────────────────────────┼────────────────────────────────┐
        ▼                                 ▼                                ▼
[08:00 AM Morning Cover]          [11:00 AM Pacing Surveillance]   [03:00 PM Workload Relief]
Absence Alerts from Faculty       Live Syllabus Pacing Meter       Review Teacher Relief Requests
Match Available Peer Teachers     Flag Lagging Units (<80%)        Grant SLA Extensions (+24h/+48h)
1-Click Assign Substitution       Deploy 48h Remedial Task         Rebalance Faculty Tasks
```

### 🌅 A. Morning Routine: Substitution Cover (08:00 AM – 09:00 AM)
1. **Unplanned Faculty Absence Response**:
   - If a teacher reports an emergency absence, system flags unassigned periods in Red.
   - Coordinator clicks `[Find Available Faculty]`. The algorithm checks free faculty slots matching subject competency.
   - Clicks `[Assign Substitution]`. The replacement teacher immediately receives a `SUBSTITUTION_COVER` period injected into their daily personal schedule in `/teacher`.

### ☀️ B. Core Day: Syllabus Pacing Surveillance (11:00 AM – 01:00 PM)
1. **Curriculum Delivery Monitoring**:
   - Pacing checkoffs are self-serviced directly by assigned teachers in the Teacher Portal (`/teacher`) via `POST /api/teacher/curriculum/log-unit`.
   - Coordinator maintains real-time oversight over syllabus completion percentage across all grades.
   - If a teacher falls $\ge 2$ weeks behind term pacing, coordinator dispatches an automated **48-Hour Remedial Pacing Task**.

### 🌆 C. Afternoon: Human-in-the-Loop SLA Workload Relief (03:00 PM – 05:00 PM)
1. **Teacher Workload Relief & Rebalancing**:
   - Teachers under heavy exam evaluation or medical stress click `[Request Task Relief / Migration]` on any assigned task.
   - Coordinator reviews the request and chooses:
     - `[Grant Extension]` (+12h, +24h, +48h, +72h)
     - `[Migrate Task]` to peer faculty with zero penalty on original teacher
     - `[Escalate to Principal]` with formal documentation.

---

## 4. Role 3: Exam Coordinator (`/exam_coordinator`)

> **Primary Mission:** Question paper secrecy vault, hall ticket issuance, marks moderation, and consolidated report card release.

```
                 ┌───────────────────────────────────────────────┐
                 │          EXAM COORDINATOR WORKFLOW            │
                 └───────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Pre-Exam Phase]                 [Exam Execution Phase]           [Post-Exam Moderation & Release]
Question Paper Secrecy Vault     Issue Timetable & Hall Tickets   Review Sealed Teacher Gradebooks
Syllabus Compliance Review       Virtual Proctoring Roster        Cryptographic Ledger Signature
Lock Papers in Digital Vault     Live Webcam Attendance Check     Generate Batch Report Cards + AI
```

### 🌅 A. Pre-Exam Blueprint & Secrecy Vault
1. **Question Paper Custody & Sealing**:
   - Teachers draft question papers and submit them digitally to the Exam Cell.
   - Exam Coordinator reviews question blueprint, weightage, and syllabus alignment.
   - Clicks `[Seal & Digital Lock Exam Paper in Secrecy Vault]`, assigning a cryptographic barcode hash (e.g. `SEC-2026-MTH-9844-SEALED`).

### ☀️ B. Hall Ticket Issuance & Timetables
1. **Board-Mandated Hall Ticket Release**:
   - Exam timetables and digital admit cards are published for students across classes.
   - In accordance with CBSE regulations, hall tickets are released without fee blockades.

### 🌆 C. Marks Moderation Handshake & Report Card Release
1. **Subject Submission Readiness Matrix**:
   - Coordinator monitors whether every subject faculty has submitted and sealed their gradebooks (`is_locked = true`).
2. **Cryptographic Moderation Ledger**:
   - Clicks `[Moderate & Sign Ledger]`. Signs the gradebook and applies a digital seal.
3. **Consolidated Report Cards with Gemini AI Narratives**:
   - Once all subject teachers have sealed their grades, coordinator clicks `[Generate Batch Report Cards]`.
   - The system synthesizes subject scores, attendance percentages, and Gemini AI pedagogical narratives into official downloadable term report cards.

---

## 5. Role 4: Accounts Coordinator (`/accounts_coordinator`)

> **Primary Mission:** Real-time fee arrears aging, counter collection reconciliation, hardship waivers, and admissions fee invoicing.

```
                 ┌───────────────────────────────────────────────┐
                 │       ACCOUNTS COORDINATOR WORKFLOW           │
                 └───────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Morning Ledger Review]          [Daytime Collections & Waivers]  [Admissions & Exam Gating]
Arrears Aging Ledger             Counter Payment Reconciliation   Process Converted Intake Invoices
- 0 to 15 Days Overdue           NEFT / RTGS / Cash Logging       Grant Hardship Fee Waivers
- 16 to 30 Days Overdue          Mint Unique Bank UTR References  Institutional Exam Clearance Override
- 30+ Days Critical Overdue      Instant PDF Receipt Generation   (Unlocks Hall Ticket Without Debt Wipe)
```

### 🌅 A. Morning Ledger & Aging Audit (09:00 AM – 10:30 AM)
1. **Real-Time Arrears Aging Audit**:
   - Opens the **Financial Ledgers Cockpit**.
   - Audits unpaid student fee balances sorted into dynamic aging buckets (0–15d, 16–30d, 30+d critical).

### ☀️ B. Collections & Hardship Waivers (10:30 AM – 03:00 PM)
1. **Counter Payment Reconciliation**:
   - Logs offline bank transfers (NEFT/RTGS) and counter payments with immutable bank reference UTRs.
   - Generates digitally sealed PDF receipts with verification QR codes.
2. **Management Hardship Fee Waivers**:
   - Records authorized fee concessions with mandatory audit metadata (`waiver_amount`, `waiver_reason`, `waiver_approved_by`).

---

## 6. Role 5: Admissions Coordinator (`/admissions_coordinator`)

> **Primary Mission:** Virtual enquiry capture, lead telephonic nurturing, entrance test scheduling, and atomic 1-click SIS student conversion.

```
                 ┌───────────────────────────────────────────────┐
                 │       ADMISSIONS COORDINATOR WORKFLOW         │
                 └───────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Morning CRM Intake]             [Daytime Telephonic Outreach]    [Evening SIS Conversion]
Review New Enquiries             Conduct Phone / Video Calls      Entrance Test Cleared
Score Lead Temperature           Log Notes & Set Next Touches     1-Click [Convert to SIS]
(Hot / Warm / Cold)              Schedule Virtual Tours           Mint Roll No + Vault Docs
Statutory Drop Protection        Administer Entrance Evaluations  Auto-Inject Invoice to Accounts
```

### 🌅 A. Lead Management & Telephonic Outreach
1. **CRM Pipeline Triage**: Categorizes prospective leads by interest temperature (`Hot`, `Warm`, `Cold`).
2. **Sibling Detection Rule**: When a prospective parent registers with a mobile number already on file, the system detects existing guardian records, prompting: *"Existing Family on File: Register as Sibling?"*, linking the new student under the existing parent account while provisioning a separate student SIS record.

### ☀️ B. The 1-Click Atomic SIS Conversion
1. **Candidate Enrolment Handshake**:
   - Upon clearing the entrance evaluation, coordinator clicks `[Convert to SIS]`.
   - **Atomic 3-Way Action**: Mints unique Student Roll Number $\to$ Promotes admission documents to SIS Vault $\to$ Posts tuition fee invoice into Accounts ledger.

---

## 7. Role 6: Teacher Portal (`/teacher`)

> **Primary Mission:** Live online class instruction, 10-minute auto-attendance, SpeedGrader canvas marking, 1-Week Remedial Focus Table, Gradebook Lock, and instant parent communication.

```
                 ┌───────────────────────────────────────────────┐
                 │           TEACHER DAILY WORKFLOW              │
                 └───────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Morning Live Instruction]       [Afternoon In-Browser Grading]   [Evening Remedial & Handshake]
Launch Live Video Class (T=0)    Open SpeedGrader Canvas          Class 8-B Math Focus Table
10-Min Auto-Attendance Webhook   Digital Red Pen & Stamps         Inspect Rough Notebooks
Present / Late / Excused Tags    OCR / Paper Studio Marking       One-Time Gradebook Lock
Review Parent Leave Requests     Marks Sealed & Immutable         Forward to Exam Coordinator
```

### 🌅 A. Morning Live Classes & Attendance
1. **10-Minute Auto-Attendance Engine**:
   - Captures student join time $\Delta T$: $\le 10$m **Present**, $10-25$m **Late**, $>25$m **Absent**.
2. **Parent Leave Request Review Handshake**:
   - In the **Parent Leaves Tab**, teacher reviews medical/casual absence applications.
   - When teacher clicks `[Approve]`, the student's status updates to `Excused Leave` across attendance rosters, and the Admin Priority Triage unexcused absence radar is dynamically adjusted.

### ☀️ B. Afternoon SpeedGrader Canvas & Descriptive Paper Evaluation
1. **In-Browser SpeedGrader Canvas**:
   - Digital red pen, stamps, warning circles, and text feedback on student homework sheets without downloading local files.
2. **Descriptive Exam Paper Studio & Gradebook Lock**:
   - Evaluates descriptive answers with AI assistance and rubric criteria.
   - **One-Time Gradebook Lock Mandate**:
     - When all papers are evaluated, teacher clicks `Submit Final Grades to Exam Cell (One-Time Lock)`.
     - The exam status updates to `is_locked = true`.
     - Inputs become strictly read-only (`Marks Sealed & Locked`), preventing post-submission alterations and forwarding custody to the Exam Coordinator.

### 🌆 C. Remedial Focus Table & Multi-Subject Parent Chat
1. **1-Week Remedial Focus Sprint**:
   - Scoped to teacher's subject (**Mathematics** — Mrs. Ananya Verma) and section (**Class 8-B**).
   - Students scoring $\le 70\%$ are enrolled in 7-day action plans; students $> 70\%$ are exempt.
   - Inspects student physical rough notebook photos and approves daily practice.
2. **Instant Cross-Tab 1-on-1 Parent Chat**:
   - Teacher responds to parent queries in `/teacher`.
   - Powered by `BroadcastChannel('edu360_chat_channel')`: Message pushes instantly with **0ms latency** to the parent's open browser tab without polling delay.

---

## 8. Role 7: Student Portals (Secondary `/student` & Junior K–5 `/junior`)

> **Primary Mission:** Attending live classes, interactive homework submissions, Socratic doubt resolution, and remedial rough-book practice.

```
                 ┌───────────────────────────────────────────────┐
                 │           STUDENT DAILY WORKFLOW              │
                 └───────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Secondary (/student)]           [Junior K–5 (/junior)]           [Evening Remedial Drills]
1-Click Live Video Join          Adventure Quests & Magic Book    Solve Daily Focus Target
Homework Submission Dropzone     Phonics In-Browser Audio         Write in Physical Rough Book
Student Vault & Certs            Star Badges & Quizzes            Upload Photo for Teacher Check
```

### 🎒 A. Secondary Student Portal (`/student` — Classes 6–12)
1. **Live Sessions & Recordings Archive**: 1-click join links for scheduled live video classes and searchable video recordings.
2. **Homework Submission**: Uploads worksheet PDFs before the 05:00 PM cutoff.
3. **Physical Rough Book Practice**: Students on the Focus Table solve daily math micro-drills in their physical rough notebooks, snapping photos for teacher approval.

### 🎈 B. Junior Elementary Portal (`/junior` — K–5)
1. **Dedicated Identity Context**: Bound 1:1 to **Ananya Sharma (Class 3-A, Roll #8, Student ID: 7)**.
2. **Strict 1:1 Student Boundary**: Sibling account switching is removed from student login; children stay in their own age-appropriate dashboard.
3. **Pure Virtual Learning Environment**: Free from obsolete physical bus radar widgets and administrative clutter.
4. **Interactive In-Browser Phonics Studio**: Voice feedback and phonetic audio activities execute smoothly in-browser without recording or storing minor voice audio on servers (fully compliant with DPDP Act 2023 & COPPA).
5. **Magic Homework Book & Star Quizzes**: Playful daily quests with sound fanfares, star badge rewards, and printable worksheets.

---

## 9. Role 8: Parent Portal (`/parent`)

> **Primary Mission:** Isolated multi-child oversight, high-signal attendance awareness, nightly rough-book sign-off, multi-subject teacher chat, and fee payments.

```
                 ┌───────────────────────────────────────────────┐
                 │            PARENT DAILY WORKFLOW              │
                 └───────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Multi-Child Sibling Switcher]   [Daytime Teacher Dialogue]       [07:30 PM Nightly Co-Tracking]
Toggle: Aarav (8-B) / Ananya (3-A)Multi-Subject 1-on-1 Chat Desk  Inspect Child's Rough Notebook
Isolated Timetables & Fees       Real-Time Cross-Tab Sync (0ms)   Review Daily Math Micro-Target
Separate PTM Appointments        Submit Medical Leave Requests    Tap [Nightly Sign-Off] in App
```

### 🌅 A. Multi-Child Sibling Management & Context Switcher
1. **100% Isolated Child Contexts**:
   - Header pill switcher toggles between siblings: **Aarav Sharma (Class 8-B)** and **Ananya Sharma (Class 3-A)**.
   - **Isolation Invariant**: Switching children completely swaps the active academic timetable, teacher roster, homework submissions, and fee accounts.
   - **Isolated PTM Slots**: Eliminates confusing "shared 10-minute sibling extensions". Each child has their own dedicated conference appointments with their respective grade faculty.

### ☀️ B. Multi-Subject Faculty Chat & Leave Submissions
1. **Multi-Subject 1-on-1 Faculty Chat**:
   - Parents select any subject faculty (Mathematics, Science, English, etc.) or Homeroom teacher from the directory.
   - Powered by `BroadcastChannel('edu360_chat_channel')`: Parent messages and teacher replies push in real time across open tabs with **zero polling lag**.
2. **Digital Leave Applications**:
   - Parents submit medical or casual leave requests with attached doctor notes.
   - Tracks approval stage (`Submitted` $\to$ `Reviewed by Teacher` $\to$ `Attendance Adjusted`).

### 🌙 C. The 10-Minute Nightly Co-Tracking
1. **Rough Notebook Physical Sign-Off**:
   - Parent physically inspects the child's handwritten math solution in their physical rough book.
   - Taps **`[Sign-Off Rough Book]`** to seal Day $N$ and advance the student to Day $N+1$.

---

## 10. Master Cross-Role Handshake Summary Table

The table below summarizes the exact inputs, outputs, and trigger paths connecting all 8 roles:

| Triggering Role | Action Executed | Receiving Role | Automated System Reaction |
| :--- | :--- | :--- | :--- |
| **Parent** | Submits Leave Request | **Teacher Portal** | Alerts teacher in Leave Review queue with medical notes & dates. |
| **Teacher** | Approves Leave Request | **SIS Attendance & Admin Triage** | Updates attendance to `Excused Leave` and filters student from Admin Chronic Absenteeism alert. |
| **Teacher** | Clicks `[Submit Final Grades (Lock)]` | **Exam Coordinator** | Seals gradebook (`is_locked = true`), disables further teacher edits, and enables report card release. |
| **Exam Coord** | Generates Batch Report Cards | **Parent & Student Vault** | Compiles verified subject scores and Gemini AI qualitative remarks into official report cards. |
| **Teacher / Parent** | Sends Chat Message | **Cross-Tab Real-Time Sync** | `BroadcastChannel` pushes message with 0ms delay across open parent and teacher tabs. |
| **Parent Switcher** | Toggles Child (Aarav $\leftrightarrow$ Ananya) | **Parent Portal View** | Completely swaps academic context, teacher directory, fee milestones, and PTM slots with zero cross-leakage. |
| **Admissions** | Enquires with Existing Parent Phone | **Admissions CRM** | Auto-detects existing family on file; prompts to register as sibling under same guardian account. |
| **Admissions** | Clicks `[Convert to SIS]` | **Student & Accounts** | Mints Roll No, vaults intake documents, and creates fee invoice in Accounts ledger. |
| **Student** | Clicks `[Join Live Class]` | **Teacher & SIS** | Webhook records timestamp: $\le 10$m Present, $10-25$m Late, $>25$m Absent. |
| **Teacher** | Grades Exam $\le 70\%$ | **Focus Table & Student** | Auto-enrolls student in 1-Week Remedial Focus Sprint (Class 8-B Math). |
| **Parent** | Taps `[Sign-Off Rough Book]` | **Student & Focus Table** | Verifies Day $N$ rough practice, advancing student to Day $N+1$. |
| **Clock Engine** | 05:00 PM Cutoff Passes | **Teacher & Parent** | Sweeps unsubmitted homework, transitions to `BACKLOG`, mints `#EVD-BKLOG-X`. |
| **Teacher** | Submits Sick Leave | **Academic Coord** | AI Timetable Governor matches free peer faculty; 1-click assigns `SUBSTITUTION_COVER`. |
| **Teacher** | Clicks `[Request Task Relief]` | **Academic Coord** | Pauses SLA timer; Coordinator grants $+12$h to $+72$h extension or migrates task. |
| **Super Admin** | Applies Digital Seal | **Parent & SIS Vault** | Seals Transfer Certificate with Parent OTP + Scanned Hardcopy (Zero Legal Dispute). |

---

### 💡 KT Presenter Tip:
When presenting to stakeholders, walk through **one complete day** from 08:00 AM to 08:30 PM using the chronological order above. Show how each role's daily life is simplified, zero clerical clutter exists, and every action is linked in a closed loop!
