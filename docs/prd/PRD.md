# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## EDU360 — K–12 Institutional Management, Live Education & Unified SIS Ecosystem

**Document Version:** 2.5 (Production Architecture Baseline — Cross-Role Synchronized)  
**Target Segment:** K–12 Education (Nursery to Class 12)  
**Platforms:** Web Application (Admin, Coordinators, Teachers, Secondary Students) & Mobile Application (Parents, Companion PWA for Students/Teachers)  
**Target Audience:** Executive Leadership, System Architects, Full-Stack Engineers, UI/UX Designers, QA Engineers  
**File Location:** [`docs/prd/PRD.md`](file:///e:/Diradz/EDU360/docs/prd/PRD.md)  
**Synchronized Architectural Reference:** [`docs/architecture/ROLE_WISE_ARCHITECTURE_AND_WORKFLOWS.md`](file:///e:/Diradz/EDU360/docs/architecture/ROLE_WISE_ARCHITECTURE_AND_WORKFLOWS.md)

---

## 1. Executive Summary & Product Vision

**EDU360** is an enterprise-grade, cloud-native **Educational Operating System & Student Outcomes Platform** engineered for K–12 institutions. Traditional School ERPs operate as disconnected, static digital registers that spam users with notifications and leave leadership blind to operational risks. 

EDU360 functions as a **Unified Action & Intelligence System** connecting **Administration, 4 Specialized Coordinators, Teachers, Parents, and Students** around four foundational product principles:

1. **Actionable Management Intelligence:** Instead of forcing school leaders to sift through static reports, EDU360 highlights *what needs attention today, why it matters, and who needs to take action* via a real-time **Red / Orange / Green Priority Triage Engine**. Deprecated, non-operational domains (transport and physical inventory) are purged from active triage pipelines.
2. **Outcome-Oriented Parent Involvement:** Instead of spamming parents with 15 disconnected notifications a day, EDU360 provides an **anti-spam moving-slider dashboard** on mobile for routine updates, coupled with a shared **Student Focus Table** for targeted weak-subject improvement and multi-student family profile switching.
3. **Zero Extra Burden for Teachers:** Routine administrative toil is automated—online class attendance is captured via a **10-minute WebRTC telemetry rule**, period-wise subject attendance is auto-excused upon approved leave, curriculum delivery is checked off directly into PostgreSQL, and homework is evaluated inside a browser-based **SpeedGrader canvas** without downloading or re-uploading files.
4. **Deterministic Time-Alignment & Governance-First Security:** The entire platform operates against a centralized **ClockProvider** simulation engine, synchronizing timetables, period bells, and exam lifecycles across all 8 portals. Cryptographic HMAC-SHA256 tokens, targeted user-level notifications, and pessimistic row locks (`SELECT ... FOR UPDATE`) ensure zero double-bookings, zero payment race conditions, and complete auditability.

---

## 2. Platform Strategy & Multi-Portal Architecture

EDU360 follows a **Role-Optimized Platform Strategy** tailored to ergonomic workstation needs, user mobility, and task complexity across all **8 Canonical Roles**:

| User Role | Route / Portal | Primary Platform | Secondary Platform | Operational Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin / Principal** | `/admin` | **Web App (Desktop 1080p+)** | Mobile Web (Urgent alerts only) | High-density priority triage, institutional task delegation, statutory document vault locking, and administrative override governance. |
| **Academic Coordinator** | `/academic_coordinator` | **Web App (Desktop/Laptop)** | Tablet Web | Curriculum pacing audit, conflict-free teacher timetable substitutions, faculty workload balancing, and inter-coordinator exam-syllabus sync. |
| **Exam Coordinator** | `/exam_coordinator` | **Web App (Desktop/Laptop)** | Tablet Web | Atomic batch class exam scheduling, hall deployment, seat allocation, academic clearance gating, dynamic admit cards, and re-exam scheduling. |
| **Accounts Coordinator** | `/accounts_coordinator` | **Web App (Desktop/Laptop)** | Tablet Web | Real-time 3-tier fee aging, authentic counter cash/cheque collection, fee waivers, online bank reconciliation, and monthly staff payroll with LOP deductions (Maker). |
| **Admissions Coordinator** | `/admissions_coordinator` | **Web App (Desktop/Laptop)** | Mobile App / Tablet | 24/7 AI chatbot lead capture CRM, follow-up call tracking, and 1-click atomic conversion into SIS profiles with sibling discounts (15%) and parent-user linkage. |
| **Teachers** | `/teacher` | **Web App (Desktop/Laptop)** | Mobile App / Tablet | Desktop displays optimal for LiveKit classroom hosting, browser-based SpeedGrader annotation, PTM attendance & summary notes, and categorized staff leave. |
| **Parents** | `/parent` | **Mobile App (Android / iOS)** | Responsive Web | Mobile-first for on-the-go push notifications, multi-child switching, 1-tap UPI fee payments with authentic QR codes, moving slider notices, and PTM booking. |
| **Students (Secondary)** | `/student` | **Web App (Desktop/Laptop)** | Mobile App / Tablet (PWA) | Full-width displays for distraction-free LiveKit classes, digital notes, dynamic admit cards with seating details, online exams, and homework uploads. |

---

## 3. User Roles & Permission Matrix (RBAC & Cross-Role Governance)

> ⚠️ **Strict Document Security & Administrative Override Rule**:  
> 1. Official student documents in the **Student Information System (SIS)** can **ONLY** be uploaded, edited, or replaced by **Administration**. Teachers, Parents, and Students have strictly **View/Download-Only** access.  
> 2. The **Administrative Override Engine** grants Principal/Super Admin ultimate executive authority over student leaves, institutional SLAs, exam moderation, and fee overrides. When an executive override is stamped (`is_admin_override=True`), downstream roles (Teachers/Coordinators) are locked out (`403 Forbidden`) from reversing the action.

| Module / System Capability | Super Admin / Principal | Academic Coordinator | Exam Coordinator | Accounts Coordinator | Admissions Coordinator | Teacher | Student | Parent |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Institutional Priority Triage & Tasks** | **Full (Executive)** | View / Action | View / Action | View / Action | View / Action | None | None | None |
| **SIS Official Document Vault Control** | **Full (Exclusive)** | View Only | View Only | View Only | View Only | View Only | View Only | View Only |
| **Administrative Override Engine** | **Full (Tier-3 Bypass)**| None | None | None | None | None | None | None |
| **Admissions CRM & SIS Conversion** | Full (Audit) | View Only | View Only | Fee Handshake | **Full (Lead CRM)** | None | None | None |
| **Sibling Linking & 15% Fee Discount** | Full (Audit) | None | None | Auto-Invoice | **Apply Link** | None | None | **Verify Link** |
| **Batch Exam Scheduling & Hall Alloc.** | Full (Audit) | Sync Pacing | **Full (Batch Eng)**| Fee Clearance | None | View Duty | View Admit | View Admit |
| **Inter-Coordinator Exam Sync Protocol**| Full (Audit) | **Request / Align**| **Resolve / Cutoff**| None | None | Pacing Feed | None | None |
| **Medical Re-Exam Scheduling** | **Approve Request** | Pacing Sync | **Schedule Hall/Date**| Fee Audit | None | Invigilate | View Admit | **Apply (Docs)**|
| **Dynamic Admit Card Generation** | Full (Audit) | View Only | **Full (Publish)** | Fee Clearance | None | View Only | **Download (Live)**| View Only |
| **3-Tier Fee Aging & Counter Payment** | Full (Audit) | None | Clearance Lock | **Full (Counter Pay)**| None | None | View Status | **Pay (Online)**|
| **Authentic QR Code & Bank Reconcile** | Full (Audit) | None | None | **Reconcile Ledger**| None | None | View Receipt| **Scan & Pay** |
| **Staff Payroll & LOP Deductions** | **Authorize (Checker)**| Workload Sync| None | **Draft Batch (Maker)**| None | View Payslip | None | None |
| **Live Online Class Hosting (WebRTC)** | Full (Audit) | Monitor Class | None | None | None | **Full (Host)** | Join / Replay | None |
| **Auto-Attendance (10-Min Rule)** | Full (Audit) | View Register | None | None | None | **Live Roster** | Status Stamp | View Child |
| **SpeedGrader Inline Canvas Correction** | Full (Audit) | Audit Pacing | None | None | None | **Grade & Mark** | Submit / View| View Child |
| **Shared Student 'Focus Table'** | Full (Audit) | Audit Focus | Sync Blueprint | None | None | **Create / Edit** | View & Execute| **Co-Track** |
| **Staff Leave (CL/SL/EL/LOP) Application**| **Approve / Reject** | Substitute Match| None | Payroll LOP Sync | None | **Apply / Track**| None | None |
| **Student Leave Approval & Override** | **Executive Override**| View Only | Attendance Sync| None | None | **First Approver**| Apply / Track| Apply for Child|
| **PTM Slot Concurrency Booking (Locks)**| Full (Audit) | Faculty Audit | None | None | None | **Create Slots** | None | **Hold & Book** |
| **PTM Completion & Notes Governance** | Full (Audit) | **Attendance Audit**| None | None | None | **Mark & Summary** | None | **Receive Notes**|
| **Parent-Teacher Real-Time Chat** | Full (Audit) | None | None | None | None | **1-on-1 Chat** | None | **1-on-1 Chat** |
| **Dual-Signature Student Exit / TC** | **Sign & Seal** | Inventory Sync| None | Dues Clearance | None | View Only | View Status | **Digital Sign** |

---

## 4. Detailed Functional Requirements by Role

### 4.1 Role 1: Student Portal (`/student` — Web-First)
1. **Live Classroom Cockpit (LMS):** 1-click in-browser LiveKit WebRTC connection with active speaker spotlighting, screen share reception, and live doubts chat.
2. **Dynamic 10-Minute Auto-Attendance Tracker:** Periodic background telemetry automatically logs attendance status. Students joining within 10 minutes receive `Present`; joining after 10 minutes marks `Late`; non-attendees mark `Absent`.
3. **Period-Wise Subject Attendance Ledger:** Real-time visibility into period-level statuses across all subjects (`MATH-801`, `PHY-802`, etc.) with automatic parent-excused annotations backfilled upon approved leave.
4. **Dynamic Admit Cards & Exam Seating Roster:** Real-time hall tickets pulling directly from the Exam Coordinator's batch database. Displays exam series name, designated examination hall, assigned seat number, chief invigilator name, QR verification code, and academic/fee clearance verification.
5. **Medical Re-Examination Hall Ticket:** In cases where missed exams are approved by Administration, students receive updated re-exam tickets showing rescheduled date, time, and venue.
6. **Homework Vault & Submission Engine:** Multi-file upload dropzone with mobile camera capture and compression. Displays the teacher-evaluated SpeedGrader document with vector pen annotations and private remarks.
7. **Side-by-Side Portfolio (Participations & Achievements):** 2-pane portfolio separating institutional event participation from student-uploaded merit awards and competition certificates.
8. **Personalized 'Focus Table' & Remedial Drills:** Actionable weekly study timetable highlighting low-scoring subject concepts co-tracked with parents and teachers.

---

### 4.2 Role 2: Teacher Portal (`/teacher` — Web-First)
1. **Teacher Home Dashboard & Class Timetable:** Dynamic schedule ticker driven by `ClockProvider` highlighting active period, upcoming lectures, pending homework submissions, and duty assignments.
2. **Live Lecture Broadcaster Studio:** Integrated LiveKit WebRTC room broadcaster with digital whiteboard controls, mute-all capability, and automatic cloud recording.
3. **SpeedGrader Studio (Browser Canvas):** 2-pane evaluation workspace displaying student submissions alongside grading rubrics. Teachers draw freehand stylus corrections, write remarks, and assign scores directly in the browser—automatically replacing the student file without manual re-uploading.
4. **Curriculum Delivery Logging:** Unit check-off (`POST /api/teacher/curriculum/log-unit`) directly persists progress into the PostgreSQL `CurriculumPacing` table, auto-calculating pacing velocity (`Ahead`, `On Track`, `Lagging`) and triggering audit alerts if syllabus falls behind.
5. **Staff Leave & Short-Permission Management:** Apply for categorized leaves (*Casual Leave - CL*, *Sick Leave - SL*, *Earned Leave - EL*, or *Loss of Pay - LOP*) specifying affected teaching periods. Approved LOP leaves automatically feed into Accounts Coordinator payroll deductions.
6. **Period-Wise Attendance Register:** Fast-key bulk attendance marker (`P`, `A`, `L`, `E`) with instant sync to parent notifications. Approved student leaves automatically backfill and excuse period sessions.
7. **PTM Attendance & Summary Notes Governance:** Teachers mark faculty and parent attendance (`POST /api/teacher/ptm/slots/{id}/mark-attendance`) as `COMPLETED`, `TEACHER_ABSENT`, or `PARENT_NO_SHOW`, recording meeting summary notes that automatically push to the parent's app.
8. **Parental Connection Hub:** 1-on-1 parent messaging with deep-linked student context, online PTM slot generation with buffer intervals, and student leave recommendation reviews.

---

### 4.3 Role 3: Parent Application (`/parent` — Mobile-First)
1. **Multi-Student Family Account Switching:** Parents with multiple enrolled children switch between student profiles seamlessly without re-authenticating, powered by relational `Student.parent_user_id` mapping.
2. **Anti-Spam 'Moving Slider' Carousel:** Routine announcements, holiday notices, and event banners glide as top interactive slides, onboarding parents to open the app once daily without notification fatigue.
3. **High-Signal Push Alerts & Targeted Notifications:** Push notifications reserved exclusively for urgent alerts: Teacher Remarks, updates to Child's Focus Table, 3-day consecutive absence warnings, PTM cancellations, and administrative fee alerts.
4. **Dynamic Child Admit Card Viewer:** Parents inspect their child's official exam admit card, hall location, seat allocation, and academic clearance status before term exams.
5. **Medical Re-Exam Application Modal:** Parents submit re-exam requests (`ReExamRequest`) with medical certificate upload for missed examinations, tracking administrative review in real time.
6. **PTM Booking & Cancellation Protocol:** 15-minute slot selector with a 5-minute temporary reservation timer backed by pessimistic database row locks. Parents can cancel slots with reason logging, triggering immediate slot reopening and teacher notifications.
7. **Authentic QR Code & Fee Payment Cashier:** Installment breakdown, dynamic UPI QR code generator (`authentic-qr.tsx`), instant settlements, counter payment history receipts, and automated PDF tax receipts delivered to registered email.

---

### 4.4 Role 4: Super Admin / Principal Console (`/admin` — Web-First)
1. **Priority Triage Command Center (Red / Orange / Green Action Engine):** Highlights top institutional issues by priority, explains root cause, and provides 1-click administrative resolution buttons. Deprecated transport and physical inventory alerts are purged from triage pipelines to maintain high operational focus.
2. **Administrative Override & Governance Engine:** Five concrete executive bypass domains enabling the Principal to override student leave rejections, force-close stalled SLA tasks, decouple exam moderation freezes, and clear fee hall-ticket blocks. Downstream roles are locked out (`403 Forbidden`) from reversing executive decisions.
3. **Dynamic Homeroom Teacher Override Notification Cascade:** When an administrative leave override is executed, the system resolves the student's exact homeroom teacher user ID and dispatches a high-priority `ADMIN_OVERRIDE_ALERT` with executive justification notes.
4. **Medical Re-Exam Adjudication:** Principal reviews parent re-exam requests (`ReExamRequest`), verifies submitted medical evidence, and approves the petition for Exam Coordinator scheduling.
5. **Four-Eye Payroll Authorization (Checker Role):** Principal reviews monthly salary batch computed by Accounts Coordinator (net wire, tax deductions, LOP penalties) and applies executive authorization signature before bank disbursement.
6. **Dual-Signature Student Exit / TC Clearance:** Orchestrates institutional sign-offs across Library, Labs, Sports, and Finance. Requires both Parent Digital Approval (OTP) and Principal Scanned Physical Signature before permanent vault sealing.
7. **Conflict-Free Timetable & Substitution Engine:** Algorithmic schedule builder with automatic emergency substitution matching based on teacher subject qualifications and free periods.

---

### 4.5 Role 5: Exam Coordinator Portal (`/exam_coordinator` — Web-First)
1. **Atomic Batch Class Exam Scheduling:** Eliminates piecemeal scheduling. Coordinators select class and term series (e.g., *Class 8 — Term 1 Final Examinations 2026*) and schedule all subjects in one atomic transaction, generating a unique `batch_id` and `series_name`.
2. **Inter-Coordinator Exam & Syllabus Sync Protocol:** Receives alignment requests (`ExamSyncRequest`) from Academic Coordinator when subject pacing lags. Jointly resolves whether to postpone the exam (`POSTPONE_EXAM`), trim syllabus cut-offs (`TRIM_SYLLABUS_CUTOFF`), or schedule remedial sessions.
3. **Examination Session Lifecycle Engine:** Controls live examination execution via `session_status`: `SCHEDULED` $\to$ `LOBBY_OPEN` $\to$ `COMMENCED` $\to$ `CONCLUDED` with timestamping and chief invigilator authentication.
4. **Medical Re-Examination Allocation:** Assigns exam dates, time slots, examination halls, and chief invigilators for approved medical re-exam candidates.
5. **Hall Deployment & Seating Allocation:** Manages examination halls, maximum seating capacity, and assigns Chief Invigilators per session.
6. **Dynamic Admit Card Generation Engine:** Automates hall ticket publishing. Integrates fee clearance gates and academic eligibility thresholds to generate tamper-evident student admit cards with verification QR codes.
7. **Academic Moderation Ledger & Secrecy Vault:** Normalizes exam marks across sections, enforces statistical grading curves, and applies cryptographic moderation locks to prevent unauthorized grade manipulation.
8. **AI-Assisted Hybrid Answer Script Scanning:** Integrates Google Gemini Flash Vision API to process scanned paper answer scripts, extract student roll numbers, and auto-populate marks rubrics with verification seal hashes.

---

### 4.6 Role 6: Accounts Coordinator Portal (`/accounts_coordinator` — Web-First)
1. **Institutional Fee Structure Engine (`FeeStructure`):** Configures standardized class-wise annual fee structures (Tuition Fee, Term 1, Term 2, LMS Digital Fee, Lab/Library Fee, Activity Fee) serving as the single source of truth for all billing.
2. **3-Tier Fee Aging Ledger & Defaulter Triage:** Tracks receivables categorized into Aging Tiers (1–30 days, 31–60 days, 60+ days overdue) with 1-click bulk SMS/Email payment reminder triggers.
3. **Physical Counter Collection Engine:** Point-of-sale cashier modal for recording manual cash, cheque, Demand Draft, or POS card payments (`POST /api/finance/defaulters/{id}/pay`). Enforces zero-overpayment guards, auto-reconciles matching parent milestones, and generates counter receipts.
4. **Online Bank Transaction Ledger & Authentic QR:** Reconciles incoming online UPI, NetBanking, and Card payments in real time (`fee-ledger.ts`), auto-matching UTR numbers and updating parent account balances instantaneously.
5. **Staff Payroll & LOP Deduction Engine (Maker Role):** Computes monthly institutional payroll (`POST /api/finance/payroll/batches/generate`) by cross-referencing staff attendance and approved *Loss of Pay (LOP)* leaves. Formats itemized payslips (Basic, HRA, DA, PF, PT, TDS, LOP deductions).
6. **Four-Eye Separation of Duties Workflow:** Submits draft payroll batches to the Principal for executive authorization. Transmits bank wire instructions only upon cryptographic Principal sign-off.
7. **Fee Waiver & Concession Approvals:** Evaluates economic hardship and merit scholarship fee waivers within predefined administrative delegation limits.

---

### 4.7 Role 7: Admissions Coordinator Portal (`/admissions_coordinator` — Web-First)
1. **24/7 AI Chatbot & Lead Ingestion CRM:** Captures incoming parent admission inquiries, answers standard queries (fee brackets, curriculum, transport routes), and routes high-intent prospects to human counselors.
2. **Follow-Up Call Tracker & Tele-Counseling Log:** Logs tele-counseling notes (*"Campus visit booked"*, *"Waiting on report card"*), tracks lead conversion velocity, and sets call reminders.
3. **Single-Click Atomic SIS Conversion:** Converts admitted candidates directly into enrolled students (`POST /api/admin/crm/enquiries/{id}/convert`). Generates admission numbers (`EDU-2026-XXX`), links `parent_user_id`, assigns bus routes, configures default credentials, and vaults compliance documents.
4. **Sibling Linking & Automated Discount Engine:** Detects enrolled siblings and applies a 15% tuition fee waiver automatically, generating the initial Admission & Registration Fee invoice in Accounts Coordinator automatically.
5. **Secondary Dossier Synchronization:** Captures comprehensive secondary student information (emergency contacts, medical history, dietary preferences, languages, career ambitions) into the student's global SIS record.

---

### 4.8 Role 8: Academic Coordinator Portal (`/academic_coordinator` — Web-First)
1. **Curriculum Pacing & Syllabus Tracker:** Monitors chapter completion percentages against institutional lesson plans across all sections and grades, reading directly from the live PostgreSQL `CurriculumPacing` table.
2. **Inter-Coordinator Exam & Syllabus Sync Protocol:** Initiates consultation meetings (`POST /api/academic/exam-sync/request`) with the Exam Coordinator when a class's syllabus delivery lags, ensuring students are not tested on untaught concepts.
3. **PTM Faculty Attendance Audit Engine:** Monitors institutional compliance for Parent-Teacher Meetings via `GET /api/academic/ptm/faculty-attendance-summary`, tracking faculty attendance rates, completed sessions, and parent no-shows across departments.
4. **Teacher Substitution & Workload Balancing:** Real-time substitution engine that detects teacher absences and recommends qualified replacement teachers without period collisions or excessive weekly workload.
5. **Student Focus Table Oversight:** Audits teacher-student recovery timetables, tracking remedial score progression and flagging chronic learning gaps to the Principal.

---

## 5. Key System Workflows & Flow Diagrams

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          EDU360 MASTER WORKFLOW PIPELINE                               │
├────────────────────┬────────────────────┬────────────────────┬─────────────────────────┤
│ 5.1 Auto-Class Att │ 5.2 SpeedGrader    │ 5.3 PTM Full Loop  │ 5.4 Dual Exit TC        │
├────────────────────┼────────────────────┼────────────────────┼─────────────────────────┤
│ 5.5 Batch Exam &   │ 5.6 Four-Eye Staff │ 5.7 Administrative │ 5.8 Inter-Coord Exam    │
│     Dynamic Admit  │     Payroll & LOP  │     Override State │     Syllabus Sync       │
├────────────────────┴────────────────────┴────────────────────┴─────────────────────────┤
│ 5.9 Medical Re-Exam Protocol (Parent -> Admin -> Exam Coordinator)                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.1 Online Class Auto-Attendance & Consecutive Absence Triage

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Teacher
    participant FE as Frontend Portal
    participant API as FastAPI Backend
    participant LK as LiveKit WebRTC
    actor Student as Student
    participant Triage as Priority Triage Engine
    actor Admin as Principal / Super Admin
    actor Parent as Parent

    Teacher->>FE: Starts Live Class (Period 1: Class 8-B, Math)
    FE->>API: POST /api/v1/livekit/create-room
    API->>LK: Provision Room with HMAC Broadcaster Token
    LK-->>FE: Stream Ready
    Student->>FE: Joins Class at Minute 4
    FE->>API: GET /api/v1/livekit/join-token
    API->>LK: Verify Student Role & Issue Viewer Token
    Note over LK,API: Webhook: participant_joined (Timestamp logged)
    Note over Student,LK: Student remains connected > 10 minutes
    LK->>API: Telemetry Webhook (Duration >= 10 mins)
    API->>API: INSERT INTO attendance (status='Present', method='auto_livekit')
    API->>API: Check Consecutive Absence History
    Note over API,Triage: Student absent for 3 consecutive days?
    API->>Triage: Trigger RED PRIORITY ALERT on Management Console
    Triage->>Admin: Alert: "Rahul Verma absent 3 consecutive days"
    Admin->>Teacher: Delegate Task: "Call Parent of Rahul Verma"
    Teacher->>Parent: Conduct phone call & log outcome notes in SIS
```

| Step | Actor / System | Rule / Action Executed | System Output & State Transition |
| :---: | :--- | :--- | :--- |
| **Step 1** | Teacher | Initiates live class from Teacher Dashboard during scheduled timetable slot. | LiveKit room provisioned with teacher broadcaster token. |
| **Step 2** | Student | Enters live class within first 10 minutes of scheduled start time. | System logs WebRTC join timestamp; marks student **PRESENT**. |
| **Step 3** | System | Monitors attendance registers across all periods for consecutive absences. | Triggers **RED PRIORITY ALERT** on Admin Dashboard if student is absent 3+ days. |
| **Step 4** | Principal / Admin | Reviews Red Alert card and assigns priority tele-call task to class teacher. | Task created with SLA; class teacher notified; outcome notes recorded in SIS. |

---

### 5.2 Homework Submission, SpeedGrader Inline Canvas & Focus Table

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Teacher
    actor Student as Student
    participant S_UI as Student App
    participant API as FastAPI Backend
    participant S3 as Encrypted Vault
    participant T_UI as Teacher SpeedGrader
    participant Analytics as Outcomes Engine
    actor Parent as Parent

    Teacher->>T_UI: Creates Assignment ("Physics Lab Report")
    Student->>S_UI: Uploads completed homework photos / PDF
    S_UI->>API: POST /api/student/homework/submit (FOR UPDATE)
    API->>S3: Stream compressed images to encrypted vault
    S3-->>API: Presigned asset URLs
    API->>API: UPSERT INTO homework_submissions (status='Submitted')
    Teacher->>T_UI: Opens SpeedGrader Studio
    T_UI->>API: GET /api/teacher/submissions/{id}
    API-->>T_UI: Render 2-Pane Split Canvas (Document Left, Rubric Right)
    Teacher->>T_UI: Draws freehand annotations, enters score (42/50) & audio note
    T_UI->>API: POST /api/teacher/grade-submission
    API->>API: UPDATE homework_submissions (status='Graded')
    API->>Analytics: Evaluate score vs threshold (42/50 = 84% - Satisfactory)
    API->>S_UI: WebSocket Toast: "Homework Graded"
    API->>Parent: Push Notification: "New Grade Posted: 42/50 in Physics"
```

| Step | Actor / System | Rule / Action Executed | System Output & State Transition |
| :---: | :--- | :--- | :--- |
| **Step 1** | Student | Captures homework pages via mobile camera and submits PDF/images. | Acquires row lock via `SELECT ... FOR UPDATE`; stores assets in encrypted vault. |
| **Step 2** | Teacher | Opens pending submission in browser-based SpeedGrader Studio. | Renders 2-pane split canvas: document viewer alongside weighted scoring rubric. |
| **Step 3** | Teacher | Annotates drawings, writes inline feedback, and commits numerical marks. | Corrected document replaces original upload; notification dispatched. |
| **Step 4** | Outcomes Engine | Low marks (< 50%) automatically trigger Student Focus Table recommendation. | Personalized concept recovery table generated and shared with Teacher and Parent. |

---

### 5.3 Parent-Teacher Meeting (PTM) Closed-Loop Lifecycle & Attendance Governance

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Teacher
    participant API as FastAPI Backend
    participant DB as PostgreSQL (Row Lock)
    actor Parent as Parent (Mobile)
    actor Acad as Academic Coordinator

    Teacher->>API: POST /api/teacher/ptm/slots/generate (15-min slots, 10:00 to 12:00)
    API->>DB: Bulk INSERT 8 slots (status='AVAILABLE')
    Parent->>API: POST /api/parent/ptm/slots/hold (10:15 AM)
    API->>DB: SELECT * FROM ptm_slots WHERE id=4 FOR UPDATE
    API->>DB: UPDATE ptm_slots SET status='HELD', held_by='Parent', expires_at=NOW()+5m
    Parent->>API: POST /api/parent/ptm/slots/confirm (agenda="Mathematics Progress")
    API->>DB: UPDATE ptm_slots SET status='BOOKED', parent_id='Parent'
    Note over Parent,Teacher: Optional: Parent cancels slot with reason
    alt Parent Cancels Slot
        Parent->>API: POST /api/parent/ptm/slots/4/cancel (Reason: Travel delay)
        API->>DB: UPDATE ptm_slots SET status='AVAILABLE', cancellation_reason='Travel delay'
        API->>Teacher: Targeted Notification: "PTM Slot Cancelled by Parent"
    else Conference Conducted
        Teacher->>API: POST /api/teacher/ptm/slots/4/mark-attendance (Status: COMPLETED, Notes: "Discussed algebra drills")
        API->>DB: UPDATE ptm_slots SET teacher_attended=TRUE, parent_attended=TRUE, attendance_status='COMPLETED'
        API->>Parent: Notification: "PTM Completed: Teacher Summary Notes Recorded"
        Acad->>API: GET /api/academic/ptm/faculty-attendance-summary
        API-->>Acad: Return Faculty PTM Compliance Metrics
    end
```

| Step | Actor / System | Rule / Action Executed | System Output & State Transition |
| :---: | :--- | :--- | :--- |
| **Step 1** | Teacher | Configures PTM availability slots with buffer intervals. | System generates slots in `AVAILABLE` state linked to teacher profile. |
| **Step 2** | Parent | Selects preferred slot; backend initiates `SELECT ... FOR UPDATE` row lock. | Row lock acquired; slot transitions to `HELD` with 5-minute reservation timer. |
| **Step 3** | Parent | Submits discussion agenda and confirms booking before timer expires. | Slot transitions to `BOOKED`; WebRTC link and calendar invitations dispatched. |
| **Step 4** | Cancellation (Opt) | Parent cancels slot; slot reopens as `AVAILABLE` with cancellation reason. | Targeted alert sent to assigned teacher user ID; slot released for others. |
| **Step 5** | Governance | Teacher marks conference completion and records meeting notes. | Slot marked `COMPLETED`; summary notes delivered to parent; audited by Academic Coord. |

---

### 5.4 Student Exit & Dual-Signature Legal Clearance

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Parent / Student
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor Lib as Librarian / Inventory
    actor Fin as Accounts Coordinator
    actor Admin as Principal / Head of School

    Parent->>API: POST /api/student/exit-request (Reason: Relocation)
    API->>DB: INSERT INTO exit_clearance (status='PENDING_CLEARANCE')
    API->>Lib: Task: "Verify Library Books & Lab Equipment"
    API->>Fin: Task: "Verify Fee Milestone Settlement"
    Lib->>API: POST /api/admin/exit/library-signoff (Books Returned: YES)
    API->>DB: UPDATE exit_clearance SET library_cleared=TRUE
    Fin->>API: POST /api/admin/exit/finance-signoff (Balance Due: ₹0.00)
    API->>DB: UPDATE exit_clearance SET finance_cleared=TRUE
    Note over DB: Checks: library_cleared AND finance_cleared == TRUE
    Admin->>Parent: Prepares original Transfer Certificate & marks sheets
    Parent->>API: Step 1: Submits Digital Approval via Mobile App (OTP Confirmed)
    Parent->>Admin: Step 2: Signs physical handover register at campus office
    Admin->>API: POST /api/admin/exit/upload-physical-seal (Scanned form)
    API->>DB: UPDATE exit_clearance SET status='COMPLETED', tc_issued=TRUE
    API->>Parent: Issues Cryptographically Signed PDF Transfer Certificate
```

| Step | Actor / System | Rule / Action Executed | System Output & State Transition |
| :---: | :--- | :--- | :--- |
| **Step 1** | Parent | Submits formal withdrawal application citing official reason and effective date. | Creates exit clearance record in `PENDING_CLEARANCE` status. |
| **Step 2** | Department Officers | Library and Finance officers verify zero asset loss and complete fee settlement. | Departmental clearance flags updated to `TRUE` in clearance ledger. |
| **Step 3** | Parent & Principal | Parent provides Digital OTP approval; signs physical register at campus. | Physical signed form scanned and uploaded to permanent document vault. |
| **Step 4** | System | Seals student record; transitions status to `Alumni / Withdrawn`. | Cryptographically verified PDF Transfer Certificate delivered to parent. |

---

### 5.5 Batch Class Examination Scheduling & Dynamic Admit Card Delivery

```mermaid
sequenceDiagram
    autonumber
    actor Coord as Exam Coordinator
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor Accounts as Accounts Coordinator
    actor Student as Student
    actor Parent as Parent

    Coord->>API: POST /api/exams/batch-class-schedules (Class 8, "Term 1 Finals", 5 slots)
    API->>DB: Transactional INSERT into exam_schedules (batch_id='BATCH-CLASS8-TERM1', schedule_type='BATCH')
    DB-->>API: 200 OK (5 exam slots generated atomically)
    Note over API,DB: Academic Clearance & Fee Gating Evaluation
    Accounts->>API: Verifies student fee aging status (Fee Due <= Threshold)
    API->>DB: UPDATE student_exam_clearance SET academic_clearance='APPROVED'
    Student->>API: GET /api/exams/schedules?class_name=Class 8&section=B
    API->>DB: SELECT schedules + hall_allocation + invigilator + seat_no
    DB-->>Student: Deliver Live Dynamic Admit Card Data
    Student->>Student: View / Download PDF Admit Card with Verification QR Code
    Parent->>Parent: View Child's Admit Card on Mobile Parent Portal
```

| Step | Actor / System | Rule / Action Executed | System Output & State Transition |
| :---: | :--- | :--- | :--- |
| **Step 1** | Exam Coordinator | Configures full exam timetable series for class in single atomic batch request. | All subject slots written to DB with unique `batch_id` and `series_name`. |
| **Step 2** | Accounts / Academics | System evaluates fee clearance status and academic attendance eligibility. | Eligible students receive `APPROVED` academic examination clearance. |
| **Step 3** | Student Portal | Student accesses Exam tab; system dynamically queries live batch schedule. | Generates personalized admit card with hall name, seat number, and QR code. |
| **Step 4** | Parent Portal | Parent inspects child's admit card details on mobile app. | Instant visibility into scheduled examination dates, timings, and instructions. |

---

### 5.6 Four-Eye Staff Payroll Generation & LOP Deduction Clearance

```mermaid
sequenceDiagram
    autonumber
    actor Accounts as Accounts Coordinator (Maker)
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor Admin as Principal / Super Admin (Checker)
    actor Teacher as Teacher / Staff Member

    Accounts->>API: POST /api/finance/payroll/batches/generate (Month: "November 2026")
    API->>DB: Query staff attendance & approved Loss of Pay (LOP) leaves
    API->>API: Calculate: Gross - (PF + PT + TDS + LOP Deductions) = Net Payable
    API->>DB: INSERT into payroll_batches (status='DRAFT_PENDING_APPROVAL')
    API->>Admin: High-Priority Notification: "November 2026 Payroll Ready for Authorization"
    Admin->>API: POST /api/finance/payroll/batches/{id}/authorize (Principal Digital Seal)
    API->>DB: UPDATE payroll_batches SET status='AUTHORIZED', authorized_by='Principal'
    API->>DB: Write Statutory Security Audit Log (Maker-Checker Verified)
    API->>Accounts: Notification: "Payroll Authorized - Ready for Bank Wire"
    Accounts->>API: POST /api/finance/payroll/batches/{id}/disburse
    API->>DB: UPDATE payroll_batches SET status='PAID'
    API->>Teacher: Dispatches Individual Digital Payslip to Teacher Portal
```

| Step | Actor / System | Rule / Action Executed | System Output & State Transition |
| :---: | :--- | :--- | :--- |
| **Step 1** | Accounts Coordinator | Initiates monthly payroll computation; system factors in approved LOP leaves. | Generates draft payroll batch with detailed deductions; status set to `DRAFT`. |
| **Step 2** | System Router | Enforces Four-Eye Principle; alerts Principal that high-value batch requires authorization. | Push notification dispatched to Principal dashboard with batch summary figures. |
| **Step 3** | Principal / Super Admin | Reviews payroll breakdown, audits LOP deductions, and applies executive sign-off. | Batch status transitions to `AUTHORIZED`; action stamped in `SecurityAuditLog`. |
| **Step 4** | Accounts Coordinator | Executes corporate bank disbursement wire and closes batch. | Status set to `PAID`; itemized digital payslips released to all staff dashboards. |

---

### 5.7 Administrative Override & Governance Cascade

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Class Teacher
    actor Student as Student / Parent
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor Admin as Principal / Super Admin
    actor Parent as Parent

    Student->>API: Submits 4-day emergency medical leave application
    Teacher->>API: Rejects leave application ("Insufficient documentary evidence")
    API->>DB: UPDATE leave_requests SET status='Rejected'
    Parent->>Admin: Appeals to Principal with hospital admission certificate
    Admin->>API: POST /api/admin/student-leaves/{id}/override (Status: Approved, Notes: "Medical emergency confirmed")
    API->>DB: UPDATE leave_requests SET status='Approved', is_admin_override=TRUE, admin_notes='...'
    API->>DB: UPDATE attendance_records SET status='Leave', admin_override=TRUE (Across all 4 dates)
    API->>DB: UPDATE subject_attendance_entries SET status='Excused', rule_stipulation='PARENT_EXCUSED'
    API->>DB: INSERT into security_audit_logs (action_type='ADMIN_STUDENT_LEAVE_OVERRIDE')
    API->>Teacher: High-Priority Alert: "Leave decision overridden by Principal"
    API->>Parent: Notification: "Leave application approved by Principal via Executive Override"
    Note over Teacher,API: If Teacher attempts to re-reject: Returns HTTP 403 Forbidden
```

| Step | Actor / System | Rule / Action Executed | System Output & State Transition |
| :---: | :--- | :--- | :--- |
| **Step 1** | Frontline Action | Class teacher rejects student leave due to documentation delay. | Leave status marked `Rejected` in database. |
| **Step 2** | Executive Appeal | Parent presents certified documentation to Principal for emergency review. | Principal inspects case in Administrative Override console. |
| **Step 3** | Executive Override | Principal executes override; sets `is_admin_override=TRUE` with justification. | Attendance and period subject records automatically backfilled as `Excused`. |
| **Step 4** | Downstream Lockout | System locks record; prevents downstream teacher reversal (`403 Forbidden`). | Dual notification cascade alerts teacher and parent; logged in audit ledger. |

---

### 5.8 Inter-Coordinator Exam & Curriculum Pacing Sync (Academic $\times$ Exam $\times$ Teacher)

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Subject Teacher
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor Acad as Academic Coordinator
    actor Exam as Exam Coordinator

    Teacher->>API: POST /api/teacher/curriculum/log-unit (Class 9-A, Physics: Unit 3 Complete)
    API->>DB: UPDATE curriculum_pacing SET completed_units=3, status='Lagging (2 Units Behind)'
    Acad->>API: GET /api/academic/pacing/audit
    API-->>Acad: Flag Class 9-A Physics syllabus lag (< 50% vs target)
    Acad->>API: POST /api/academic/exam-sync/request (Subject: Physics, Proposed: POSTPONE_EXAM)
    API->>DB: INSERT INTO exam_sync_requests (status='PENDING_MEETING')
    API->>Exam: High-Priority Notification: "Curriculum Lag Alert: Class 9-A Physics"
    Exam->>API: POST /api/academic/exam-sync/resolve (Resolution: "Rescheduled exam by 4 days")
    API->>DB: UPDATE exam_sync_requests SET status='RESOLVED'
    API->>DB: UPDATE exam_schedules SET exam_date='2026-11-28'
    API->>Teacher: Notification: "Physics Exam Postponed — Conduct Extra Remedial Session"
```

| Step | Actor / System | Rule / Action Executed | System Output & State Transition |
| :---: | :--- | :--- | :--- |
| **Step 1** | Subject Teacher | Checks off completed lesson units in Teacher Portal. | Persists directly to PostgreSQL `curriculum_pacing`; status recalculates. |
| **Step 2** | Academic Coordinator | Monitors pacing velocities; detects critical lag prior to examination series. | Dispatches inter-coordinator consultation request (`ExamSyncRequest`). |
| **Step 3** | Exam Coordinator | Reviews syllabus shortfall and selects resolution (*Postpone Exam* or *Trim Cut-Off*). | Atomic timetable adjustment executed; resolution notes recorded in audit ledger. |
| **Step 4** | System Notification | Alerts subject teacher and students of revised exam schedule. | Timetable and student admit cards automatically update with new date. |

---

### 5.9 Medical Re-Examination Lifecycle (Parent $\to$ Admin $\to$ Exam Coordinator)

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Parent (Mobile)
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor Admin as Principal / Super Admin
    actor Exam as Exam Coordinator
    actor Student as Student

    Parent->>API: POST /api/parent/re-exam/apply (Subject: Mathematics, Reason: Hospitalization, Doc: MedCert.pdf)
    API->>DB: INSERT INTO re_exam_requests (status='Pending Admin Review')
    API->>Admin: High-Priority Alert: "Medical Re-Exam Petition: Aarav Sharma"
    Admin->>API: POST /api/admin/re-exam/{id}/adjudicate (Action: APPROVED, Remarks: "Valid hospital discharge summary")
    API->>DB: UPDATE re_exam_requests SET status='Approved by Admin'
    API->>Exam: Notification: "Schedule Re-Exam: Aarav Sharma (Class 8-B Math)"
    Exam->>API: POST /api/exams/re-exam/{id}/schedule (Date: "2026-11-30", Venue: "Hall B", Invigilator: "Mr. Raman")
    API->>DB: UPDATE re_exam_requests SET status='Scheduled', schedule_id=...
    API->>Student: Deliver Dynamic Medical Re-Exam Admit Card
    API->>Parent: Notification: "Re-Exam Scheduled: 30 Nov in Hall B"
```

| Step | Actor / System | Rule / Action Executed | System Output & State Transition |
| :---: | :--- | :--- | :--- |
| **Step 1** | Parent | Submits re-exam petition with attached certified medical documentation. | Creates `ReExamRequest` record in `Pending Admin Review` status. |
| **Step 2** | Principal / Admin | Reviews documentary evidence and approves petition for scheduling. | Status transitions to `Approved by Admin`; alerts Exam Coordinator. |
| **Step 3** | Exam Coordinator | Allocates dedicated re-examination date, venue, and chief invigilator. | Status transitions to `Scheduled`; generates linked `ExamSchedule`. |
| **Step 4** | Student & Parent | Student portal generates updated medical re-exam admit card with QR code. | Real-time notification dispatched to parent mobile app. |

---

## 6. UI/UX Screen Checklist (Figma Design Specifications)

| Portal / Module | Primary Device | Core Screens Required in Figma |
| :--- | :--- | :--- |
| **Super Admin / Principal Console** | Web (Desktop 1080p+) | 1. **Priority Command Center** (Red/Orange/Green Triage with Purged Inactive Categories)<br>2. **Administrative Override Console** (Student Leave, Task SLA, and Exam Override Modals)<br>3. **Four-Eye Payroll Authorization Modal** (Batch Net Summary, LOP Deductions, Sign-Off)<br>4. **Medical Re-Exam Adjudication Queue** (Document Viewer, Approval Remarks)<br>5. **SIS Directory & Document Vault** (Admin-Only Edit & Re-upload Lock)<br>6. **Entry/Exit Gate Log & Dual-Signature TC Clearance Modal** |
| **Academic Coordinator Portal** | Web (Desktop/Laptop) | 1. **Curriculum Pacing Matrix** (Live PostgreSQL Subject Progress & Lag Gauges)<br>2. **Inter-Coordinator Exam Sync Modal** (Syllabus Lag Alert & Resolution Request)<br>3. **PTM Faculty Attendance Audit Board** (Faculty Adherence Rates, Completed Conferences)<br>4. **Teacher Substitution Recommender** (Conflict-Free Period Matcher Grid) |
| **Exam Coordinator Portal** | Web (Desktop/Laptop) | 1. **Atomic Batch Class Exam Scheduler** (Multi-Slot Term Series Builder Grid)<br>2. **Inter-Coordinator Exam Sync Resolver** (Postpone Exam, Trim Cut-Off)<br>3. **Medical Re-Exam Scheduling Board** (Hall & Invigilator Deployment)<br>4. **Dynamic Admit Card Generator & Clearance Gate Modal**<br>5. **Examination Session Controller** (Lobby Open, Commenced, Concluded) |
| **Accounts Coordinator Portal** | Web (Desktop/Laptop) | 1. **Institutional Fee Structure Configurator** (`FeeStructure` Annual & Term Matrix)<br>2. **3-Tier Fee Aging Ledger** (1–30d, 31–60d, 60+d Overdue Defaulter Table)<br>3. **Physical Counter Collection Modal** (Zero-Overpayment Guard, Cash/POS Receipt)<br>4. **Online Bank Transaction Ledger** (UTR Reconciliation & Authentic Receipt Sync)<br>5. **Monthly Staff Payroll Engine** (Maker Batch Builder, LOP Deduction Calculator) |
| **Admissions Coordinator Portal** | Web (Desktop/Laptop) | 1. **24/7 AI Chatbot Ingestion CRM** (Live Lead Triage & Qualification Funnel)<br>2. **Follow-Up Call Tracker** (Call Outcome Notes & SLA Reminder Queue)<br>3. **Single-Click SIS Conversion Modal** (Sibling Discount 15%, Bus Route, Auto-Invoice)<br>4. **Secondary Student Dossier Form** (Emergency Contacts, Languages, Ambitions) |
| **Teacher Portal** | Web (Desktop/Laptop) | 1. **Teacher Home Dashboard** (Active Period Ticker, Attendance Roster, Duty List)<br>2. **Curriculum Lesson Check-Off Modal** (Units Completed, Lesson Title, Pacing Sync)<br>3. **Live Class Host Studio** (WebRTC Video Stage, Whiteboard, 10-Min Auto-Roster)<br>4. **Split-Screen SpeedGrader Studio** (Document Canvas Left, Weighted Rubric Right)<br>5. **PTM Attendance & Summary Notes Modal** (Completed, Absent, Meeting Notes)<br>6. **Staff Leave & Short-Permission Form** (CL/SL/EL/LOP & Affected Period Selector) |
| **Student Portal** | Web (Desktop/Laptop) | 1. **Student Home Dashboard** (Moving Event Banner, Period Ticker, Attendance Summary)<br>2. **Live Classroom Cockpit & Video Library** (LiveKit Stream, Notes Viewer)<br>3. **Dynamic Admit Card Modal** (Hall Name, Seat Number, Invigilator, Verification QR)<br>4. **Medical Re-Exam Admit Card Viewer** (Rescheduled Venue & Timing Instructions)<br>5. **Homework Vault & Submission Dropzone** (Camera Upload, SpeedGrader Feedback)<br>6. **Side-by-Side Participations & Achievements Portfolio Upload** |
| **Parent Application** | Mobile App (Android/iOS) | 1. **Parent Home Dashboard** (Top Moving Banner Sliders & Multi-Student Switcher)<br>2. **Dynamic Child Admit Card Viewer** (Exam Schedule, Hall Seating, Instructions)<br>3. **Medical Re-Exam Petition Modal** (Subject Selection & Medical Certificate Upload)<br>4. **PTM Closed-Loop Modal** (15-Min Grid with 5-Min Timer, Cancellation with Reason)<br>5. **Authentic QR Code Fee Checkout** (1-Click UPI/Card Payment & PDF Receipts)<br>6. **Live School Bus GPS Map Radar** & Digital TC Handover Sign-Off |
| **Cross-Cutting Global** | All Devices / Portals | 1. **In-App Notification Center** (Sound Alerts, Unread Badges, Action Deep-Links)<br>2. **Dynamic ClockProvider Ticker** (30-Second Timetable & Exam Lifecycle Clock) |

---

## 7. Recommended Technology Stack & Architecture

| Architecture Layer | Production Technology | Operational Role & Justification |
| :--- | :--- | :--- |
| **Web Frontend** | Next.js 14/16 (React 18/19) | Server-Side Rendering (SSR) for blazing initial loads + Client components for high-density administrative dashboards. |
| **Mobile Application** | React Native (Expo) + TypeScript | Cross-platform iOS/Android parent app sharing data types, schemas, and API contracts with the web frontend. |
| **Language & Typing** | TypeScript (Strict Mode) | Full compile-time type safety across all 8 portals (0 errors on `tsc --noEmit`). |
| **Styling & Icons** | Tailwind CSS + Lucide React | Institutional design tokens with responsive grid layouts, high-contrast badges, and micro-interactions. |
| **Backend API** | FastAPI (Python 3.11+) | Monolithic asynchronous ASGI runtime handling SIS, Attendance, Fees, Academic, and Exams endpoints with high concurrency. |
| **Primary Database** | PostgreSQL 15+ (`asyncpg`) | Enterprise relational database with ACID compliance, JSON column indexing, foreign keys, and CHECK constraints. |
| **ORM & Concurrency** | SQLAlchemy 2.0 Async | Single-pass JOIN queries paired with pessimistic database row locks (`SELECT ... FOR UPDATE`) to eliminate race conditions. |
| **Live Video & Audio** | LiveKit WebRTC Server & SDK | Embedded in-browser live classrooms, screen sharing, automatic cloud recording, and attendance webhooks. |
| **Dynamic Timekeeping** | Centralized `ClockProvider` | Reactive simulation hook with 30-second ticker aligning class timetables, period switches, and exam lifecycles. |
| **Real-Time Notification** | In-App WebSocket + Web Audio | Multi-target role & user-id dispatching with live sound chimes, unread count badges, and deep-link action navigation. |
| **Security & Auth** | HMAC-SHA256 Signed Tokens | Scoped role verification headers (`X-User-Role`, `X-User-Id`) with strict router-level authorization guards. |
| **Financial Ledger Engine**| `fee-ledger.ts` + `authentic-qr.tsx`| Real-time bank reconciliation, counter POS collection guards, and dynamic QR code generation. |
| **Artificial Intelligence** | Google Gemini 1.5/2.0 Flash Vision | Multimodal diagram inspection, student notebook OCR analysis, remedial sprint generation, and Socratic chatbot. |
| **Compliance & Storage** | S3-Compatible Encrypted Vault | Cloudflare R2 / AWS S3 for zero-egress storage of homework uploads, evaluated PDFs, and transfer certificates. |

---

## 8. Phased Implementation Roadmap

| Phase / Milestone | Timeline | Core Deliverables & Production Gates | Status |
| :--- | :--- | :--- | :---: |
| **Milestone 1: Core SIS, Security & Governance** | Weeks 1–5 | • Cryptographic Role-Based Auth (HMAC tokens + scoped role guards)<br>• Central Student Information System (SIS) Profile Engine<br>• Admin-Only Document Vault security lockdown<br>• Admissions CRM Inquiry Funnel & Sibling Linking (15% waiver)<br>• 3-Tier Fee Aging Ledger & Counter Cashier Modal with overpayment guards<br>• Staff Payroll Engine with Four-Eye Principal Authorization<br>• Dual-Signature Student Exit / Transfer Certificate (TC) Clearance | **Completed** |
| **Milestone 2: Classroom, Grading, Exams & App** | Weeks 6–10 | • Live Online Classes via embedded LiveKit WebRTC cluster<br>• 10-Minute Automated Attendance Engine via webhooks<br>• Period-Wise Granular Subject Attendance Ledger with leave sync<br>• Student Homework Upload with mobile camera compression<br>• Teacher SpeedGrader Studio with browser-based canvas annotations<br>• Atomic Batch Class Examination Scheduling & Dynamic Admit Cards<br>• Parent Mobile Portal with Moving Banner Sliders & Bus Radar<br>• PTM Slot Concurrency Row Locks (`SELECT ... FOR UPDATE`) | **Completed** |
| **Milestone 3: Intelligence, Overrides & Live Pilot** | Weeks 11–14 | • Admin Red/Orange/Green Priority Action Triage Engine (Purged Inactive Categories)<br>• Administrative Override & Governance Engine (5 Concrete Domains)<br>• Inter-Coordinator Exam & Curriculum Pacing Sync Protocol (`ExamSyncRequest`)<br>• Medical Re-Examination Lifecycle (`ReExamRequest`)<br>• PTM Closed-Loop Attendance & Meeting Summary Notes Delivery<br>• Multi-Student Family Account Switching on Parent Portal<br>• In-App Real-Time Notification Center with targeted user-id routing & sound alerts<br>• Centralized `ClockProvider` dynamic timetable lifecycle alignment<br>• Shared Student 'Focus Table' Generator for academic recovery<br>• Production Pilot School Onboarding & Benchmark Security Audits | **Active Baseline** |

---

## Document Sign-Off & Architectural Verification
- **Lead System Architect**: Approved & Synchronized
- **Lead Backend Architect**: Approved & Synchronized
- **Database Optimizer**: Approved & Synchronized
- **Lead Frontend Developer**: Approved & Synchronized
- **Codebase Archaeologist**: Verified & Drift Cleared
- **Head of Product**: Approved & Synchronized
