# EDU360: Full Application Walkthrough & Feature Tour

> **Application**: EDU360 — Action & Intelligence K–12 Outcomes Platform  
> **Frontend URL**: `http://localhost:3000`  
> **Backend URL**: `http://localhost:8000` (Swagger: `http://localhost:8000/docs`)  
> **Last Updated**: November 2026

---

## 🧭 Navigation & Role Switcher

At the top of the application landing page (`/`), an interactive role switcher allows 1-click preview of all persona perspectives:

| Role | Route | Key Responsibilities |
| :--- | :--- | :--- |
| 🏛️ **Admin** | `/admin` | Priority Triage radar, admissions CRM, exit clearances, event command |
| 🎓 **Academic Coordinator** | `/academic_coordinator` | Syllabus delivery audit, faculty SLA relief, timetable substitutions |
| 📝 **Exam Coordinator** | `/exam_coordinator` | Question paper vault, hall tickets, marks moderation, report card release |
| 👩‍🏫 **Teacher** | `/teacher` | Auto-attendance, SpeedGrader canvas, Focus Table, Evaluation Studio |
| 🎒 **Student (Secondary)** | `/student` | Live virtual classes, homework uploads, achievement portfolio, vault |
| 🎈 **Junior Student (K–5)** | `/junior` | Adventure quests, Phonics audio studio, Magic Book, star rewards |
| 👨‍👩‍👧 **Parent** | `/parent` | Sibling switcher, fee receipts, leave requests, 1-on-1 PTM, multi-subject chat |
| 💳 **Accounts Manager** | `/accounts_manager` | Fee collections, installment defaulter outflow triage, payroll approvals |
| 👥 **HR Head** | `/hr_head` | Staff directory, biometric logs, leave permissions, faculty grievances |
| 📦 **Inventory Manager** | `/inventory_manager` | Laboratory equipment, IT assets, stock reorder thresholds |

---

## 🏛️ 1. Administrator Command Center (`/admin`)

Designed for school principals and administrative deans to steer operations with early-warning intelligence rather than passive registers.

### Core Modules:
1. **Priority Triage Command Center**:
   * Traffic-light early-warning radar (🔴 Critical, 🟠 Warning, 🟢 Healthy).
   * **Chronic Absenteeism Telemetry**: Auto-flags 3+ day absences. Excludes students with approved parent leaves on file so administrators only triage genuine unexcused absences.
   * **Fee Default Outflow & Academic Drop Radar**: Direct 1-click triage actions (`Assign Class Teacher to Call Parents`, `Deploy Remedial Table`).
2. **Admissions CRM & SIS Enrollment**:
   * Pipeline: `New Inquiries` $\to$ `Campus Visit Scheduled` $\to$ `Document Verified` $\to$ `Enrolled`.
   * **1-Click Convert to SIS**: Provisions student enrollment ID, assigns roll number, and auto-generates parent portal credentials.
3. **Dual-Signature Exit & Transfer Certificate (TC)**:
   * Multi-department digital clearance workflow (Accounts, Library, Sports, Principal).
   * Generates QR-verified Transfer Certificate PDFs with complete archival records.
4. **Event & Vendor Command Center**:
   * Cross-department task delegation for sports meets, annual days, and exhibitions.
   * **Staff-to-Student Volunteer Hierarchy**: Assigns teacher conveners and student marshals with real-time completion tracking.

---

## 🎓 2. Academic Coordinator Portal (`/academic_coordinator`)

Bridges administrative governance and classroom pedagogical execution.

* **Curriculum Syllabus Delivery**: Audits real-time syllabus pacing checkoffs submitted by teachers (`/api/teacher/curriculum/log-unit`). Dispatches 48-hour remedial tasks for lagging chapters.
* **Human-in-the-Loop SLA Governance**: Replaces rigid penalty systems with Coordinator review: `[Grant Extension]`, `[Migrate Task to Peer Faculty]`, or `[Escalate to Principal]`.
* **Timetable Substitution Engine**: One-click substitute teacher assignment automatically injects `SUBSTITUTION_COVER` badges into the substitute faculty's daily schedule in `/teacher`.
* **Institutional PTM Governance**: Monitors faculty slot publishing readiness and broadcasts reminders to defaulting teachers.

---

## 📝 3. Exam Coordinator Portal (`/exam_coordinator`)

Secures examination integrity and unifies assessment publishing.

* **Digital Secrecy Paper Vault**: Receives question papers drafted by teachers, applies syllabus compliance review, and seals them into the fireproof digital exam bank.
* **Hall Ticket Issuance**: Publishes examination timetables and generates printable admit cards for students without fee blockades.
* **Marks Moderation Ledger**: Reviews submitted gradebooks from subject teachers, applies moderation adjustments if necessary, and cryptographically locks marks.
* **Batch Report Card Generation**: Once all subject teachers submit their sealed marks, the coordinator generates consolidated report cards enriched with Gemini AI qualitative narratives.

---

## 👩‍🏫 4. Comprehensive Teacher Portal (`/teacher`)

Empowers subject teachers and homeroom mentors with automated tools and zero clerical overhead.

### Core Features:
1. **10-Minute Auto-Attendance Engine**:
   * Classroom attendance check-in engine: $\le 10\text{ min} \implies$ **Present**, $> 10\text{ min} \implies$ **Late**, Non-joiners $\implies$ **Absent**.
   * Integrates parent leave requests: Approved leaves automatically reflect as `Excused Leave`.
2. **In-Browser Homework SpeedGrader**:
   * Interactive annotation canvas: Red ink pen, tick stamps, warning circles, and text feedback directly on student homework submissions.
3. **Remedial Focus Table (1-Week Sprint)**:
   * **Subject & Section Scoped**: Teachers filter by sections they teach (`Class 8-B`, `Class 8-A`, etc.).
   * **Threshold Invariant**: Students scoring $\le 70\%$ on term tests are enrolled in a 7-day remedial sprint; students scoring $> 70\%$ are exempt.
   * **Rough Notebook Solution Review**: Teacher inspects step-by-step math working and approves daily remedial practice.
4. **Descriptive Exam Evaluation Studio & Gradebook Lock**:
   * Side-by-side paper evaluation studio with AI-assisted rubric scoring.
   * **Gradebook Lock Mandate**: Once all papers are evaluated, teacher clicks `Submit Final Grades to Exam Cell (One-Time Lock)`. The gradebook enters an immutable, read-only state and transfers custody to the Exam Coordinator.
5. **Direct Parent Chat**:
   * 1-on-1 real-time messaging with parents using `BroadcastChannel` for instant zero-latency cross-tab synchronization.

---

## 🎒 5. Secondary Student Portal (`/student`)

Gives middle and high school students (Classes 6–12) clarity and ownership over their learning goals.

* **Live Classes & Lectures Archive**: One-click join for live video classes and access to chapter-wise recorded video lectures.
* **Homework Submission Dropzone**: Upload daily homework PDFs and view teacher-annotated feedback sheets.
* **Digital School Vault**: Secure repository for term report cards, bonafide certificates, and fee payment receipts.
* **Student Achievements Portfolio**: Verified extracurricular certificates, science fair recognitions, and sports tournament medals.

---

## 🎈 6. Elementary Junior Portal (`/junior`)

Designed specifically for K–5 elementary learners with vibrant, playful aesthetics and gamified progression.

* **Identity Context**: Centered on **Ananya Sharma (Class 3-A, Roll #8)**.
* **Today's Adventure Quests**: Daily micro-challenges (Maths, Phonics, Art) rewarding star points and celebratory sound fanfares.
* **Magic Homework Book**: Date-wise and subject-wise homework dropzone with template worksheet downloads and teacher praise stickers.
* **Practice Star Quizzes**: Voice-narrated interactive quizzes with audio prompts and instant celebratory animations.
* **Safe & Distraction-Free**: Free from adult financial clutter, bus radar widgets, and server voice storage liabilities.

---

## 👨‍👩‍👧 7. Multi-Child Parent Portal (`/parent`)

Designed for busy parents who need comprehensive oversight without alert fatigue.

* **Multi-Child Sibling Switcher**: Header pill switcher toggles between siblings (e.g. Aarav in Class 8-B vs. Ananya in Class 3-A). Each child maintains strictly isolated academic records, fee ledgers, and PTM appointments.
* **Multi-Subject Faculty Chat**: Direct 1-on-1 communication desk with all assigned subject teachers. Powered by `BroadcastChannel` for instant message delivery across open tabs.
* **Leave Management**: Submit leave requests with reason and attachments. Once approved by the teacher, attendance status is updated in real time.
* **Fee Milestones & Receipts**: Transparent term fee breakdown with UPI payment simulation and instant PDF receipts.
* **Sliding PTM Booking**: Self-service 1-on-1 parent-teacher meeting scheduling with calendar sync.
