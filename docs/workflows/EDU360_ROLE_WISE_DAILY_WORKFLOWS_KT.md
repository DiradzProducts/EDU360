# 🎓 EDU360 — Role-Wise Daily Activities & Operational Workflows
### The Master 8-Role Daily Lifecycle, Inter-Role Connections & Action Runbook
**Document Version:** 2.0 (Role-Wise Operational Blueprint)  
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
8. [Role 7: Student Portals (Secondary & Junior K–5)](#8-role-7-student-portals-secondary--junior-k5)
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
- Red: 3+ Absences Streak       - SLA breaches from Coord        Dual-Signature Exit Archive
- Red: >= 15% Score Drops       - Direct intervention orders     Annual Promotion Rollovers
- Orange: 30d Fee Arrears
```

### 🌅 A. Morning Routine (08:30 AM – 10:00 AM)
1. **Priority Triage Cockpit Scan (`/admin` Top Cards)**:
   - Evaluates the **Red / Orange / Green** automated intelligence cards.
   - **RED Flag Check**: Identifies any student with $\ge 3$ consecutive unexcused online class absences (e.g., *Rahul Sharma, Class 8-B*).
   - **RED Flag Check**: Identifies any class section with $\ge 15\%$ sudden grade drops in recent test submissions.
   - **ORANGE Flag Check**: Reviews total institutional fee arrears crossing 30+ days overdue.
   - **Action**: Clicks `[Initiate Care Case]` on critical red flags to assign a priority welfare check to the class teacher.

### ☀️ B. Core Day Operations (10:00 AM – 03:30 PM)
1. **Executive Task Escalation Governance**:
   - Opens the **Admin Tasks Cockpit**.
   - Filters by `status = escalated_to_principal`.
   - When an Academic Coordinator or Exam Controller cannot resolve an SLA breach (e.g., unmoderated question papers or prolonged departmental delay), Principal reviews the formal documented rationale and takes executive action.
2. **Admissions CRM & Enrollment Monitoring**:
   - Monitors the virtual admissions funnel (`New Lead` $\to$ `Follow-Up` $\to$ `Entrance Cleared` $\to$ `Converted to SIS`).
   - Ensures admissions conversion targets are met without operational bottlenecks.

### 🌆 C. Evening / Closing Activities (03:30 PM – 05:30 PM)
1. **Dual-Signature Student Exit & Transfer Certificate (TC) Sealing**:
   - When a student applies for school transfer, Principal verifies that Accounts clearance (zero balance) and Academic clearance (grades recorded) are marked.
   - Reviews the parent's digital OTP acceptance timestamp.
   - Reviews the high-resolution scanned copy of the physically signed handover slip.
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
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
[08:00 AM Morning Cover]         [11:00 AM Pacing Surveillance]    [03:30 PM Faculty Relief]
Check Teacher Leave Requests     Curriculum Units vs Calendar Weeks Review SLA Relief Requests
Run AI Timetable Governor        Detect > 15% Syllabus Lags        Grant +12h to +72h Extensions
1-Click Assign Substitution      Issue Department Advisories       Rebalance Tasks to Peers
```

### 🌅 A. Morning Routine (08:00 AM – 09:00 AM)
1. **Morning Teacher Absence Triage**:
   - Opens the **Timetable & Substitution Command Center**.
   - Identifies any morning emergency sick leave requests submitted by faculty.
2. **Dynamic Substitution Cover Allocation**:
   - Triggers the **AI Timetable Governor**.
   - System isolates the absent teacher's periods for the day (e.g., *Class 8-B Math at 09:30 AM*).
   - Scans master timetable matrix for available teachers who:
     - Are free during Period 2.
     - Hold matching or compatible subject competence (e.g., Physics/Math).
     - Have the lowest daily period load.
   - Clicks `[Assign Cover]`. System automatically badges `SUBSTITUTION_COVER` into the substitute teacher's schedule and updates the student class room link!

### ☀️ B. Core Day Operations (10:00 AM – 02:30 PM)
1. **Curriculum Pacing Surveillance**:
   - Reviews real-time syllabus delivery progress bars across all grades and subjects.
   - Formula: $\text{Syllabus Lag} = \text{Target Units for Week } W - \text{Logged Completed Units}$.
   - If any subject falls $> 15\%$ behind the term syllabus schedule, coordinator issues an internal curriculum recovery advisory to the department head.
2. **Remedial Focus Table Audit**:
   - Inspects active 1-Week Remedial Focus Tables (e.g. Mathematics, Class 8-B).
   - Verifies that teachers are reviewing student rough notebooks within the 24-hour turnaround window.

### 🌆 C. Afternoon Routine: Faculty Workload Relief (03:00 PM – 05:00 PM)
1. **Human-in-the-Loop Task Relief Cockpit**:
   - Opens pending task relief queue (`status = relief_requested`).
   - When a teacher clicks `[Request Task Relief]` due to illness or heavy grading volume, the SLA clock is paused immediately.
   - Coordinator selects one of three compassionate governance actions:
     - **Grant Extension**: Adds $+12\text{h}$, $+24\text{h}$, $+48\text{h}$, or $+72\text{h}$ to the deadline.
     - **Migrate Task**: Reassigns the task to an available peer teacher with zero penalty on the original teacher.
     - **Escalate to Principal**: Used only if institutional compliance is at risk.

---

## 4. Role 3: Exam Coordinator (`/exam_coordinator`)

> **Primary Mission:** Examination blueprints, exam scheduling, accounts-gated hall tickets, and answer script moderation distribution.

```
                 ┌───────────────────────────────────────────────┐
                 │         EXAM COORDINATOR WORKFLOW             │
                 └───────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Pre-Exam Phase]                 [Exam Execution Phase]           [Post-Exam Moderation]
Blueprint Schema Construction    Accounts-Gated Hall Tickets      Multimodal AI Paper Pre-Scan
Freeze Blueprint (72h prior)     Virtual Proctoring Room Roster   Route Papers to Teachers (48h)
Lock Question Papers in SIS      Monitor Live Camera Connectivity Exam Concluded Trigger -> Tasks
```

### 🌅 A. Pre-Exam Blueprint & Scheduling
1. **Question Paper Blueprint Construction**:
   - Establishes exam timetables, question formats, and cognitive domain weightages (Recall $30\%$, Application $50\%$, Analysis $20\%$).
2. **72-Hour Blueprint Freeze**:
   - Exactly 72 hours before exam commencement, executes **Blueprint Schema Freeze**.
   - No questions or marks distributions can be altered without Super Admin cryptographic override.

### ☀️ B. Financial Gating & Hall Ticket Issuance
1. **Accounts-Gated Hall Ticket Policy**:
   - System queries Accounts Coordinator ledger in real time.
   - Students with unpaid fees or unapproved financial status have hall ticket downloads locked.
   - When Accounts Coordinator grants a waiver or student pays online, hall ticket unlocks instantaneously.
2. **Virtual Invigilation Room Roster**:
   - Assigns faculty proctors to virtual examination video rooms.
   - Monitors student video feed integrity and automated webcam presence.

### 🌆 C. Post-Exam Script Distribution & Moderation
1. **Multimodal AI Paper Pre-Scan (Gemini Vision)**:
   - Scanned student answer sheets are ingested into the examination repository.
   - AI pre-scans student handwritten solutions against the blueprint answer key, flagging calculation jumps, missing formulas, and sign errors.
2. **Moderation Roster & Grading Deadlines**:
   - Distributes answer papers to designated subject teachers with strict **48-Hour SLAs**.
   - Triggers the automated event: `exam_concluded`, creating administrative verification tasks.

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

### 🌅 A. Morning Routine: Ledger & Aging Audit (09:00 AM – 10:30 AM)
1. **Real-Time Arrears Aging Audit**:
   - Opens the **Financial Ledgers Cockpit**.
   - Audits unpaid student fee balances sorted into dynamic aging buckets:
     - **0–15 Days Overdue**: Gentle automated app reminder queued.
     - **16–30 Days Overdue**: Follow-up notification to parent portal.
     - **30+ Days Critical Overdue**: Flagged in Orange on Principal's priority triage dashboard.

### ☀️ B. Core Day Operations (10:30 AM – 03:00 PM)
1. **Counter Payment Collection & Manual Reconciliation**:
   - Parents paying offline (NEFT, RTGS, Demand Draft, Cash, POS Card) are logged at the counter.
   - Coordinator inputs transaction details, bank name, and mints an immutable bank reference UTR (e.g. `UPI/1729837192/ADMISSION`).
   - Generates a tamper-evident, digitally sealed PDF fee receipt with verification QR code.
2. **Management Hardship Fee Waivers & Concessions**:
   - For families facing verified financial distress, coordinator enters an authorized fee waiver (e.g., ₹5,000 concession).
   - System records mandatory audit metadata: `waiver_amount`, `waiver_reason`, and `waiver_approved_by` without deleting original invoice audit history.

### 🌆 C. Admissions Integration & Institutional Exam Clearance (03:00 PM – 05:00 PM)
1. **Admissions Intake Invoicing Sync**:
   - When Admissions Coordinator converts an enquiry to SIS, the admission fee bill (e.g., ₹25,000) arrives in the Accounts ledger:
     - If paid: Transaction is marked reconciled.
     - If unpaid: Creates a `FeeDefaulter` record with `is_admission_fee = True`.
2. **Institutional Exam Clearance Override**:
   - When a student is blocked from downloading an examination hall ticket due to overdue fees, but management agrees to let them write the exam:
   - Accounts Coordinator toggles **`exam_clearance = True`**.
   - **Result**: Student's hall ticket unlocks immediately, while the unpaid debt remains legally active in the accounts ledger!

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

### 🌅 A. Morning Intake & Pipeline Review (09:00 AM – 10:30 AM)
1. **Enquiry Pipeline Triage**:
   - Opens the **Admissions CRM Pipeline**.
   - Reviews inbound candidate leads across stages: `New Lead` $\to$ `Follow-Up Scheduled` $\to$ `Virtual Tour Booked` $\to$ `Entrance Cleared` $\to$ `Converted to SIS`.
   - Scores lead temperature:
     - **Hot**: Immediate enrolment interest; entrance test requested.
     - **Warm**: Evaluating curriculum and fee structure; callback scheduled.
     - **Cold**: Unresponsive; automated reminder sent.

### ☀️ B. Core Day Telephonic Outreach (10:30 AM – 03:00 PM)
1. **Call Logging & Next-Touch Scheduling**:
   - Conducts admissions calls with prospective parents.
   - Logs call notes directly in candidate dossier.
   - Sets exact date and time for next follow-up touchpoint.
2. **Statutory Drop Protection**:
   - Inactive leads can only be marked `dropped` by selecting a mandatory statutory reason code (`fees_high`, `curriculum_fit`, `distance`). Dropped leads can be restored at any time.

### 🌆 C. The 1-Click Atomic SIS Conversion (03:00 PM – 05:00 PM)
1. **Candidate Enrolment Handshake**:
   - When candidate clears virtual entrance evaluation:
   - Coordinator clicks **`[Convert to SIS]`**, selects Class & Section, enters Admission Fee (e.g. ₹25,000), and uploads candidate intake documents.
2. **The 3-Way Atomic Database Action**:
   - **Student Profile**: Creates permanent `Student` record with unique Admission Number (`EDU-2026-XXX`) and active portal access.
   - **Document Vault**: Promotes candidate birth certificate, marks card, and transfer certificate to `OfficialDocument` in SIS Vault ("Pending Verification").
   - **Accounts Invoice**: Posts admission fee bill directly into Accounts Coordinator's ledger!

---

## 7. Role 6: Teacher Portal (`/teacher` & `/teacher/focus/[id]`)

> **Primary Mission:** Live online class instruction, 10-minute auto-attendance, in-browser SpeedGrader evaluation, 1-Week Remedial Focus Table management, and syllabus logging.

```
                 ┌───────────────────────────────────────────────┐
                 │           TEACHER DAILY WORKFLOW              │
                 └───────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Morning Live Instruction]       [Afternoon In-Browser Grading]   [Evening Remedial Sprint]
Launch Live Video Class (T=0)    Open SpeedGrader Canvas          Class 8-B Math Focus Table
10-Min Auto-Attendance Webhook   Digital Red Pen & Stamps         Inspect Student Rough Notebooks
Present / Late / Absent Tags     Zero File Downloads              Approve Daily Micro-Drills
1-Click Late Acknowledgment      Marks Locked into SIS            1-Click Syllabus Unit Logging
```

### 🌅 A. Morning Live Classes & Auto-Attendance (09:00 AM – 01:00 PM)
1. **Class Launch & Webhook Attendance**:
   - Teacher starts scheduled live video class at $T = 0$.
   - Students click `[Join Live Session]`. The FastAPI webhook captures join timestamp $\Delta T$:
     - $\Delta T \le 10$ mins: Automatically marked **PRESENT**.
     - $10 < \Delta T \le 25$ mins: Flagged as **LATE** (Teacher acknowledges with 1 click).
     - $\Delta T > 25$ mins or no join: Automatically marked **ABSENT**.
   - Teacher wastes zero minutes on manual roll call!

### ☀️ B. Afternoon SpeedGrader Evaluation (01:30 PM – 03:30 PM)
1. **In-Browser SpeedGrader Canvas**:
   - Teacher clicks on pending homework worksheet or exam submission.
   - Canvas loads student handwritten script inside the browser (zero downloading/saving files).
   - Selects **Digital Red Pen** (stroke weights 2px, 4px, 8px), checkmarks ($\checkmark$), crosses ($\times$), and rubric marks deduction tags ($-2$ for missing formula step).
   - Clicks `[Finalize Grade]`. Marks immediately sync to SIS gradebook.

### 🌆 C. The 1-Week Remedial Focus Table (03:30 PM – 05:00 PM)
1. **Focus Table Management**:
   - Scoped strictly to teacher's subject (**Mathematics** - Mrs. Ananya Verma) and section (**Class 8-B**).
   - Students with exam score $\le 70\%$ are enrolled in the 7-day sprint. Students $> 70\%$ are Exempt.
2. **Rough Notebook Inspection Modal**:
   - Teacher clicks Day 2 on a student's row.
   - Modal displays:
     - **Assigned Question** (e.g. *Solve for $x$: $3x + 5 = 20$*)
     - **Teacher Rubric Checkpoint** (*Step 1: Subtract 5 from both sides*)
     - **Photo of Student's Physical Rough Notebook**
   - Teacher inspects steps and clicks `[Approve ✓]`.
3. **Workload Relief & Syllabus Logging**:
   - Logs completed curriculum units with 1 click.
   - If overloaded with tasks, clicks `[Request Task Relief]` to pause SLA timer without penalty.

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
[Morning Live Sessions]          [Afternoon Homework & AI Tutor]  [Evening Remedial Drills]
1-Click Live Video Join          Submit Homework Before 5:00 PM   Solve Daily Focus Target
Virtual Presence Radar           AI Socratic Doubt Solver         Write in Physical Rough Book
(Junior K-5: Adventure Map)      View Red-Pen Graded Worksheets   Upload Photo for Teacher Check
```

### 🌅 A. Morning Live Learning (09:00 AM – 01:00 PM)
1. **Secondary Student Portal (`/student`)**:
   - Views daily class timetable. Clicks `[Join Live Class]` in 1 click.
   - Monitors Virtual Presence Radar (audio/video connectivity test).
2. **Junior K–5 Student Portal (`/junior`)**:
   - Gamified touch-first interface.
   - Daily timetable rendered as an **Illustrated Adventure Map**.
   - Completes interactive daily learning quests.

### ☀️ B. Afternoon Homework & Socratic Tutor (02:00 PM – 05:00 PM)
1. **Homework Submission Dropzone**:
   - Uploads homework worksheets before strict daily cutoff (05:00 PM).
2. **AI Socratic Doubt Tutor**:
   - When stuck on a math problem, asks the built-in AI Tutor.
   - The Socratic tutor **never** gives direct answers; it gives step-by-step hints and leading questions to build deep understanding.

### 🌆 C. Remedial Focus Sprint Execution (05:00 PM – 07:00 PM)
1. **Physical Rough Book Practice**:
   - If enrolled in Focus Table, student views today's micro-target problem.
   - Solves problem by hand in their **physical rough notebook**.
   - Snaps photo using phone/tablet and uploads to portal.
   - Waits for teacher inspection and nightly parent sign-off.

---

## 9. Role 8: Parent Portal (`/parent`)

> **Primary Mission:** High-signal attendance awareness, 10-minute nightly rough-book co-tracking, anti-spam notices, and instant fee settlement.

```
                 ┌───────────────────────────────────────────────┐
                 │            PARENT DAILY WORKFLOW              │
                 └───────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[Morning Class Awareness]        [Daytime Instant Fee Checkout]   [07:30 PM Nightly Co-Tracking]
Anti-Spam Moving Slider Carousel 2-Second Simulated Bank Checkout Inspect Child's Rough Notebook
Check Live Virtual Class Radar   Download PDF Receipt with QR     Review Daily Math Micro-Target
Verify Child Joined on Time      Zero Intrusive Spam NotificationsTap [Nightly Sign-Off] in App
```

### 🌅 A. Morning Glance & Anti-Spam Slider (08:30 AM – 09:30 AM)
1. **Anti-Spam Announcement Slider**:
   - Routine circulars, cafeteria menus, and holiday notices glide smoothly across a top banner carousel.
   - Notification tray is kept completely clean, reserved **only** for critical academic alerts.
2. **Live Virtual Class Radar**:
   - Checks radar card to verify child has connected to morning live video class.

### ☀️ B. Daytime Instant Fee Settlement (Anytime)
1. **Instant Checkout & PDF Receipt**:
   - Parent reviews upcoming or overdue fee installments.
   - Clicks `[Pay Fees Now]`. Simulated 2-second bank authorization completes payment.
   - Instantly downloads official PDF receipt with verification QR code and line-item breakdown.

### 🌙 C. The 10-Minute Nightly Co-Tracking (07:00 PM – 08:30 PM)
1. **Rough Notebook Physical Verification**:
   - At 07:00 PM, Parent App receives a high-signal notification: *"Tonight's 10-Minute Remedial Check is Ready"*.
   - Parent opens **10-Minute Nightly Co-Tracking Hub**.
   - Shows child's daily math target and teacher's approval status.
   - Parent physically opens child's physical rough notebook, checks that the problem was written out on paper, and taps **`[Sign-Off Rough Book]`**.
   - **Result**: Day $N$ is sealed, unlocking Day $N+1$ for tomorrow!

---

## 10. Master Cross-Role Handshake Summary Table

The table below summarizes the exact inputs, outputs, and trigger paths connecting all 8 roles:

| Triggering Role | Action Executed | Receiving Role | Automated System Reaction |
| :--- | :--- | :--- | :--- |
| **Admissions** | Clicks `[Convert to SIS]` | **Student & Accounts** | Mints Roll No, vaults intake documents, and creates fee invoice in Accounts ledger. |
| **Student** | Clicks `[Join Live Class]` | **Teacher & SIS** | Webhook records timestamp: $\le 10$m Present, $10-25$m Late, $>25$m Absent. |
| **Attendance Engine**| 3 Consecutive Absences | **Super Admin & Parent**| Triggers CRITICAL RED alert on Admin dashboard + priority WhatsApp notice to parent. |
| **Teacher** | Grades Exam $\le 70\%$ | **Focus Table & Student**| Auto-enrolls student in 1-Week Remedial Focus Sprint (Class 8-B Math). |
| **Student** | Uploads Rough Note Photo | **Teacher Portal** | Previews student solution alongside assigned question & rubric checkpoint. |
| **Parent** | Taps `[Sign-Off Rough Book]`| **Student & Focus Table**| Verifies Day $N$ rough practice, advancing student to Day $N+1$. |
| **Clock Engine** | 05:00 PM Cutoff Passes | **Teacher & Parent** | Sweeps unsubmitted homework, transitions to `BACKLOG`, mints `#EVD-BKLOG-X`. |
| **Teacher** | Submits Sick Leave | **Academic Coord** | AI Timetable Governor matches free peer faculty; 1-click assigns `SUBSTITUTION_COVER`. |
| **Teacher** | Clicks `[Request Task Relief]`| **Academic Coord** | Pauses SLA timer; Coordinator grants $+12$h to $+72$h extension or migrates task. |
| **Accounts** | Toggles `[Exam Clearance]` | **Exam Coordinator** | Unlocks student exam hall ticket download without deleting unpaid fee balance. |
| **Super Admin** | Applies Digital Seal | **Parent & SIS Vault** | Seals Transfer Certificate with Parent OTP + Scanned Hardcopy (Zero Legal Dispute). |

---

### 💡 KT Presenter Tip:
When presenting to stakeholders, walk through **one complete day** from 08:00 AM to 08:30 PM using the chronological order above. Show how each role's daily life is simplified, zero clerical clutter exists, and every action is linked in a closed loop!
