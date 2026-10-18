# EDU360: Full Application Walkthrough & Feature Tour

> **Application**: EDU360 — K–12 Outcomes & Intelligence Platform  
> **Frontend URL**: `http://localhost:3000`  
> **Backend URL**: `http://localhost:8000`  
> **Last Verified**: 2026-10-18

---

## 🧭 Navigation & Role Switcher

At the top of every page in the application, a persistent role switcher pill allows instant 1-click preview of all persona perspectives:
* 🏛️ **Admin** (`/admin`)
* 👩‍🏫 **Teacher** (`/teacher`)
* 🎒 **Student** (`/student`)
* 🎈 **Junior Student** (`/junior`)
* 👨‍👩‍👧 **Parent** (`/parent`)

---

## 🏛️ 1. Administrator Command Center (`/admin`)

Designed for school principals and administrative heads to manage school operations without spreadsheet chaos.

### Core Modules:
1. **Priority Triage Command Center**:
   * Visual traffic-light cards (🔴 Critical, 🟠 Warning, 🟢 Healthy) for daily triage:
     * Unexcused Absenteeism spikes
     * Pending Fee Dues & defaulters
     * Severe Academic drop flags (students $<50\%$)
2. **Admissions Enquiry CRM**:
   * Pipeline tracking: `New Inquiries` &rarr; `Campus Visit Scheduled` &rarr; `Document Verified` &rarr; `Enrolled`.
   * AI Chatbot enquiry transcripts preview.
   * **1-Click Convert to SIS**: Instantly provisions student enrollment ID and auto-generates parent portal credentials.
3. **Dual-Signature Exit & Transfer Certificate (TC) Archive**:
   * Multi-department digital clearance (Accounts, Library, Sports Lab, Principal).
   * Generates tamper-proof QR-verified Transfer Certificate PDFs with archival history.
4. **Event & Vendor Command Center**:
   * Cross-department task delegation for annual sports days, science exhibitions, and annual days.
   * **Staff-to-Student Volunteer Hierarchy**: Assigns teacher conveners and student marshals with trackable task completion meters.
5. **Strict Document Control**:
   * Admin-only upload, verification, and revocation lock for official birth certificates, vaccination records, and CBSE registration cards.

---

## 👩‍🏫 2. Comprehensive Teacher Portal (`/teacher`)

Designed for subject faculty and homeroom mentors with zero repetitive data entry.

### Core Tabs:
1. **Teacher Dashboard & Schedule**:
   * Live period timetable with active period countdown timer (e.g. `Period 3: Class 8-B Math • 24m remaining`).
   * Quick action cards for marking attendance, homework speed grading, and parent communications.
2. **Faculty Duties Center**:
   * 4 segmented duty streams:
     * `Event Tasks`: Committee responsibilities.
     * `Exam Invigilation`: Room assignments, hall tickets verify, duty reporting time.
     * `Paper Correction Queue`: Batch papers assigned, target dates, and live counter (`+` / `-` papers graded).
     * `Campus Substitution`: Zero-period and emergency cover periods.
3. **10-Minute Auto-Attendance Engine**:
   * Simulates online or hybrid classroom check-ins.
   * Rule: $T \le 10\text{ min} \implies$ **Present**, $T > 10\text{ min} \implies$ **Late**, Non-joiners $\implies$ **Absent**.
   * Teacher manual override with audit log.
4. **In-Browser Homework SpeedGrader Canvas**:
   * In-browser PDF/image canvas viewer.
   * Annotation toolbar: Red correction pen, green tick stamps, warning circles, text box remarks.
   * Marks scoring widget (`Marks obtained / Max marks`) and instant notify student & parent toggle.
5. **Mathematics Focus Table & 1-Week Remedial Intelligence** *(Latest Milestone)*:
   * Subject badge: `Subject: Mathematics`.
   * **Section Switcher Tabs**: `Class 8-B (Homeroom)`, `Class 8-A`, `Class 9-A`, `Class 9-B`, `All Sections`.
   * **Section Benchmark Banner**: Total students, Mastered ($>70\%$, exempt), Improvement Batch ($\le 70\%$, active plan), and Section average.
   * **Clean Remedial Cards**:
     * Highlights exam score ($\le 70\%$) and target goal ($>70\%$).
     * AI Exam Paper Scan diagnosis: Root misconception, flagged questions, and prescription.
     * 1-Week remedial progress bar (`Day 3 of 7`).
     * Solution upload status & guardian co-tracking badge.
     * **`Open 1-Week Plan →`** link to the dedicated remedial page.
     * **`⚡ Quick Verify All Validated`** batch button.
6. **Parent Connection Hub & Sliding PTM Scheduler**:
   * Dual-mode notes: Homeroom pastoral care vs Subject-specific notes.
   * 1-Click medical and personal leave approvals.
   * 1-on-1 PTM slot bookings with Google Meet / Zoom link generation.
   * Live simulated parent chat messenger.

---

## 🎯 3. Dedicated 1-Week Remedial Plan Page (`/teacher/focus/[id]`)

A focused, distraction-free environment opened when a teacher clicks a student in the Focus Table.

* **Context Bar**: Direct breadcrumb back to `Mathematics Focus Table (Class 8-B)`, with quick student roll number, parent phone, and exam score badge.
* **3-Section Tabs**:
  1. **Tab 1: 1-Week (7-Day) Targeted Action Plan**:
     * Visual cards for Day 1 through Day 7.
     * Previous day work is locked against accidental regression to "Upcoming".
     * Explicit buttons on past days: `Mark Completed ✓` / `Mark Pending ⏳`, and `Inspect`.
     * Current day card features `Inspect & Verify Work →` CTA.
  2. **Tab 2: Rough Notebook Solution Review**:
     * **Day Switcher**: Jump to inspect Day 1, Day 2, Day 3, etc.
     * **Assigned Practice Questions & Evaluation Rubric**: Displays the exact mathematical problem and what intermediate steps/signs the teacher must verify.
     * **Student Solution Steps**: Step-by-step working transcript and downloadable scanned PDF preview.
     * **Teacher Verification Box**: Custom feedback textarea with `Return for Re-work` and `Approve & Mark Day Completed ✓`.
  3. **Tab 3: Guardian Co-Tracking & Progress Updates**:
     * Registered parent card.
     * 1-Click **Send WhatsApp Update** (alerts parent to inspect student's rough notebook practice tonight).
     * Direct buttons to **Schedule 1-on-1 PTM**, **Open Chat**, and **Print 1-Week Summary**.

---

## 🎒 4. Secondary Student Portal (`/student`)

Built to give middle and high school students clear ownership over their academic trajectory.

* **Live Classes & Timetable**: 1-click join links for live sessions and access to recorded lectures sorted by subject and chapter.
* **Homework & Assignments Vault**: Upload homework PDFs and view teacher annotated canvas sheets with red ink remarks and rubric scores.
* **Side-by-Side Student Portfolio**:
  * Left: Inter-school competitions, sports tournaments, and club participations.
  * Right: Verified medals, certificates, and achievements signed off by faculty.
* **Digital School Vault**: Download official term report cards, bonafide certificates, and fee receipts.

---

## 🎈 5. Junior Student Portal (`/junior`)

Designed specifically for elementary K–5 students with vibrant, playful aesthetics, high engagement, and zero cognitive strain.

* **Daily Learning Quests**: Bite-sized, gamified daily challenges with completion stars.
* **Visual Reward Center**: Animated badges, animal mascots, and unlockable avatar stickers.
* **Simplified Classroom**: Large, colorful subject cards (Math, English, Science, Art) with audio-visual story lessons.

---

## 👨‍👩‍👧 6. Parent Co-Tracking Portal (`/parent`)

Designed for busy parents with an anti-spam, high-transparency communication philosophy.

* **Anti-Spam Moving Slider Carousel**: Replaces notification bombardment with a calm, categorized carousel for daily circulars and school events.
* **Live School Bus GPS Tracking (Route 4)**: Real-time map simulation showing current bus location, estimated arrival time (ETA), and direct call button to bus driver/attendant.
* **Student Focus Table Co-Tracking**: Parents see their child's 1-week focus plan and can sign off on daily rough notebook checks.
* **Fee Milestones & Digital Receipts**: Shows quarterly tuition fee schedules with mock 1-click UPI/Card payment and instant downloadable PDF receipts.
* **Leave Applications**: Submit medical or casual absence requests directly to the homeroom class teacher with receipt tracking.
