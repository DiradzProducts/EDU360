# ABOUT EDU360 — Master Product Requirements Document (PRD)
## Unified Multi-Portal Institutional Management, Live Education, and Student Information System (SIS)

**Document Version:** 2.0 (Production Architecture Baseline)  
**Target Segment:** K–12 Education (Nursery to Class 12)  
**Platforms:** Web Application (Admin, Coordinators, Teachers, Secondary Students) & Mobile Application (Parents, Companion PWA for Students/Teachers)  
**Target Audience:** Executive Leadership, System Architects, Full-Stack Engineers, UI/UX Designers, QA Engineers  
**Canonical File Locations:**
- Primary PRD: [`docs/prd/PRD.md`](file:///e:/Diradz/EDU360/docs/prd/PRD.md)
- About EDU360 Markdown: [`docs/ABOUT_EDU360.md`](file:///e:/Diradz/EDU360/docs/ABOUT_EDU360.md)
- Architectural Reference: [`docs/architecture/ROLE_WISE_ARCHITECTURE_AND_WORKFLOWS.md`](file:///e:/Diradz/EDU360/docs/architecture/ROLE_WISE_ARCHITECTURE_AND_WORKFLOWS.md)

---

## 1. Executive Summary & Product Vision

**EDU360** is an enterprise-grade, cloud-native **Educational Operating System & Student Outcomes Platform** engineered for K–12 institutions. Traditional School ERPs operate as disconnected, static digital registers that spam users with notifications and leave leadership blind to operational risks. 

EDU360 functions as a **Unified Action & Intelligence System** connecting **Administration, 4 Specialized Coordinators, Teachers, Parents, and Students** around four foundational product principles:

1. **Actionable Management Intelligence:** Instead of forcing school leaders to sift through static reports, EDU360 highlights *what needs attention today, why it matters, and who needs to take action* via a real-time **Red / Orange / Green Priority Triage Engine**.
2. **Outcome-Oriented Parent Involvement:** Instead of spamming parents with 15 disconnected notifications a day, EDU360 provides an **anti-spam moving-slider dashboard** on mobile for routine updates, coupled with a shared **Student Focus Table** for targeted weak-subject improvement.
3. **Zero Extra Burden for Teachers:** Routine administrative toil is automated—online class attendance is captured via a **10-minute WebRTC telemetry rule**, period-wise subject attendance is auto-excused upon approved leave, and homework is evaluated directly inside a browser-based **SpeedGrader canvas** without downloading or re-uploading files.
4. **Deterministic Time-Alignment & Governance-First Security:** The entire platform operates against a centralized **ClockProvider** simulation engine, synchronizing timetables, period bells, and exam lifecycles across all 8 portals. Cryptographic HMAC-SHA256 tokens and pessimistic row locks (`SELECT ... FOR UPDATE`) ensure zero double-bookings, zero payment race conditions, and complete auditability.

---

## 2. Platform Strategy & Multi-Portal Architecture

EDU360 follows a **Role-Optimized Platform Strategy** tailored to ergonomic workstation needs, user mobility, and task complexity across all **8 Canonical Roles**:

| User Role | Route / Portal | Primary Platform | Secondary Platform | Operational Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin / Principal** | `/admin` | **Web App (Desktop 1080p+)** | Mobile Web (Urgent alerts only) | High-density priority triage, institutional task delegation, statutory document vault locking, and administrative override governance. |
| **Academic Coordinator** | `/academic_coordinator` | **Web App (Desktop/Laptop)** | Tablet Web | Curriculum pacing audit, conflict-free teacher timetable substitutions, and faculty workload balancing. |
| **Exam Coordinator** | `/exam_coordinator` | **Web App (Desktop/Laptop)** | Tablet Web | Atomic batch class exam scheduling, hall deployment, seat allocation, academic clearance gating, and dynamic admit card generation. |
| **Accounts Coordinator** | `/accounts_coordinator` | **Web App (Desktop/Laptop)** | Tablet Web | Real-time 3-tier fee aging, physical counter cash/cheque collection, fee waivers, and monthly staff payroll with LOP deductions (Maker role). |
| **Admissions Coordinator** | `/admissions_coordinator` | **Web App (Desktop/Laptop)** | Mobile App / Tablet | 24/7 AI chatbot lead capture CRM, follow-up call tracking, and 1-click atomic conversion into SIS profiles with sibling discounts. |
| **Teachers** | `/teacher` | **Web App (Desktop/Laptop)** | Mobile App / Tablet | Desktop displays optimal for LiveKit classroom hosting, browser-based SpeedGrader annotation, and staff leave/permission applications. |
| **Parents** | `/parent` | **Mobile App (Android / iOS)** | Responsive Web | Mobile-first for on-the-go push notifications, 1-tap UPI fee payments, moving slider notices, live bus GPS tracking, and PTM booking. |
| **Students (Secondary)** | `/student` | **Web App (Desktop/Laptop)** | Mobile App / Tablet (PWA) | Full-width displays for distraction-free LiveKit classes, digital notes, dynamic admit cards, online exams, and homework uploads. |

---

## 3. User Roles & Permission Matrix (RBAC & Governance)

> ⚠️ **Strict Document Security & Administrative Override Rule**:  
> 1. Official student documents in the **Student Information System (SIS)** can **ONLY** be uploaded, edited, or replaced by **Administration**. Teachers, Parents, and Students have strictly **View/Download-Only** access.  
> 2. The **Administrative Override Engine** grants Principal/Super Admin ultimate executive authority over student leaves, institutional SLAs, exam moderation, and fee overrides. When an executive override is stamped (`is_admin_override=True`), downstream roles (Teachers/Coordinators) are locked out (`403 Forbidden`) from reversing the action.

| Module / System Capability | Super Admin / Principal | Academic Coordinator | Exam Coordinator | Accounts Coordinator | Admissions Coordinator | Teacher | Student | Parent |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Institutional Priority Triage & Tasks** | **Full (Executive)** | View / Action | View / Action | View / Action | View / Action | None | None | None |
| **SIS Official Document Vault Control** | **Full (Exclusive)** | View Only | View Only | View Only | View Only | View Only | View Only | View Only |
| **Administrative Override Engine** | **Full (Tier-3 Bypass)**| None | None | None | None | None | None | None |
| **Admissions CRM & SIS Conversion** | Full (Audit) | View Only | View Only | Fee Handshake | **Full (Lead CRM)** | None | None | None |
| **Batch Exam Scheduling & Hall Alloc.** | Full (Audit) | Sync Pacing | **Full (Batch Eng)**| Fee Clearance | None | View Duty | View Admit | View Admit |
| **Dynamic Admit Card Generation** | Full (Audit) | View Only | **Full (Publish)** | Fee Clearance | None | View Only | **Download (Live)**| View Only |
| **3-Tier Fee Aging & Counter Payment** | Full (Audit) | None | Clearance Lock | **Full (Counter Pay)**| None | None | View Status | **Pay (Online)**|
| **Staff Payroll & LOP Deductions** | **Authorize (Checker)**| Workload Sync| None | **Draft Batch (Maker)**| None | View Payslip | None | None |
| **Live Online Class Hosting (WebRTC)** | Full (Audit) | Monitor Class | None | None | None | **Full (Host)** | Join / Replay | None |
| **Auto-Attendance (10-Min Rule)** | Full (Audit) | View Register | None | None | None | **Live Roster** | Status Stamp | View Child |
| **SpeedGrader Inline Canvas Correction** | Full (Audit) | Audit Pacing | None | None | None | **Grade & Mark** | Submit / View| View Child |
| **Shared Student 'Focus Table'** | Full (Audit) | Audit Focus | Sync Blueprint | None | None | **Create / Edit** | View & Execute| **Co-Track** |
| **Staff Leave (CL/SL/EL/LOP) Application**| **Approve / Reject** | Substitute Match| None | Payroll LOP Sync | None | **Apply / Track**| None | None |
| **Student Leave Approval & Override** | **Executive Override**| View Only | Attendance Sync| None | None | **First Approver**| Apply / Track| Apply for Child|
| **PTM Slot Concurrency Booking (Locks)**| Full (Audit) | Monitor Slots | None | None | None | **Create Slots** | None | **Hold & Book** |
| **Dual-Signature Student Exit / TC** | **Sign & Seal** | Inventory Sync| None | Dues Clearance | None | View Only | View Status | **Digital Sign** |
| **Live School Bus GPS Tracking** | Full (Routes) | None | None | Transport Fees | None | None | Live Tracking| **Live Tracking**|

---

## 4. Detailed Functional Requirements by Role

### 4.1 Role 1: Student Portal (`/student` — Web-First)
1. **Live Classroom Cockpit (LMS):** 1-click in-browser LiveKit WebRTC connection with active speaker spotlighting, screen share reception, and live doubts chat.
2. **Dynamic 10-Minute Auto-Attendance Tracker:** Periodic background telemetry automatically logs attendance status. Students joining within 10 minutes receive `Present`; joining after 10 minutes marks `Late`; non-attendees mark `Absent`.
3. **Period-Wise Subject Attendance Ledger:** Real-time visibility into period-level statuses across all subjects (`MATH-801`, `PHY-802`, etc.) with automatic parent-excused annotations.
4. **Dynamic Admit Cards & Exam Seating Roster:** Students receive live, dynamic examination hall tickets pulling directly from the Exam Coordinator's batch database. Displays exam series name, designated examination hall, assigned seat number, chief invigilator name, QR verification code, and academic/fee clearance verification.
5. **Homework Vault & Submission Engine:** Multi-file upload dropzone with mobile camera capture and compression. Displays the teacher-evaluated SpeedGrader document with vector pen annotations and private remarks.
6. **Side-by-Side Portfolio (Participations & Achievements):** 2-pane portfolio separating institutional event participation from student-uploaded merit awards and competition certificates.
7. **Personalized 'Focus Table' & Remedial Drills:** Actionable weekly study timetable highlighting low-scoring subject concepts co-tracked with parents and teachers.

### 4.2 Role 2: Teacher Portal (`/teacher` — Web-First)
1. **Teacher Home Dashboard & Class Timetable:** Dynamic schedule ticker driven by `ClockProvider` highlighting active period, upcoming lectures, pending homework submissions, and duty assignments.
2. **Live Lecture Broadcaster Studio:** Integrated LiveKit WebRTC room broadcaster with digital whiteboard controls, mute-all capability, and automatic cloud recording.
3. **SpeedGrader Studio (Browser Canvas):** 2-pane evaluation workspace displaying student submissions alongside grading rubrics. Teachers draw freehand stylus corrections, write remarks, and assign scores directly in the browser—automatically replacing the student file without manual re-uploading.
4. **Staff Leave & Short-Permission Management:** Apply for categorized leaves (*Casual Leave - CL*, *Sick Leave - SL*, *Earned Leave - EL*, or *Loss of Pay - LOP*) specifying affected teaching periods. Approved LOP leaves automatically feed into Accounts Coordinator payroll deductions.
5. **Period-Wise Attendance Register:** Fast-key bulk attendance marker (`P`, `A`, `L`, `E`) with instant sync to parent notifications. Approved student leaves automatically backfill and excuse period sessions.
6. **Student Focus Table Builder:** Generate personalized concept recovery plans for students scoring below benchmark thresholds in unit exams.
7. **Parental Connection Hub:** 1-on-1 parent messaging, online PTM slot generation with buffer intervals, and student leave recommendation reviews.

### 4.3 Role 3: Parent Application (`/parent` — Mobile-First)
1. **Anti-Spam 'Moving Slider' Carousel:** Routine announcements, holiday notices, and event banners glide as top interactive slides, onboarding parents to open the app once daily without notification fatigue.
2. **High-Signal Push Alerts & Notification Center:** Push notifications reserved exclusively for urgent alerts: Teacher Remarks, updates to Child's Focus Table, 3-day consecutive absence warnings, and administrative fee alerts.
3. **Dynamic Child Admit Card Viewer:** Parents inspect their child's official exam admit card, hall location, seat allocation, and academic clearance status before term exams.
4. **Concurrency-Safe PTM Booking:** Interactive 15-minute slot selector with a 5-minute temporary reservation timer backed by pessimistic database row locks (`SELECT ... FOR UPDATE`).
5. **3-Tier Fee Milestones & Digital Cashier:** Installment breakdown, instant UPI/Card settlements, counter payment history receipts, and automated PDF tax receipts delivered to registered email.
6. **Live Transport Radar:** Real-time school bus GPS tracking showing live map route, current stop, morning pickup ETA, and evening drop countdown.

### 4.4 Role 4: Super Admin / Principal Console (`/admin` — Web-First)
1. **Priority Triage Command Center (Red / Orange / Green Action Engine):** Highlights top institutional issues by priority, explains root cause, and provides 1-click administrative resolution buttons (Consecutive student absences, fee defaults, teacher absence).
2. **Administrative Override & Governance Engine:** Five concrete executive bypass domains enabling the Principal to override student leave rejections, force-close stalled SLA tasks, decouple exam moderation freezes, and clear fee hall-ticket blocks with downstream lockout (`403 Forbidden`).
3. **Four-Eye Payroll Authorization (Checker Role):** Principal reviews monthly salary batch computed by Accounts Coordinator (net wire, tax deductions, LOP penalties) and applies executive authorization signature before bank disbursement.
4. **Dual-Signature Student Exit / TC Clearance:** Orchestrates institutional sign-offs across Library, Labs, Sports, and Finance. Requires both Parent Digital Approval (OTP) and Principal Scanned Physical Signature before permanent vault sealing.
5. **Conflict-Free Timetable & Substitution Engine:** Algorithmic schedule builder with automatic emergency substitution matching based on teacher subject qualifications and free periods.

### 4.5 Role 5: Exam Coordinator Portal (`/exam_coordinator` — Web-First)
1. **Atomic Batch Class Exam Scheduling:** Coordinators schedule all subjects for a class in one atomic transaction, generating a unique `batch_id` and `series_name`.
2. **Hall Deployment & Seating Allocation:** Manages halls, capacities, and assigns Chief Invigilators per session.
3. **Dynamic Admit Card Generation Engine:** Automates hall ticket publishing with fee clearance gates and verification QR codes.
4. **Academic Moderation Ledger & Secrecy Vault:** Normalizes exam marks across sections and applies cryptographic moderation locks.
5. **AI-Assisted Hybrid Answer Script Scanning:** Integrates Gemini Flash Vision API to process scanned paper answer scripts and auto-populate marks.

### 4.6 Role 6: Accounts Coordinator Portal (`/accounts_coordinator` — Web-First)
1. **3-Tier Fee Aging Ledger & Defaulter Triage:** Tracks receivables categorized into Aging Tiers (1–30d, 31–60d, 60+d) with 1-click reminders.
2. **Physical Counter Collection Engine:** Point-of-sale cashier modal for recording manual cash, cheque, Demand Draft, or POS card payments with zero-overpayment guards and pessimistic row locks.
3. **Staff Payroll & LOP Deduction Engine (Maker Role):** Computes monthly payroll cross-referencing staff attendance and approved Loss of Pay (LOP) leaves.
4. **Four-Eye Separation of Duties Workflow:** Submits draft payroll batches to the Principal for executive authorization before executing disbursement wire.
5. **Fee Waiver & Concession Approvals:** Evaluates economic hardship and merit scholarship fee waivers within predefined administrative delegation limits.

### 4.7 Role 7: Admissions Coordinator Portal (`/admissions_coordinator` — Web-First)
1. **24/7 AI Chatbot & Lead Ingestion CRM:** Captures incoming parent inquiries and routes high-intent prospects to counselors.
2. **Follow-Up Call Tracker:** Logs tele-counseling notes and tracks lead conversion velocity.
3. **Single-Click Atomic SIS Conversion:** Converts admitted candidates directly into enrolled students (`POST /api/admin/crm/enquiries/{id}/convert`).
4. **Sibling Linking & Automated Discount Engine:** Detects enrolled siblings and applies a 15% tuition fee waiver automatically.

### 4.8 Role 8: Academic Coordinator Portal (`/academic_coordinator` — Web-First)
1. **Curriculum Pacing & Syllabus Tracker:** Monitors chapter completion percentages against lesson plans across all sections.
2. **Teacher Substitution & Workload Balancing:** Real-time substitution engine that recommends qualified replacement teachers without period collisions.
3. **Student Focus Table Oversight:** Audits teacher-student recovery timetables and tracks remedial score progression.
4. **Classroom Quality & Observation Log:** Conducts structured teacher reviews and logs lesson feedback.

---

## 5. Key System Workflows & Flow Diagrams

*All workflows include detailed Mermaid sequence diagrams and execution matrices in [`docs/prd/PRD.md`](file:///e:/Diradz/EDU360/docs/prd/PRD.md):*
- **Workflow 5.1**: Online Class Auto-Attendance & Consecutive Absence Triage
- **Workflow 5.2**: Homework Submission, SpeedGrader Inline Canvas & Focus Table
- **Workflow 5.3**: Parent-Teacher Meeting (PTM) Concurrency-Safe Booking
- **Workflow 5.4**: Student Exit & Dual-Signature Legal Clearance
- **Workflow 5.5**: Batch Class Examination Scheduling & Dynamic Admit Card Delivery
- **Workflow 5.6**: Four-Eye Staff Payroll Generation & LOP Deduction Clearance
- **Workflow 5.7**: Administrative Override & Governance Cascade

---

## 6. UI/UX Screen Checklist & Technology Stack
- Full Screen checklist for all 8 Portals + Notification Center & Dynamic Admit Cards.
- Production Tech Stack: Next.js 14/16 (React 18/19), FastAPI, PostgreSQL 15+ Async, LiveKit WebRTC, Centralized ClockProvider, Google Gemini Flash Vision API.

---

*Verified & Synchronized for EDU360 Engineering, Design, and Product Operations.*
