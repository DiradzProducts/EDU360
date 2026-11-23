# EDU360 Master System Architecture & Role-Wise Workflow Specification
**Enterprise Cloud-Native Institutional Management, WebRTC Live Education & Unified SIS Ecosystem**  
**Document Classification:** Production Architectural Baseline (v9.0 — Fully Synchronized Cross-Role Ecosystem)  
**Authors:** Principal Software Architect (`/Software Architect`), Backend Architect (`/Backend Architect`), Database Optimizer (`/Database Optimizer`), Frontend Developer (`/Frontend Developer`), Codebase Archaeologist (`/Codebase Archaeologist`), Lead Technical Writer (`/Technical Writer`)  
**Scope:** The 8 Canonical Roles (Excluding Junior K–5 as specified) + Administrative Override Governance Engine + Cross-Role Real-Time Synchronization Bus

---

## 1. System Topology & Macro Architecture

EDU360 operates as a **modular monolith** with domain-driven bounded contexts. The system runs an asynchronous **FastAPI (Python 3.11+)** ASGI service, a **Next.js 14/16 (React 18/19 SSR/Client)** multi-portal frontend, a **PostgreSQL 15+** transactional relational store with asynchronous connection pooling via `asyncpg`, a distributed **LiveKit WebRTC** cluster for live video classroom instruction, a centralized **ClockProvider** simulation engine, a real-time **In-App Notification Center**, a reactive cross-portal **Fee Ledger Synchronization Bus**, and an S3-compatible encrypted **Object Vault** for homework and document compliance records.

### 1.1 Master C4 Container Architecture Diagram

```mermaid
graph TD
    subgraph ClientTiers ["Client Presentation Tier (Next.js Multi-Portal Architecture)"]
        UI_ADMIN["Admin / Principal Workstation<br/><code>/admin</code> (Desktop 1080p+)"]
        UI_ACAD["Academic Coordinator Portal<br/><code>/academic_coordinator</code>"]
        UI_EXAM["Exam Coordinator Portal<br/><code>/exam_coordinator</code>"]
        UI_ACC["Accounts Coordinator Portal<br/><code>/accounts_coordinator</code>"]
        UI_ADM["Admissions Coordinator Portal<br/><code>/admissions_coordinator</code>"]
        UI_TEACH["Teacher SpeedGrader Studio<br/><code>/teacher</code> (Split-Pane Web)"]
        UI_STUD["Secondary Student Cockpit<br/><code>/student</code> (Web / Tablet PWA)"]
        UI_PAR["Parent Mobile Portal<br/><code>/parent</code> (Mobile-First / PWA)"]
    end

    subgraph CrossCuttingEdge ["Cross-Cutting Reactive Edge Services"]
        NOTIF_BELL["Unified In-App Notification Center<br/>(Live Audio Chime, Unread Badges & Action Deep-Links)"]
        DYNAMIC_CLOCK["Dynamic ClockProvider Reactive Hook<br/>(30-Second Timetable & Exam Lifecycle Ticker)"]
        FEE_SYNC_BUS["Reactive Client-Side Fee Ledger Sync (fee-ledger.ts)<br/>(Immediate Dual-Portal Sync: Accounts & Admin)"]
        AUTHENTIC_QR["Authentic 29x29 UPI QR Generator (authentic-qr.tsx)<br/>(Dynamic Merchant Payload: PhonePe / GPay / BHIM)"]
    end

    subgraph GatewayTier ["Security, Ingress & ASGI Middleware"]
        INGRESS["FastAPI ASGI Gateway / Reverse Proxy (:8000)"]
        AUTH_RBAC["Cryptographic RBAC Guard<br/>(HMAC-SHA256 Token + Scoped Headers)"]
        CLOCK_SVC["Centralized ClockProvider Service<br/>(Deterministic Time & Simulation Overrides)"]
    end

    subgraph ServiceEngines ["Domain Services & Business Logic Engines"]
        OVERRIDE_ENG["Administrative Override & Governance Engine"]
        LIVEKIT_WORKER["LiveKit WebRTC Telemetry & 10-Min Auto-Attendance Worker"]
        SPEEDGRADER_ENG["SpeedGrader Engine & Gemini OCR Multimodal Worker"]
        CONCURRENCY_MGR["Pessimistic Concurrency Manager (SELECT ... FOR UPDATE)"]
        SUB_MATCHER["Conflict-Free Substitution & Workload Balance Matcher"]
        EXIT_CLEARANCE["Dual-Signature Exit & Vault Sealing Engine"]
        FEE_AGING["3-Tier Fee Aging & Counter Payment Engine (Overdue Balance Cap)"]
        PAYROLL_ENG["Staff Salaries & Payroll Engine (LOP Deductions & Four-Eye Maker-Checker)"]
        BATCH_EXAM_ENG["Batch Class Exam Scheduling & Dynamic Admit Card Engine"]
        ACADEMIC_SYNC["Academic & Exam Coordinator Syllabus Sync Protocol (ExamSyncRequest)"]
        ATOMIC_ENROLL["Admissions Atomic SIS Entity Inception Engine"]
        MODERATION_LEDGER["Assessment Normalization & Secrecy Vault Engine"]
    end

    subgraph PersistenceTier ["Data Persistence, Compliance & Storage Layer"]
        PG_MASTER[("PostgreSQL 15+ Primary Schema<br/>(Transactional ACID Engine via asyncpg)")]
        AUDIT_CHAIN[("Append-Only Security Audit Ledger<br/>(SHA-256 Cryptographic Seals)")]
        S3_VAULT[("Encrypted Asset & Document Vault<br/>(S3 / MinIO Object Storage)")]
    end

    UI_ADMIN & UI_ACAD & UI_EXAM & UI_ACC & UI_ADM & UI_TEACH & UI_STUD & UI_PAR --> NOTIF_BELL & DYNAMIC_CLOCK
    UI_PAR --> AUTHENTIC_QR
    UI_ACC & UI_ADMIN & UI_PAR --> FEE_SYNC_BUS
    NOTIF_BELL & DYNAMIC_CLOCK & FEE_SYNC_BUS --> INGRESS
    INGRESS --> AUTH_RBAC
    AUTH_RBAC --> CLOCK_SVC
    CLOCK_SVC --> OVERRIDE_ENG & LIVEKIT_WORKER & SPEEDGRADER_ENG & CONCURRENCY_MGR & SUB_MATCHER & EXIT_CLEARANCE & FEE_AGING & PAYROLL_ENG & BATCH_EXAM_ENG & ACADEMIC_SYNC & ATOMIC_ENROLL & MODERATION_LEDGER

    OVERRIDE_ENG & PAYROLL_ENG --> AUDIT_CHAIN
    OVERRIDE_ENG & LIVEKIT_WORKER & SPEEDGRADER_ENG & CONCURRENCY_MGR & SUB_MATCHER & EXIT_CLEARANCE & FEE_AGING & PAYROLL_ENG & BATCH_EXAM_ENG & ACADEMIC_SYNC & ATOMIC_ENROLL & MODERATION_LEDGER --> PG_MASTER
    SPEEDGRADER_ENG & EXIT_CLEARANCE --> S3_VAULT
```

---

## 2. Cross-Cutting Administrative Override & Governance Engine

In virtual and physical school operations, exceptional circumstances arise where standard automated rules or frontline staff decisions threaten institutional compliance, equity, or operations (e.g., a teacher rejecting an emergency medical leave, a fee dispute halting student board exams, or a coordinator SLA breach).

The **Administrative Override Architecture** establishes an auditable, hierarchical bypass state machine.

```mermaid
graph TD
    subgraph AuthorityHierarchy ["State Authority Resolution Pyramid"]
        TIER3["Level 3: Executive Authority (Super Admin / Principal)<br/><code>is_admin_override = True</code>"]
        TIER2["Level 2: Operational Oversight (Academic/Exam Coordinators)<br/><code>moderation_lock, schedule_lock</code>"]
        TIER1["Level 1: Frontline Delivery (Class Teachers)<br/><code>teacher_override = True</code>"]
        TIER0["Level 0: Autonomous Automation (WebRTC Telemetry, SLA Sweeper)<br/><code>status = 'auto_livekit', 'system_flag'</code>"]
    end

    TIER0 -->|Teacher manually adjusts| TIER1
    TIER1 -->|Coordinator standardizes| TIER2
    TIER2 -->|Principal executive action| TIER3

    TIER3 -.->|"LOCKOUT: Downstream roles cannot reverse<br/>(Returns HTTP 403 Forbidden)"| TIER1
    TIER3 -.->|"Serializes Tamper-Evident SHA-256 Event"| AUDIT_LEDGER[("security_audit_trail")]
```

### 2.1 The 5 Concrete Administrative Override Domains

| Override Module | Database Attributes | Trigger Condition | Execution Rule & Invariant |
| :--- | :--- | :--- | :--- |
| **1. Student Leave & Attendance** | `LeaveRequest.is_admin_override = Boolean`<br>`Attendance.admin_override = Boolean`<br>`Attendance.override_by_role = "ADMIN"` | Principal approves a disputed leave (e.g. hospitalization) previously rejected or unhandled by teacher. | **Downstream Reversal Lockout**: If `LeaveRequest.is_admin_override == True`, teacher portal rejection endpoints return `403 Forbidden`. The attendance register updates to `status='Leave'`, sets `admin_override=True`, and dispatches an `ADMIN_OVERRIDE_ALERT` notification to both teacher and parent. |
| **2. Institutional Tasks & SLA** | `Task.is_admin_override = Boolean`<br>`Task.admin_override_reason = Text`<br>`Task.approved_by = "Principal (Override)"` | A coordinator or department task stalls beyond its SLA, threatening statutory filing or board deadlines. | Force-closes or reassigns task immediately without coordinator sign-off. Emits `TASK_ADMIN_OVERRIDE_CLOSE` to the audit log with mandatory justification text. |
| **3. Exam Marks Moderation** | `ExamModeration.is_locked = Boolean`<br>`ExamModeration.admin_override = Boolean` | Post-moderation grade adjustments required due to board re-evaluation or calculation discrepancy. | Breaks the coordinator cryptographic mark freeze. Requires dual administrator credentials; archives previous score vector snapshot into historical audit table. |
| **4. Emergency Timetable Substitution** | `SubstitutionSlot.is_admin_override = Boolean`<br>`SubstitutionSlot.status = "Assigned"` | Severe faculty absenteeism where all available department teachers exceed daily workload caps ($>6$ periods/day). | Suppresses workload ceiling warning; logs emergency coverage directive with Principal authorization ID. |
| **5. Financial Concession & Clearance** | `FeeMilestone.concession_amount = Float`<br>`FeeMilestone.is_admin_override = Boolean` | Extreme hardship or scholarship waiver enabling student to clear exit clearance or receive marks memos. | Deducts arrears from billing ledger; locks accounts department from generating balance reminders for the waived amount. |

---

## 3. The 8 Role-Wise Architectures & Workflows

---

### Role 1: Teacher Portal (`/teacher`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Pedagogical Delivery, Assessment & Faculty Workforce Context*
* **Core Invariants:**
  1. A teacher can only grade submissions for sections and subjects explicitly mapped to them in `teacher_assignments`.
  2. The teacher cannot overturn an active Principal Administrative Override on student leaves or attendance.
  3. AI-suggested scores (via Gemini OCR) are strictly recommendations; **the teacher retains final evaluation authority** and must explicitly verify and commit grades.
  4. **Leave Categorization Invariant**: Teacher leave requests must declare a formal category:
     * `Casual Leave (CL)`
     * `Medical Leave (ML)` (with required medical documentation)
     * `On-Duty (OD)` (academic/exam proctoring duties)
     * `Loss of Pay / Unpaid (LOP)` (direct interlock with Accounts Coordinator payroll deductions)
  5. **Attendance Integrity**: Teachers log daily check-in and check-out via `StaffAttendanceDaily` (`staff_attendance_daily`), providing ground truth for substitute allocation and daily on-campus verification.
  6. **Dynamic Class Roster Sync**: When the Admissions Coordinator converts a CRM lead into an enrolled student, the student profile and Day 1 attendance baseline automatically appear in the assigned class teacher's live register without manual database re-seeding.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph TeacherWorkspace ["Teacher Presentation Workspace (/teacher)"]
        UI_LIVE_STUDIO["Live Lecture Studio (Broadcaster Stage)"]
        UI_SPEEDGRADER["2-Pane SpeedGrader Studio (PDF/OCR Canvas)"]
        UI_ATT_REGISTER["Bulk Attendance Register (P/A/L/E Fastkeys)"]
        UI_LEAVE_DESK["Staff Leave Desk (CL, ML, OD, LOP Types)"]
        UI_DAILY_CLOCK["Daily Faculty Check-In / Check-Out Widget"]
        UI_FOCUS_TABLE["1-Week Shared Focus Table Generator"]
        UI_CHAT_NOTE["Parent-Teacher Note & Chat Desk"]
    end

    subgraph TeacherServices ["FastAPI Teacher Application Services"]
        ROOM_MGR["LiveKit Room Management Service"]
        GRADING_ENG["Rubric & Annotation Evaluation Service"]
        GEMINI_OCR["Gemini Multimodal OCR Ingestion Worker"]
        ATT_RECON["Attendance Register Reconciliation Service"]
        STAFF_LEAVE_SVC["Faculty Leave & On-Duty Dispatch Service"]
        CHAT_HUB["Bidirectional Parent-Teacher Messaging Service"]
    end

    subgraph TeacherEntities ["Database Aggregates & Entities"]
        TBL_ROOMS[("rooms")]
        TBL_HW_SUB[("homework_submissions")]
        TBL_ATT[("attendance")]
        TBL_STAFF_PERM[("staff_permissions (leave_category, total_days)")]
        TBL_STAFF_ATT[("staff_attendance_daily")]
        TBL_FOCUS[("student_focus_tables")]
        TBL_MESSAGES[("parent_teacher_messages")]
    end

    UI_LIVE_STUDIO --> ROOM_MGR --> TBL_ROOMS
    UI_SPEEDGRADER --> GEMINI_OCR --> GRADING_ENG --> TBL_HW_SUB
    UI_ATT_REGISTER --> ATT_RECON --> TBL_ATT
    UI_LEAVE_DESK --> STAFF_LEAVE_SVC --> TBL_STAFF_PERM
    UI_DAILY_CLOCK --> STAFF_LEAVE_SVC --> TBL_STAFF_ATT
    UI_FOCUS_TABLE --> TBL_FOCUS
    UI_CHAT_NOTE --> CHAT_HUB --> TBL_MESSAGES
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `teachers` (`id` PK, `user_id` FK, `department`, `max_daily_periods`)
  * `homework_submissions` (`id` PK, `homework_id` FK, `student_id` FK, `file_url`, `score`, `teacher_feedback`, `status`, `annotated_pdf_url`)
  * `attendance` (`id` PK, `student_id` FK, `date`, `status`, `method`, `minutes_late`, `teacher_override`, `admin_override`, `override_by_role`)
  * `staff_permissions` (`id` PK, `staff_id` FK, `leave_category`, `total_days`, `affected_periods`, `reason`, `status`, `approved_by`, `reviewed_at`)
  * `staff_attendance_daily` (`id` PK, `staff_id` FK, `attendance_date`, `check_in_time`, `check_out_time`, `status`, `notes`)
  * `student_focus_tables` (`id` PK, `student_id` FK, `weak_subjects`, `target_goals`, `teacher_id` FK, `parent_acknowledged`)
  * `parent_teacher_messages` (`id` PK, `student_id` FK, `sender_role`, `sender_name`, `message_text`, `timestamp`, `is_read`)

#### 4. End-to-End Workflow: SpeedGrader Submission Evaluation with OCR Assist

```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Class Teacher
    participant UI as SpeedGrader UI
    participant API as FastAPI Backend
    participant OCR as Gemini Vision Engine
    participant DB as PostgreSQL DB
    actor Parent as Parent Mobile

    Teacher->>UI: Select Pending Homework ("Thermodynamics Lab")
    UI->>API: GET /api/v1/teacher/submissions/{id}
    API->>DB: SELECT submission, student_info, rubric
    DB-->>UI: Deliver Raw Submission Image & Grading Rubric
    Teacher->>UI: Click "Run OCR Analysis"
    UI->>API: POST /api/v1/teacher/ocr-assist
    API->>OCR: Ingest Handwritten Math/Science Solution
    OCR-->>API: Extract Equations, Calculate Rubric Match (Score: 42/50)
    API-->>UI: Populate Suggested Scores in Right Rubric Pane
    Teacher->>UI: Review Work on Left Canvas, Modify Score (45/50), Add Voice Note
    Teacher->>UI: Click "Submit Evaluation & Return"
    UI->>API: POST /api/v1/teacher/grade-submission
    API->>DB: UPDATE homework_submissions SET score=45, status='Graded'
    API->>DB: UPDATE student_portfolio (Trigger Remedial Focus if score < 50%)
    API->>Parent: Push Notification: "Physics Lab Graded: 45/50 with Remarks"
```

---

### Role 2: Secondary Student Cockpit (`/student`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Learning Execution, Examination & Academic Portfolio Context*
* **Core Invariants:**
  1. Multi-tab concurrent homework submissions are locked via pessimistic transaction row locks (`SELECT ... FOR UPDATE`).
  2. Submissions uploaded after 05:00 PM are rejected unless an approved medical excuse exists.
  3. Student attendance is verified deterministically through LiveKit WebRTC connection telemetry ($T \ge 10\text{ mins}$).
  4. **Day 1 Onboarding Baseline**: When enrolled, the student automatically receives an initial active `AttendanceRecord` (`status='Present'`), 5 statutory `FeeMilestones`, and a digital `HallTicket` linked to peer examinations.
  5. **Dynamic Admit Card Delivery**: Hall tickets / Admit cards stream directly from database batch schedules (`ExamSchedule`), rendering seat capacity, chief invigilator name, room code, and a tamper-evident verification QR code.
  6. **Conditional Live Exam Mounting Engine**: The live online exam view **strictly mounts only when**:
     * An exam schedule exists for the student's class and section on the current system date (`cleanDate === todayYMD`).
     * The schedule lifecycle status is currently `LIVE` ($T_{\text{start}} \le \text{CurrentMinutes} < T_{\text{end}}$).
     * The student has not already completed/submitted the exam (`examSubmissionState !== 'completed'`).
  7. **Real-Time Dynamic Timetable Lifecycle**: Evaluates every 30 seconds against the centralized `ClockProvider`:
     * Periods before start time render as `upcoming` with countdown timers.
     * Active periods render as `live`, illuminating the "Join Active Class Now" WebRTC button.
     * Concluded periods render as `completed`, rendering the "Watch Recording" link navigating to the lesson video vault.

#### 2. Architecture Diagram

```mermaid
graph LR
    subgraph StudentUI ["Secondary Student Cockpit (/student)"]
        UI_STAGE["LiveKit Video Stage & Active Speaker Spotlight"]
        UI_DYNAMIC_PERIODS["Real-Time Period Lifecycle Grid (Live / Upcoming / Done)"]
        UI_COND_EXAM["Conditional Live Exam Mounting Engine"]
        UI_VAULT["Homework Camera Capture & Multi-PDF Vault"]
        UI_HALL["Dynamic Hall Ticket & Admit Card Desk"]
        UI_PORTFOLIO["Side-by-Side Participations & Achievements"]
        UI_NOTIF["In-App Notification Center (Audio Chime & Badges)"]
    end

    subgraph StudentPorts ["Application Services"]
        MEDIA_CONSUMER["WebRTC Media Ingestion Port"]
        TIMETABLE_TICKER["Dynamic Clock Lifecycle Evaluator (30s)"]
        VAULT_LOCKER["Pessimistic Submission Handler (FOR UPDATE)"]
        EXAM_DISPATCHER["Exam Schedule & Hall Ticket Stamping Service"]
    end

    subgraph StudentStorage ["Persistence"]
        DB_STU_SUB[("homework_submissions")]
        DB_EXAM_SCHED[("exam_schedules (batch_id, series_name)")]
        DB_HALL_TICKETS[("exam_hall_tickets")]
        S3_HOMEWORK[("s3://student-homework-vault")]
    end

    UI_STAGE --> MEDIA_CONSUMER
    UI_DYNAMIC_PERIODS --> TIMETABLE_TICKER
    UI_COND_EXAM --> EXAM_DISPATCHER --> DB_EXAM_SCHED
    UI_VAULT --> VAULT_LOCKER --> DB_STU_SUB
    VAULT_LOCKER --> S3_HOMEWORK
    UI_HALL --> EXAM_DISPATCHER --> DB_HALL_TICKETS
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `students` (`id` PK, `admission_no` UNIQUE, `roll_no`, `class_id` FK, `status`, `health_flags`)
  * `homework_submissions` (`id` PK, `homework_id` FK, `student_id` FK, `submitted_at`, `status`, `sha256_hash`)
  * `exam_schedules` (`id` PK, `exam_id` FK, `series_name`, `batch_id`, `schedule_type`, `class_name`, `section`, `exam_date`, `start_time`, `end_time`, `hall_name`, `chief_invigilator_name`)
  * `exam_hall_tickets` (`id` PK, `student_id` FK, `exam_id` FK, `qr_code_hash`, `issued_at`, `is_unlocked`)

#### 4. End-to-End Workflow: Dynamic Exam Schedule $\to$ Admit Card & Live Mounting

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant UI as Student Web Portal
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    participant CLOCK as ClockProvider

    Student->>UI: Open Portal (Secondary Dashboard)
    UI->>API: GET /api/student/exam-schedules?class_name=10th+Standard&section=A
    API->>DB: SELECT * FROM exam_schedules WHERE class_name='10th Standard' ORDER BY exam_date ASC
    DB-->>API: Return Batch Schedules (Series: "Term 1 Finals", Batch: "BATCH-10AB-TERM1")
    API-->>UI: Deliver Dynamic Schedules with Hall Numbers & Chief Invigilators
    
    UI->>CLOCK: Query Current Synchronized Time
    CLOCK-->>UI: Current System Time: 10:45 AM, Today: 2026-11-20
    
    Note over UI: Evaluates Exam: Date == Today AND 10:30 <= 10:45 < 12:00 AND status != 'completed'
    alt Condition TRUE
        UI->>UI: Mount Live Exam Stage (Illuminates "Join Exam Proctor Session")
    else Condition FALSE
        UI->>UI: Render Downloadable Dynamic Admit Card with QR Code Verification
    end
```

---

### Role 3: Parent Portal (`/parent`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Guardian Oversight, Family Engagement & Financial Settlement Context*
* **Core Invariants:**
  1. Anti-spam delivery: Push alerts are restricted to urgent items; routine announcements are displayed exclusively on the **Moving Slider Banners**.
  2. **Concurrency-Safe Dynamic PTM Booking**: PTM slot reservations use pessimistic row locking on `PTMSlot` with a 5-minute temporary `HELD` lease before transition to `BOOKED`.
  3. **Authentic UPI QR Matrix**: Generates a mathematically genuine 29x29 module QR matrix with authentic position finders for merchant UPI payloads (`upi://pay?pa=...`).
  4. **Immediate Real-Time Fee Sync**: When a parent pays an invoice online or makes a physical counter payment, the milestone immediately flips to `Paid`, clears the student from defaulter status, and triggers instant update broadcasts to the Accounts and Admin dashboards.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph ParentApp ["Parent Mobile-First Portal (/parent)"]
        UI_SLIDER["Anti-Spam Moving Slider Carousel"]
        UI_CASHIER["Digital Cashier (Authentic 29x29 UPI QR / NetBanking / Cards)"]
        UI_PTM["Dynamic PTM Booking Slot Grid (5-Min Countdown)"]
        UI_LEAVE["Leave & Medical Excuse Uploader"]
        UI_RADAR["Live School Bus GPS Radar"]
        UI_NOTIF["Notification Center (Fee, Grade & Bus Cues)"]
    end

    subgraph ParentServices ["Backend Gateway Handlers"]
        SLIDER_SVC["Daily Notice Aggregator"]
        PAYMENT_RECON["Payment Gateway & Counter Webhook Reconciler"]
        PTM_PESSIMISTIC["Pessimistic Hold Engine (SELECT FOR UPDATE)"]
        LEAVE_ROUTER["Leave Workflow Ingestion Service"]
    end

    subgraph ParentTables ["Relational Models"]
        TBL_FEES[("fee_milestones & receipts")]
        TBL_PTM[("ptm_slots (status: AVAILABLE, HELD, BOOKED)")]
        TBL_LEAVE_REQ[("leave_requests")]
    end

    UI_SLIDER --> SLIDER_SVC
    UI_CASHIER --> PAYMENT_RECON --> TBL_FEES
    UI_PTM --> PTM_PESSIMISTIC --> TBL_PTM
    UI_LEAVE --> LEAVE_ROUTER --> TBL_LEAVE_REQ
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `parents` (`id` PK, `user_id` FK, `full_name`, `phone_number`, `email`, `upi_vpa`)
  * `parent_student_map` (`id` PK, `parent_id` FK, `student_id` FK, `relationship_type`)
  * `ptm_slots` (`id` PK, `slot_code`, `teacher_id` FK, `slot_date`, `slot_time`, `status`, `held_by_parent_id` FK, `hold_expires_at`, `booked_student_name`, `meeting_url`)
  * `fee_milestones` (`id` PK, `student_id` FK, `term_name`, `due_amount`, `paid_amount`, `status`, `utr_number`, `receipt_pdf_url`)

#### 4. End-to-End Workflow: Concurrency-Safe PTM Booking & Fee Settlement

```mermaid
sequenceDiagram
    autonumber
    actor Parent as Parent Mobile
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    participant PG as Payment Gateway / QR Engine
    actor Teacher as Teacher

    Parent->>API: POST /api/v1/parent/ptm/slots/hold (slot_id=8)
    API->>DB: SELECT * FROM ptm_slots WHERE id=8 FOR UPDATE
    Note over DB: Row 8 LOCKED. Checks if status == 'AVAILABLE'
    API->>DB: UPDATE ptm_slots SET status='HELD', held_by=Parent, hold_expires_at=NOW()+5m
    DB-->>Parent: 200 OK (Starts 5-Minute Reservation Bar)
    Parent->>API: POST /api/v1/parent/ptm/slots/confirm (agenda="Math Remedial Plan")
    API->>DB: UPDATE ptm_slots SET status='BOOKED'
    API->>Teacher: WebSocket: "New PTM Confirmed with Parent @ 10:15 AM"
    Parent->>API: POST /api/v1/parent/fees/pay (milestone_id=2, method='UPI_QR')
    API->>PG: Generate Dynamic Merchant QR Payload (AuthenticQr Matrix)
    PG-->>Parent: Display In-App QR Code & UPI Intent Link
    Parent->>PG: Complete UPI Payment via PhonePe/GPay
    PG->>API: Webhook: payment.captured (UTR: UTR982348123)
    API->>DB: UPDATE fee_milestones SET status='PAID', utr_number='UTR982348123'
    API-->>Parent: Deliver Timestamped PDF Fee Tax Receipt
```

---

### Role 4: Super Admin / Principal Console (`/admin`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Institutional Supervision, Executive Governance & Financial Authorization Context*
* **Core Invariants:**
  1. Priority Triage Cockpit (🔴 Red / 🟠 Orange / 🟢 Green) auto-updates every 60 seconds; students with approved leaves are excluded from unexcused absence red flags.
  2. Administrative Overrides are cryptographically stamped with SHA-256 seals.
  3. Student Exit Certificates (TC) require a dual-signature handshake (Library + Accounts clearance) followed by Principal digital seal verification.
  4. **Executive Staff Leave Pop-Up**: Pending faculty leave applications (`staff_permissions`) display prominently on the executive dashboard with urgent action badges and an approval pop-up.
  5. **Four-Eye Maker-Checker Payroll Authorization**: Large-scale financial outflows (monthly staff salary wire) require mandatory executive sign-off from the Principal (`POST /api/finance/payroll/batches/{id}/authorize`) before the Accounts Coordinator can execute disbursements.
  6. **Real-Time Collections Synchronization**: Top executive collection tiles and fee realization gauges update reactively through the shared `fee-ledger.ts` bus whenever a payment occurs anywhere in the institution.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AdminConsole ["Principal Executive Console (/admin)"]
        UI_TRIAGE["Priority Triage Cockpit (Red / Orange / Green)"]
        UI_OVERRIDE_PANEL["Administrative Override Control Center"]
        UI_LEAVE_WIDGET["Faculty Staff Leave Review Pop-Up & Badges"]
        UI_PAYROLL_AUTH["Four-Eye Payroll Batch Sign-Off Desk"]
        UI_TC_VAULT["Dual-Signature TC Clearance & Vault Desk"]
        UI_CLOCK_SIM["Institutional Clock Simulation Controller"]
        UI_SIS_DIR["Unified SIS Directory & 360 Dossier Viewer"]
    end

    subgraph AdminEngines ["Governance Engines"]
        TRIAGE_CALC["Triage Health Calculator Worker"]
        OVERRIDE_EXEC["Admin Override Routing Controller"]
        PAYROLL_SIGNER["Executive Financial Authorization Engine"]
        SEAL_SERVICE["Cryptographic Certificate Sealing Engine"]
        AUDIT_LOGGER["SHA-256 Immutability Audit Logger"]
    end

    subgraph AdminLedgers ["Master Ledgers"]
        DB_AUDIT[("security_audit_trail")]
        DB_STAFF_LEAVES[("staff_permissions")]
        DB_PAYROLL[("payroll_batches")]
        DB_CLEARANCE[("exit_clearances")]
    end

    UI_TRIAGE --> TRIAGE_CALC
    UI_OVERRIDE_PANEL --> OVERRIDE_EXEC --> AUDIT_LOGGER --> DB_AUDIT
    UI_LEAVE_WIDGET --> DB_STAFF_LEAVES
    UI_PAYROLL_AUTH --> PAYROLL_SIGNER --> DB_PAYROLL
    PAYROLL_SIGNER --> AUDIT_LOGGER
    UI_TC_VAULT --> SEAL_SERVICE --> DB_CLEARANCE
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `admin_tasks` (`id` PK, `domain`, `title`, `status`, `assigned_to` FK, `escalated_to_principal`, `is_admin_override`, `admin_override_reason`)
  * `security_audit_trail` (`id` PK, `action_type`, `actor_id` FK, `actor_role`, `target_entity`, `target_id`, `sha256_seal`, `timestamp`)
  * `payroll_batches` (`id` PK, `payroll_month`, `total_staff_count`, `net_payable`, `status`, `authorized_by`, `authorized_at`)
  * `exit_clearances` (`id` PK, `student_id` FK, `library_cleared`, `finance_cleared`, `parent_otp_verified`, `principal_digital_seal`, `tc_serial_no`)

#### 4. End-to-End Workflow: Executive Admin Override on Disciplinary Leave & Attendance

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Principal / Super Admin
    participant UI as Admin Cockpit
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    participant AUDIT as Audit Trail Ledger
    actor Teacher as Class Teacher
    actor Parent as Parent Mobile

    Admin->>UI: Inspect Disputed Medical Leave (ID: #402)
    UI->>API: POST /api/v1/admin/leave-requests/402/override
    Note over API: Payload: decision='Approved', reason='Authorized by Hospital Medical Board'
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE leave_requests SET is_admin_override=TRUE, status='Approved', admin_notes='Board Medical Sanction'
    API->>DB: UPDATE attendance SET status='Leave', admin_override=TRUE, teacher_override=TRUE, override_by_role='ADMIN'
    API->>AUDIT: INSERT INTO security_audit_trail (action='LEAVE_ADMIN_OVERRIDE', sha256_seal=HMAC(...))
    API->>DB: COMMIT TRANSACTION
    API->>Teacher: WebSocket Alert: "Leave #402 Locked via Principal Override"
    API->>Parent: Push Notification: "Leave Request Approved by Principal Office"
    Note over Teacher,API: Teacher attempts to reject: Router rejects with HTTP 403 Forbidden
```

---

### Role 5: Exam Coordinator (`/exam_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Assessment Operations, Secrecy Vault & Examination Logistics Context*
* **Core Invariants:**
  1. Once the Exam Coordinator clicks **Verify & Lock Marks**, grade entries are frozen and teachers cannot edit scores.
  2. Report card batch compilation generates official CBSE-compliant marks memos with institutional headers and digital signatures.
  3. Exportable official CSV adheres directly to the CBSE Pariksha Sangam specification.
  4. **Atomic Batch Class Scheduling**: The Exam Coordinator schedules comprehensive exam timetables via `POST /api/exams/schedules/batch-class`. The engine tags slots with a unique `batch_id` (e.g. `BATCH-10AB-TERM1FINAL`), series name, and sets `schedule_type = 'BATCH'`.
  5. **Dynamic Hall & Invigilator Deployment**: Replaces all legacy static tables. Room allocation calculates seating density, room capacity limits, and assigns verified Chief Invigilators.
  6. **Inter-Coordinator Syllabus & Exam Synchronization Protocol**: The Exam Coordinator collaborates with the Academic Coordinator through `ExamSyncRequest` in `academic.py` to reconcile curriculum delivery lag against published board exam dates.

#### 2. Architecture Diagram

```mermaid
graph LR
    subgraph ExamDesk ["Exam Coordinator Portal (/exam_coordinator)"]
        UI_BATCH_SCHED["Batch Class Exam Timetable Allocator"]
        UI_MOD_LEDGER["Marks Moderation & Statistical Normalization Desk"]
        UI_LOC_GEN["CBSE Board LOC & Batch PDF Marks Memo Generator"]
        UI_SYNC_DESK["Inter-Coordinator Syllabus Sync Desk (ExamSyncRequest)"]
    end

    subgraph ExamCore ["Assessment Domain Engines"]
        BATCH_SCHED_ENG["Atomic Batch Examination Scheduler"]
        SEATING_ALG["Conflict-Free Seating & Room Allocator"]
        MOD_VALIDATOR["Statistical Grade Distribution & Outlier Detector"]
        PDF_BATCH_ENG["Deterministic PDF Marks Memo Compiler"]
        INTER_SYNC_ENG["Syllabus Pacing vs Exam Cut-Off Reconciler"]
    end

    subgraph ExamData ["Assessment Ledger"]
        DB_EXAMS[("exams & terms")]
        DB_SCHEDS[("exam_schedules (batch_id, series_name, schedule_type)")]
        DB_EXAM_SYNC[("exam_sync_requests")]
        DB_MOD[("exam_moderations")]
        DB_MARKS[("exam_marks")]
    end

    UI_BATCH_SCHED --> BATCH_SCHED_ENG --> DB_SCHEDS
    BATCH_SCHED_ENG --> SEATING_ALG --> DB_EXAMS
    UI_SYNC_DESK --> INTER_SYNC_ENG --> DB_EXAM_SYNC
    UI_MOD_LEDGER --> MOD_VALIDATOR --> DB_MOD
    UI_LOC_GEN --> PDF_BATCH_ENG --> DB_MARKS
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `exams` (`id` PK, `name`, `academic_year`, `term`, `start_date`, `end_date`, `is_published`)
  * `exam_schedules` (`id` PK, `exam_id` FK, `title`, `series_name`, `batch_id`, `schedule_type`, `subject`, `class_name`, `section`, `exam_date`, `start_time`, `end_time`, `hall_name`, `capacity`, `chief_invigilator_name`)
  * `exam_sync_requests` (`id` PK, `title`, `class_name`, `subject`, `curriculum_lag_units`, `current_completion_pct`, `proposed_resolution`, `status`)
  * `exam_marks` (`id` PK, `exam_id` FK, `student_id` FK, `subject_id` FK, `marks_obtained`, `max_marks`, `grade`, `is_locked`)
  * `exam_moderations` (`id` PK, `exam_id` FK, `subject_id` FK, `class_id` FK, `average_score`, `std_deviation`, `is_locked`, `locked_by` FK)

#### 4. End-to-End Workflow: Marks Moderation, Cryptographic Lock & LOC Export

```mermaid
sequenceDiagram
    autonumber
    actor Teachers as Subject Teachers
    actor ExamCoord as Exam Coordinator
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor Parent as Parent Portal
    actor Student as Student Portal

    Teachers->>API: POST /api/v1/teacher/exam-marks/submit (Term 1 Math)
    API->>DB: INSERT INTO exam_marks (status='Draft_Submitted')
    ExamCoord->>API: GET /api/v1/exam/moderation/stats?class_id=10
    API-->>ExamCoord: Return Mean, Standard Deviation, and Outlier Grade Flags
    ExamCoord->>API: POST /api/v1/exam/moderation/lock (class_id=10, subject="Math")
    API->>DB: UPDATE exam_marks SET is_locked=TRUE WHERE class_id=10 AND subject='Math'
    API->>DB: UPDATE exam_moderations SET is_locked=TRUE, locked_by=ExamCoord
    ExamCoord->>API: POST /api/v1/exam/generate-batch-report-cards (class_id=10)
    API-->>ExamCoord: Deliver 420 Verified Marks Memo PDFs
    ExamCoord->>API: GET /api/v1/exam/export-cbse-loc-csv
    API-->>ExamCoord: Download Official CBSE Pariksha Sangam CSV File
    API->>Parent: Unlock Digital Term Report Card in Moving Slider
    API->>Student: Unlock Hall Ticket for Next Examination Phase
```

---

### Role 6: Admissions Coordinator (`/admissions_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Student Outreach, Enrollment CRM & Atomic Identity Inception Context*
* **Core Invariants:**
  1. No online diagnostic test module required (handled through in-person campus evaluation).
  2. **Multi-Step Enrollment Handshake**: Enrolling an applicant utilizes `ConfirmEnrollmentModal`, validating guardian KYC documents, emergency contacts, roll number assignment, and fee category.
  3. **Atomic Multi-Aggregate Provisioning**: Converting an applicant to an enrolled student executes an atomic, single-pass database transaction initializing:
     * `Student` with unique official `admission_no` (`ADM-2026-XXXX`) and sequential roll number.
     * `User` authentication credentials for student and parent.
     * `FeeStructure` with all 5 statutory term milestones.
     * `AttendanceRecord` day-1 presence baseline.
     * `HallTicket` auto-released for scheduled class exams.
  4. **4-Role Notification Broadcast**: Dispatches concurrent welcome and roster notifications to the enrolled student, guardian, class teacher, and accounts coordinator.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AdmissionsDesk ["Admissions Coordinator Desk (/admissions_coordinator)"]
        UI_KANBAN["Applicant Pipeline Funnel (New -> Tour -> Cleared -> Enrolled)"]
        UI_TOURS["Campus Walk-In & Tour Schedule Desk"]
        UI_INQUIRY["AI Web Chatbot Lead Feed"]
        UI_ENROLL_MODAL["Multi-Step Confirm Enrollment Modal (Section & Fees)"]
    end

    subgraph AdmissionsServices ["Enrollment Services"]
        LEAD_ORCH["Kanban Lead Stage Transition Engine"]
        PROVISION_ENGINE["Atomic Multi-Table SIS Entity Generator"]
        NOTIF_BROADCAST["4-Role Welcome Notification Dispatcher"]
    end

    subgraph TargetSISSchema ["Core Relational Database"]
        DB_LEADS[("admissions_leads")]
        DB_STUDENTS[("students")]
        DB_USERS[("users (student & parent auth)")]
        DB_FEES[("fee_milestones (5 installments)")]
        DB_ATT[("attendance (day 1 baseline)")]
        DB_TICKETS[("exam_hall_tickets")]
    end

    UI_KANBAN & UI_TOURS & UI_INQUIRY --> LEAD_ORCH --> DB_LEADS
    UI_ENROLL_MODAL --> PROVISION_ENGINE
    PROVISION_ENGINE --> DB_STUDENTS & DB_USERS & DB_FEES & DB_ATT & DB_TICKETS
    PROVISION_ENGINE --> NOTIF_BROADCAST
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `admissions_leads` (`id` PK, `student_name`, `guardian_name`, `phone`, `email`, `stage`, `notes`, `campus_tour_date`)
  * `students` (`id` PK, `admission_no` UNIQUE, `roll_no`, `class_id` FK, `status='Active'`)
  * `users` (`id` PK, `username` UNIQUE, `email` UNIQUE, `role`, `password`, `school_code`)
  * `fee_milestones` (`id` PK, `student_id` FK, `term_name`, `due_amount`, `status='PENDING'`)
  * `attendance` (`id` PK, `student_id` FK, `date`, `status='Present'`, `method='baseline'`)
  * `exam_hall_tickets` (`id` PK, `student_id` FK, `ticket_number`, `is_released=True`)

#### 4. End-to-End Workflow: Lead Funnel Triage to Atomic SIS Conversion

```mermaid
sequenceDiagram
    autonumber
    actor ParentLead as Prospective Parent
    actor AdmCoord as Admissions Coordinator
    participant API as FastAPI Backend (admin.py)
    participant DB as PostgreSQL DB
    actor Teacher as Class Teacher
    actor Accounts as Accounts Coordinator

    ParentLead->>API: Submit Web Inquiry / Schedule Campus Walk-In
    API->>DB: INSERT INTO admissions_leads (stage='Campus_Tour_Scheduled')
    AdmCoord->>API: POST /api/v1/admissions/leads/{id}/stage-update
    Note over AdmCoord,API: Advances lead: Tour Completed -> Document Verified -> Fee Paid
    API->>DB: UPDATE admissions_leads SET stage='Fee_Paid'
    AdmCoord->>API: Open ConfirmEnrollmentModal -> POST /api/v1/admissions/convert-to-sis
    API->>DB: BEGIN ATOMIC TRANSACTION
    API->>DB: INSERT INTO students (admission_no='ADM-2026-1042', roll_no=14, class_id='Class 8-B')
    API->>DB: INSERT INTO users (student credentials + parent credentials)
    API->>DB: INSERT INTO fee_milestones (5 installments for Class 8)
    API->>DB: INSERT INTO attendance (status='Present' for Day 1 baseline)
    API->>DB: INSERT INTO exam_hall_tickets (auto-released ticket)
    API->>DB: UPDATE admissions_leads SET stage='Enrolled', converted_student_id=new_student.id
    API->>DB: COMMIT ATOMIC TRANSACTION
    API-->>AdmCoord: 200 OK (Dossier Printed & Confirmation CSV Exported)
    API->>Teacher: WebSocket Alert: "New Student Enrolled in Class 8-B: Roll #14"
    API->>Accounts: Notification: "New Student Enrolled: Class 8-B Fee Milestones Queued"
```

---

### Role 7: Accounts Coordinator (`/accounts_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Bursar Operations, Fee Realization & Staff Payroll Engine*
* **Core Invariants:**
  1. Defaulter aging calculations run continuously across three risk tiers (Tier 1: 0–15d, Tier 2: 16–30d, Tier 3: 30+d).
  2. **Hardened Counter Fee Collection**: `POST /api/finance/defaulters/{id}/pay` executes pessimistic row locking (`with_for_update()`). The payment amount must be greater than zero and **cannot exceed the current overdue balance** (cannot collect on a ₹0 balance). Automatically inserts an auto-reconciled transaction and marks linked student fee milestones as `Paid`.
  3. **Staff Payroll & Automated LOP Deductions**: When generating monthly staff payroll batches (`POST /api/finance/payroll/batches/generate`), the engine queries all approved `StaffPermission` records for the month. Any leave declared under `"Loss of Pay"` or `"Unpaid"` triggers automatic pro-rated deduction:
     $$\text{LOP Deduction} = \left(\frac{\text{Basic Salary}}{30}\right) \times \text{LOP Days}$$
  4. **Four-Eye Maker-Checker Workflow**: The Accounts Coordinator can only generate a draft payroll batch. The batch enters `Draft` status until executive authorization is signed by the Principal/Super Admin (`POST /api/finance/payroll/batches/{id}/authorize`). Only then can Accounts execute corporate bank disbursement wire (`Disbursed`).
  5. **Today Payments Real-Time Sync**: Shared reactive state via `fee-ledger.ts` synchronizes online parent payments and counter collections directly into the Accounts Coordinator's "Today Receipts" desk and "Online Bank Verification" tables without page reloads.

#### 2. Architecture Diagram

```mermaid
graph LR
    subgraph AccountsConsole ["Accounts Coordinator Portal (/accounts_coordinator)"]
        UI_AGING_GRID["3-Tier Fee Defaulter Aging Register (0-15d, 16-30d, 30+d)"]
        UI_COUNTER_POS["Counter Fee Collection Modal (Overdue Balance Cap)"]
        UI_PAYROLL_STUDIO["Staff Payroll Studio (LOP Salary Engine)"]
        UI_DISPATCH["1-Click WhatsApp & SMS Payment Link Dispatcher"]
        UI_RECON["Online Gateway & Counter UTR Reconciliation"]
    end

    subgraph AccountsEngines ["Bursar Processing Services"]
        AGING_CALC["Defaulter Aging Engine"]
        PAYROLL_ENG["Staff Salaries & Payroll Calculation Service"]
        COUNTER_COLLECT["Counter Fee Pessimistic Settlement Service"]
        BROADCAST_SVC["Batch Multi-Channel Communication Worker"]
        GATEWAY_RECON["Payment Gateway Webhook Ingestion Engine"]
    end

    subgraph AccountsLedgers ["Financial Database"]
        DB_FEE_LEDGER[("student_fee_ledger & fee_defaulters")]
        DB_RECEIPTS[("fee_receipts & payment_transactions")]
        DB_PAYROLL_BATCH[("payroll_batches (status: Draft, Authorized, Disbursed)")]
        DB_PAYSLIPS[("staff_payslips (lop_deduction, net_salary)")]
    end

    UI_AGING_GRID --> AGING_CALC --> DB_FEE_LEDGER
    UI_COUNTER_POS --> COUNTER_COLLECT --> DB_FEE_LEDGER & DB_RECEIPTS
    UI_PAYROLL_STUDIO --> PAYROLL_ENG --> DB_PAYROLL_BATCH & DB_PAYSLIPS
    UI_DISPATCH --> BROADCAST_SVC
    UI_RECON --> GATEWAY_RECON --> DB_FEE_LEDGER & DB_RECEIPTS
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `fee_structures` (`id` PK, `class_id` FK, `academic_year`, `total_tuition`, `lab_fee`, `sports_fee`)
  * `fee_defaulters` (`id` PK, `student_id` FK, `student_name`, `amount_due`, `status`, `payment_history_json`)
  * `payment_transactions` (`id` PK, `utr_number` UNIQUE, `amount`, `payment_method`, `reconciled`, `reconciled_by`)
  * `payroll_batches` (`id` PK, `payroll_month`, `total_staff_count`, `gross_salaries`, `total_deductions`, `net_payable`, `status`, `authorized_by`, `authorized_at`)
  * `staff_payslips` (`id` PK, `batch_id` FK, `staff_id` FK, `staff_name`, `basic_salary`, `hra_allowance`, `lop_deduction`, `provident_fund`, `professional_tax`, `tds_tax`, `total_deductions`, `net_salary`, `bank_account_no`, `bank_ifsc`)

#### 4. End-to-End Workflow: Staff Payroll Generation, LOP Deductions & Four-Eye Authorization

```mermaid
sequenceDiagram
    autonumber
    actor Accounts as Accounts Coordinator (Maker)
    participant API as FastAPI Backend (finance.py)
    participant DB as PostgreSQL DB
    actor Admin as Principal / Super Admin (Checker)
    actor Teacher as Staff Members

    Accounts->>API: POST /api/finance/payroll/batches/generate (payroll_month='November 2026')
    API->>DB: Query Active Staff Members & Base Salaries
    API->>DB: Query Approved staff_permissions WHERE leave_category LIKE '%Loss of Pay%'
    Note over API: Computes LOP Deduction for each teacher. Net = Gross - (PF + PT + TDS + LOP)
    API->>DB: INSERT INTO payroll_batches (status='Draft', net_payable=1480000.00)
    API->>DB: INSERT INTO staff_payslips (batch_id, staff_id, lop_deduction, net_salary)
    API->>Admin: High-Priority Notification ("Payroll Batch Draft Ready for Sign-Off")
    
    Admin->>API: POST /api/finance/payroll/batches/{id}/authorize (authorized_by='Dr. Sunita Kapoor')
    API->>DB: UPDATE payroll_batches SET status='Authorized', authorized_by='Dr. Sunita Kapoor'
    API->>Accounts: Notification ("Payroll Authorized. Corporate Bank Wire Unlocked")
    
    Accounts->>API: POST /api/finance/payroll/batches/{id}/disburse
    API->>DB: UPDATE payroll_batches SET status='Disbursed'
    API->>Teacher: In-App Notification ("Monthly Salary Slip Available for Download")
```

---

### Role 8: Academic Coordinator (`/academic_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Curriculum Surveillance, Pedagogical Auditing, PTM Logistics & Inter-Coordinator Alignment Context*
* **Core Invariants:**
  1. Period substitutions automatically filter faculty based on three mandatory conditions: teacher is present on campus (verified via `staff_attendance_daily`), has zero teaching periods assigned in that slot, and has not exceeded their daily proxy load cap.
  2. Curriculum pacing compares completed syllabus units against the statutory academic calendar; pacing deviations $>2$ chapters trigger automated remedial alerts to the Principal.
  3. **Faculty Leave Interlock**: Whenever a teacher's leave request (`staff_permissions`) is submitted or approved, the affected teaching periods automatically generate open `SubstitutionSlot` records in the Academic Coordinator's coverage dashboard.
  4. **Inter-Coordinator Syllabus & Exam Synchronization**: Coordinates curriculum completion cut-offs with the Exam Coordinator via `ExamSyncRequest` in `academic.py`.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AcadWorkspace ["Academic Coordinator Workspace (/academic_coordinator)"]
        UI_SUB_MATRIX["Period Vacancy & Substitution Allocation Matrix"]
        UI_PACING_RADAR["Curriculum Syllabus Pacing Tracker"]
        UI_FACULTY_ROSTER["Faculty Timetabled Workload & Directory"]
        UI_PTM_RADAR["PTM Event & Faculty Attendance Cockpit"]
        UI_EXAM_SYNC["Inter-Coordinator Exam & Syllabus Sync Desk"]
        UI_SLA_ESCALATE["Task SLA Governance & Escalate to Principal"]
    end

    subgraph AcadEngines ["Academic Coordination Services"]
        VACANCY_DETECT["Automated Period Vacancy Matcher"]
        PROXY_FILTER["Conflict-Free Faculty Availability Filter"]
        PACING_CALC["Syllabus Milestone Deviation Engine"]
        EXAM_SYNC_ENG["Inter-Coordinator Syllabus vs Exam Alignment Service"]
    end

    subgraph AcadData ["Operational Persistence"]
        DB_TIMETABLE[("timetables")]
        DB_SUBS[("substitution_slots")]
        DB_STAFF_LEAVES[("staff_permissions")]
        DB_STAFF_ATT[("staff_attendance_daily")]
        DB_EXAM_SYNC[("exam_sync_requests")]
        DB_SYLLABUS[("curriculum_milestones")]
    end

    UI_SUB_MATRIX --> VACANCY_DETECT --> PROXY_FILTER --> DB_SUBS
    DB_STAFF_LEAVES --> VACANCY_DETECT
    DB_STAFF_ATT --> PROXY_FILTER
    UI_PACING_RADAR --> PACING_CALC --> DB_SYLLABUS
    UI_EXAM_SYNC --> EXAM_SYNC_ENG --> DB_EXAM_SYNC
    UI_FACULTY_ROSTER --> DB_TIMETABLE
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `timetables` (`id` PK, `class_id` FK, `day_of_week`, `period_number`, `subject_id` FK, `teacher_id` FK, `room_number`)
  * `substitution_slots` (`id` PK, `date`, `period_number`, `class_id` FK, `absent_teacher_id` FK, `substitute_teacher_id` FK, `status`, `is_admin_override`)
  * `staff_permissions` (`id` PK, `staff_id` FK, `leave_category`, `affected_periods`, `status`)
  * `staff_attendance_daily` (`id` PK, `staff_id` FK, `attendance_date`, `status`)
  * `exam_sync_requests` (`id` PK, `title`, `class_name`, `subject`, `curriculum_lag_units`, `current_completion_pct`, `proposed_resolution`, `status`)
  * `curriculum_milestones` (`id` PK, `subject_id` FK, `class_id` FK, `expected_units_completed`, `actual_units_completed`, `variance_status`)

#### 4. End-to-End Workflow: Period Vacancy Detection & 1-Click Conflict-Free Substitution

```mermaid
sequenceDiagram
    autonumber
    actor TeacherA as Absent Teacher
    actor AcadCoord as Academic Coordinator
    participant API as FastAPI Backend (academic.py / admin.py)
    participant DB as PostgreSQL DB
    actor TeacherB as Available Substitute
    actor Students as Class Students

    TeacherA->>API: POST /api/v1/teacher/leaves/apply (Casual Leave Today, Periods: "P2, P3")
    API->>DB: INSERT INTO staff_permissions (leave_category='Casual Leave', affected_periods='P2, P3', status='Pending')
    API->>DB: INSERT INTO substitution_slots (status='PENDING', period=2, class_id='10-A')
    API->>AcadCoord: Push Alert: "Unmanned Class Alert: Period 2, Class 10-A (Mathematics)"
    AcadCoord->>API: GET /api/v1/admin/substitutions/available-faculty?period=2&date=Today
    API->>DB: Query Active Faculty (Cross-checks staff_attendance_daily='Present', 0 period clashes)
    DB-->>AcadCoord: Return Qualified Candidates (e.g., Dr. Suresh Babu - Math Dept)
    AcadCoord->>API: POST /api/v1/admin/substitutions/assign (slot_id=45, sub_id=12)
    API->>DB: UPDATE substitution_slots SET status='Assigned', substitute_teacher_id=12
    API->>TeacherB: Push Notification: "Assigned Proxy Coverage: Period 2, Class 10-A"
    API->>Students: Timetable Refresh: "Period 2 Mathematics: Substitute Dr. Suresh Babu"
```

---

## 4. Master Cross-Role Orchestration & Handshake Machine

```mermaid
stateDiagram-v2
    [*] --> Inactive

    state AdmissionsDesk {
        NewInquiry --> CampusTour
        CampusTour --> InPersonEvaluation
        InPersonEvaluation --> FeePaid
        FeePaid --> ConfirmEnrollmentModal: Counselor Review
        ConfirmEnrollmentModal --> SISPushed: Atomic Transaction
    }

    state OperationalLifeCycle {
        SISPushed --> DailyAttendance: Baseline Present
        DailyAttendance --> LiveWebRTCClass: 10-Min Telemetry
        DailyAttendance --> SickLeaveApplied: Parent Request
        SickLeaveApplied --> TeacherLeaveReview: Teacher Check
        TeacherLeaveReview --> AdminLeaveOverride: Principal Bypass (if disputed)
        
        LiveWebRTCClass --> SpeedGraderMarking: Homework Upload
        SpeedGraderMarking --> RemedialFocusTable: Score < 50%
        
        RemedialFocusTable --> BatchExamSchedule: Exam Coord Action
        BatchExamSchedule --> StudentAdmitCardReady: Dynamic DB Schedule
        StudentAdmitCardReady --> LiveExamProctorStage: Today + Live + Unsubmitted
        LiveExamProctorStage --> MarksModeration: Teacher Scores Entered
        MarksModeration --> BoardLOCExport: Exam Coord Lock
    }

    state FacultyAndPayrollCycle {
        TeacherLeaveApplied --> LeaveCategorized: CL, ML, OD, or LOP
        LeaveCategorized --> AdminDashboardPopUp: Principal Approval
        AdminDashboardPopUp --> VacancyCreated: Auto-Feeds Academic Coord
        AdminDashboardPopUp --> PayrollBatchGenerated: End of Month Run
        PayrollBatchGenerated --> LOPDeductionsComputed: (Basic/30)*LOP Days
        LOPDeductionsComputed --> FourEyePrincipalReview: High-Value Gate
        FourEyePrincipalReview --> CorporateWireDisbursed: Accounts Action
    }

    state FinancialCycle {
        SISPushed --> FeeInvoicing: 5 Milestones Seeded
        FeeInvoicing --> DefaulterAging: Milestone Overdue
        DefaulterAging --> ReminderBroadcast: 1-Click WhatsApp
        DefaulterAging --> CounterPaymentCollected: Balance Cap Validated
        DefaulterAging --> OnlinePaymentSettled: Authentic 29x29 UPI QR
        CounterPaymentCollected --> FeeSettled: Webhook UTR Lock
        OnlinePaymentSettled --> FeeSettled: Today Receipts & Admin Gauges Synchronized
    }

    state ExitClearance {
        StudentExitInitiated --> LibraryClearance
        StudentExitInitiated --> AccountsClearance
        LibraryClearance --> DualSignChecked
        AccountsClearance --> DualSignChecked
        DualSignChecked --> PrincipalSealedTC: Digital Seal Applied
    }

    Inactive --> AdmissionsDesk: Lead Capture
    AdmissionsDesk --> OperationalLifeCycle
    AdmissionsDesk --> FinancialCycle
    OperationalLifeCycle --> FacultyAndPayrollCycle
    OperationalLifeCycle --> ExitClearance: Withdrawal Request
    FinancialCycle --> ExitClearance
    PrincipalSealedTC --> [*]: Archived in Vault
```

---

## 5. Architectural Decision Records (ADRs 001 – 010)

### ADR-001: Hierarchical Administrative Override Engine
* **Status:** Accepted
* **Context:** Fragmented operations in school environments lead to deadlocks when frontline staff reject legitimate emergency leaves or fail to resolve departmental tasks past statutory board deadlines.
* **Decision:** Introduce a cross-cutting administrative override model (`is_admin_override`, `admin_override_reason`, `override_by_role`) across tasks, leaves, attendance registers, and marksheets. Setting this flag locks the record against downstream reversal by teachers or coordinators (returning `HTTP 403 Forbidden`) and writes a SHA-256 sealed audit entry to `security_audit_trail`.
* **Consequences:** Eliminates operational gridlock and guarantees statutory authority; requires validation interceptors in all mutation routers.

### ADR-002: Pessimistic Row Locking (`SELECT ... FOR UPDATE`) for Contended School Resources
* **Status:** Accepted
* **Context:** Parent-Teacher Meeting (PTM) booking releases and fee installment balance payments create high concurrency windows where optimistic locking results in unacceptable retry cascades and double-bookings.
* **Decision:** Enforce pessimistic database row locking using `SELECT ... FOR UPDATE` in SQLAlchemy Async for PTM slot allocation (with a 5-minute temporary `HELD` lease) and student fee balance deductions.
* **Consequences:** Guarantees zero double-booking and payment ledger duplicate writes; requires query timeouts ($< 5000\text{ms}$) to prevent database pool exhaustion.

### ADR-003: Two-Phase Dual-Signature Exit Authorization (Digital OTP + Physical Seal)
* **Status:** Accepted
* **Context:** Student transfers (Transfer Certificate issuance) expose schools to legal disputes if certificates are released while library books, laboratory apparatus, or tuition fees remain outstanding.
* **Decision:** Exit clearance enforces an asynchronous two-phase gate: Phase 1 requires verified boolean sign-offs from both Library and Accounts departments; Phase 2 requires digital OTP acceptance from the parent before the Principal applies the school's digital seal.
* **Consequences:** Eliminates institutional liability; slightly increases transfer completion time from 1 hour to 24 hours.

### ADR-004: Decoupled WebRTC Telemetry Webhook Processing for Attendance
* **Status:** Accepted
* **Context:** Synchronous database insertion for hundreds of concurrent live class attendees joining simultaneously during morning peak hours caused database write-lock spikes.
* **Decision:** LiveKit participant connection telemetry webhooks are ingested asynchronously by a dedicated background telemetry worker. The worker buffers presence heartbeats, applies the 10-minute active attendance rule, and flushes updates to PostgreSQL in batched windows.
* **Consequences:** Decouples video conferencing performance from database persistence; introduces a minor 30- to 60-second eventual consistency window for parent attendance push notifications.

### ADR-005: Four-Eye Principle (Separation of Duties) for Institutional Payroll & Capital Outflows
* **Status:** Accepted
* **Context:** Unilateral payroll generation and disbursement by accounting personnel creates severe financial fraud, miscalculation risk, and audit exposure.
* **Decision:** Enforce a strict Maker-Checker architectural boundary. The Accounts Coordinator functions as the **Maker** (`status='Draft'`), computing pro-rated Loss of Pay (LOP) deductions from approved `StaffPermission` leaves, PF, PT, and TDS. The Super Admin / Principal functions as the **Checker** (`status='Authorized'`), inspecting financial totals and issuing cryptographic sign-off. Only after Principal authorization can the Accounts Officer trigger the bank disbursement wire (`status='Disbursed'`).
* **Consequences:** Fully satisfies corporate governance and statutory financial compliance standards; prevents unauthorized salary disbursements while maintaining complete audit traceability.

### ADR-006: Atomic Batch Examination Scheduling & Dynamic Admit Card Delivery
* **Status:** Accepted
* **Context:** Scheduling individual subject exams manually led to fragmented timetable tables, missing room capacity validations, and hardcoded mock student admit cards that failed to reflect changes in hall allocations or chief invigilators.
* **Decision:** Implement atomic batch scheduling (`POST /api/exams/schedules/batch-class`) tagging slots with unique `batch_id`, series metadata, and `schedule_type = 'BATCH'`. Student admit cards query live database schedules chronologically (`GET /api/student/exam-schedules`), dynamically rendering seat codes, hall invigilator seals, and timetable matrices.
* **Consequences:** Eliminates hardcoded client artifacts; guarantees that schedule adjustments made by the Exam Coordinator propagate instantly to Student and Parent portals.

### ADR-007: Real-Time Dynamic Timetable Lifecycle Driven by ClockProvider
* **Status:** Accepted
* **Context:** Disconnect between client device wall-clock time and school instructional periods caused premature class terminations, incorrect attendance tardiness marks, and out-of-sync proctored examinations.
* **Decision:** Bind all period lifecycles and exam mountings to a centralized `ClockProvider` service synchronized via client hooks running on 30-second heartbeats. Timetable periods transition autonomously through `upcoming`, `live`, and `completed`, illuminating active WebRTC broadcaster and viewer stages only during valid period intervals.
* **Consequences:** Creates a deterministic, testable simulation environment where academic schedules operate reliably across global timezones and daylight savings shifts.

### ADR-008: Reactive Client-Side Fee Ledger Sync with PostgreSQL Consistency
* **Status:** Accepted
* **Context:** Operating across three separate client portals (Parent payment $\to$ Accounts cashier $\to$ Admin vital gauges) caused temporal display discrepancies when relying solely on periodic polling.
* **Decision:** Implement a dual-layer synchronization model: FastAPI persists transactions to PostgreSQL using pessimistic row locks (`with_for_update()`), while client portals utilize a synchronized shared bus (`fee-ledger.ts`) that broadcasts immediate optimistic state updates upon receipt confirmation.
* **Consequences:** Guarantees zero lag across the Admin, Parent, and Accounts interfaces while maintaining ACID transaction guarantees on the database.

### ADR-009: Atomic Multi-Aggregate SIS Provisioning on Lead Conversion
* **Context:** Separate creation of student profiles, user credentials, fee invoices, and attendance records led to orphan records and incomplete student setups when network or validation errors occurred mid-process.
* **Decision:** All enrollment artifacts (`Student`, `Parent`, `User` credentials, `FeeMilestones`, `AttendanceRecord`, `HallTicket`) are generated within a single, atomic database transaction in `convert_enquiry_to_student`. Any validation failure triggers an automatic rollback of all entities.
* **Consequences:** Guarantees that every student in the system possesses a complete, functional profile with working login credentials, active class rosters, and fee schedules from Day 1.

### ADR-010: Inter-Coordinator Alignment Protocol for Curriculum & Exam Feasibility
* **Context:** Disconnect between the Academic Coordinator's syllabus delivery pace and the Exam Coordinator's scheduled examination dates resulted in students being tested on untaught topics.
* **Decision:** Introduce a dedicated inter-coordinator contract (`ExamSyncRequest`) in `academic.py`. When curriculum delivery lags behind schedule by $>1$ unit, the Academic Coordinator dispatches a formal adjustment request, requiring the Exam Coordinator to either adjust the question blueprint or reschedule the assessment date, with escalation to the Principal if unaligned within 48 hours.
* **Consequences:** Enforces pedagogical integrity and fair student assessments through an auditable inter-departmental negotiation protocol.

---

## 6. Verification & Port Access Matrix

| Role | Portal Route | Primary Test Procedure | Expected System Outcome |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `http://localhost:3000/admin` | Inspect staff leave pop-up; authorize pending monthly payroll batch; verify fee gauge sync. | Approves teacher LOP leave; signs off payroll batch; admin collection tiles update reactively upon parent payment. |
| **Academic Coord** | `http://localhost:3000/academic_coordinator` | Open **Period Substitutions** after teacher leave submission; dispatch `ExamSyncRequest`. | Vacant period appears automatically; available faculty query cross-checks `staff_attendance_daily`; exam sync alert reaches Exam Coordinator. |
| **Exam Coord** | `http://localhost:3000/exam_coordinator` | Create batch exam schedule for Class 10 ("Term 1 Finals", 5 slots); review syllabus sync. | Atomic creation assigns `batch_id`; dynamic admit cards become immediately queryable by students in Class 10. |
| **Accounts Coord** | `http://localhost:3000/accounts_coordinator` | Generate payroll batch; test counter fee payment on defaulter. | Computes LOP salary deductions automatically; counter fee payment caps payment at balance due and updates student fee milestone. |
| **Admissions Coord**| `http://localhost:3000/admissions_coordinator` | Advance lead to `Fee Paid`; open `ConfirmEnrollmentModal`. | Atomic single-pass transaction seeds student profile, roll number, parent account, Day 1 attendance, hall ticket, and 5 fee milestones. |
| **Teacher** | `http://localhost:3000/teacher` | Apply for 3-day Unpaid Leave (LOP); inspect class roster for new admissions; check daily attendance. | `staff_permissions` records `leave_category='Unpaid LOP'`; newly enrolled student appears on class register; daily check-in logs timestamp. |
| **Secondary Student**| `http://localhost:3000/student` | Verify dynamic admit card and period status ticker; test live exam mount. | Hall ticket renders Chief Invigilator and seat code; periods evaluate dynamically (`completed`/`live`/`upcoming`); live exam mounts only when scheduled today and live. |
| **Parent** | `http://localhost:3000/parent` | Pay fee milestone with Authentic 29x29 UPI QR; reserve dynamic PTM slot. | Milestone reflects immediate transition to `Paid`; fee defaulter cleared; PTM slot locks with 5-minute timer; Admin and Accounts update in real-time. |
