# EDU360 Master System Architecture & Role-Wise Workflow Specification
**Enterprise Cloud-Native Institutional Management, WebRTC Live Education & Unified SIS Ecosystem**  
**Document Classification:** Production Architectural Baseline (v8.2)  
**Authors:** Principal Software Architect (`/Software Architect`) & Lead Technical Documentation Architect (`/Technical Writer`)  
**Scope:** The 8 Canonical Roles (Excluding Junior K–5 as specified) + Administrative Override Governance Engine

---

## 1. System Topology & Macro Architecture

EDU360 operates as a **modular monolith** with domain-driven bounded contexts. The system runs an asynchronous **FastAPI (Python 3.11+)** ASGI service, a **Next.js 14/16 (React 18/19 SSR/Client)** multi-portal frontend, a **PostgreSQL 15+** transactional relational store with asynchronous connection pooling via `asyncpg`, a distributed **LiveKit WebRTC** cluster for live video classroom instruction, and an S3-compatible encrypted **Object Vault** for homework and document compliance records.

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

    subgraph GatewayTier ["Security, Ingress & ASGI Middleware"]
        INGRESS["FastAPI ASGI Gateway / Reverse Proxy (:8000)"]
        AUTH_RBAC["Cryptographic RBAC Guard<br/>(HMAC-SHA256 Token + Scoped Headers)"]
        CLOCK["Centralized ClockProvider<br/>(Deterministic Time & Simulation Overrides)"]
    end

    subgraph ServiceEngines ["Domain Services & Business Logic Engines"]
        OVERRIDE_ENG["Administrative Override & Governance Engine"]
        LIVEKIT_WORKER["LiveKit WebRTC Telemetry & 10-Min Auto-Attendance Worker"]
        SPEEDGRADER_ENG["SpeedGrader Engine & Gemini OCR Multimodal Worker"]
        CONCURRENCY_MGR["Pessimistic Concurrency Manager (SELECT ... FOR UPDATE)"]
        SUB_MATCHER["Conflict-Free Substitution & Workload Balance Matcher"]
        EXIT_CLEARANCE["Dual-Signature Exit & Vault Sealing Engine"]
        FEE_AGING["3-Tier Fee Aging & Automated Broadcast Engine"]
        MODERATION_LEDGER["Assessment Normalization & Secrecy Vault Engine"]
    end

    subgraph PersistenceTier ["Data Persistence, Compliance & Storage Layer"]
        PG_MASTER[("PostgreSQL 15+ Primary Schema<br/>(Transactional ACID Engine)")]
        AUDIT_CHAIN[("Append-Only Security Audit Ledger<br/>(SHA-256 Cryptographic Seals)")]
        S3_VAULT[("Encrypted Asset & Document Vault<br/>(S3 / MinIO Object Storage)")]
    end

    UI_ADMIN & UI_ACAD & UI_EXAM & UI_ACC & UI_ADM & UI_TEACH & UI_STUD & UI_PAR --> INGRESS
    INGRESS --> AUTH_RBAC
    AUTH_RBAC --> CLOCK
    CLOCK --> OVERRIDE_ENG & LIVEKIT_WORKER & SPEEDGRADER_ENG & CONCURRENCY_MGR & SUB_MATCHER & EXIT_CLEARANCE & FEE_AGING & MODERATION_LEDGER

    OVERRIDE_ENG --> AUDIT_CHAIN
    OVERRIDE_ENG & LIVEKIT_WORKER & SPEEDGRADER_ENG & CONCURRENCY_MGR & SUB_MATCHER & EXIT_CLEARANCE & FEE_AGING & MODERATION_LEDGER --> PG_MASTER
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
* **Bounded Context:** *Pedagogical Delivery & Assessment Context*
* **Core Invariants:**
  1. A teacher can only grade submissions for sections and subjects explicitly mapped to them in `teacher_assignments`.
  2. The teacher cannot overturn an active Principal Administrative Override on student leaves or attendance.
  3. AI-suggested scores (via Gemini OCR) are strictly recommendations; **the teacher retains final evaluation authority** and must explicitly verify and commit grades.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph TeacherWorkspace ["Teacher Presentation Workspace (/teacher)"]
        UI_LIVE_STUDIO["Live Lecture Studio (Broadcaster Stage)"]
        UI_SPEEDGRADER["2-Pane SpeedGrader Studio (PDF/OCR Canvas)"]
        UI_ATT_REGISTER["Bulk Attendance Register (P/A/L/E Fastkeys)"]
        UI_LEAVE_DESK["Student Leave & Sick Note Desk"]
        UI_FOCUS_TABLE["1-Week Shared Focus Table Generator"]
    end

    subgraph TeacherServices ["FastAPI Teacher Application Services"]
        ROOM_MGR["LiveKit Room Management Service"]
        GRADING_ENG["Rubric & Annotation Evaluation Service"]
        GEMINI_OCR["Gemini Multimodal OCR Ingestion Worker"]
        ATT_RECON["Attendance Register Reconciliation Service"]
    end

    subgraph TeacherEntities ["Database Aggregates & Entities"]
        TBL_ROOMS[("rooms")]
        TBL_HW_SUB[("homework_submissions")]
        TBL_ATT[("attendance")]
        TBL_FOCUS[("student_focus_tables")]
    end

    UI_LIVE_STUDIO --> ROOM_MGR --> TBL_ROOMS
    UI_SPEEDGRADER --> GEMINI_OCR --> GRADING_ENG --> TBL_HW_SUB
    UI_ATT_REGISTER --> ATT_RECON --> TBL_ATT
    UI_LEAVE_DESK --> ATT_RECON
    UI_FOCUS_TABLE --> TBL_FOCUS
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `teachers` (`id` PK, `user_id` FK, `department`, `max_daily_periods`)
  * `homework_submissions` (`id` PK, `homework_id` FK, `student_id` FK, `file_url`, `score`, `teacher_feedback`, `status`, `annotated_pdf_url`)
  * `attendance` (`id` PK, `student_id` FK, `date`, `status`, `method`, `minutes_late`, `teacher_override`, `admin_override`, `override_by_role`)
  * `student_focus_tables` (`id` PK, `student_id` FK, `weak_subjects`, `target_goals`, `teacher_id` FK, `parent_acknowledged`)

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
* **Bounded Context:** *Learning Execution & Academic Portfolio Context*
* **Core Invariants:**
  1. Multi-tab concurrent homework submissions are locked via pessimistic transaction row locks (`SELECT ... FOR UPDATE`).
  2. Submissions uploaded after 05:00 PM are rejected unless a medical excuse exists.
  3. Student attendance is verified deterministically through LiveKit WebRTC connection telemetry ($T \ge 10\text{ mins}$).

#### 2. Architecture Diagram

```mermaid
graph LR
    subgraph StudentUI ["Secondary Student Cockpit (/student)"]
        UI_STAGE["LiveKit Video Stage & Active Speaker Spotlight"]
        UI_VAULT["Homework Camera Capture & Multi-PDF Vault"]
        UI_HALL["Hall Ticket & Admit Card Download Desk"]
        UI_PORTFOLIO["Side-by-Side Participations & Achievements"]
    end

    subgraph StudentPorts ["Application Services"]
        MEDIA_CONSUMER["WebRTC Media Ingestion Port"]
        VAULT_LOCKER["Pessimistic Submission Handler (FOR UPDATE)"]
        TICKET_GEN["Hall Ticket Stamping Service"]
    end

    subgraph StudentStorage ["Persistence"]
        DB_STU_SUB[("homework_submissions")]
        DB_HALL_TICKETS[("exam_hall_tickets")]
        S3_HOMEWORK[("s3://student-homework-vault")]
    end

    UI_STAGE --> MEDIA_CONSUMER
    UI_VAULT --> VAULT_LOCKER --> DB_STU_SUB
    VAULT_LOCKER --> S3_HOMEWORK
    UI_HALL --> TICKET_GEN --> DB_HALL_TICKETS
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `students` (`id` PK, `admission_no` UNIQUE, `roll_no`, `class_id` FK, `status`, `health_flags`)
  * `homework_submissions` (`id` PK, `homework_id` FK, `student_id` FK, `submitted_at`, `status`, `sha256_hash`)
  * `exam_hall_tickets` (`id` PK, `student_id` FK, `exam_id` FK, `qr_code_hash`, `issued_at`, `is_unlocked`)

#### 4. End-to-End Workflow: Live Video Learning & Telemetry Auto-Attendance

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student
    participant UI as Student Web Portal
    participant API as FastAPI Backend
    participant LK as LiveKit WebRTC Server
    participant DB as PostgreSQL DB
    actor Parent as Parent Mobile

    Student->>UI: Click "Join Live Class" (Class 10-A, Period 1)
    UI->>API: GET /api/v1/livekit/join-token?room=room_10A_period1
    API->>LK: Issue Scoped Viewer Token
    LK-->>UI: Return JWT Token; Client Establishes WebRTC PeerConnection
    Note over LK,API: Webhook: participant_joined (Record Join Timestamp T0)
    Note over Student,LK: Student stays connected in class
    LK->>API: Webhook (Duration Telemetry >= 10 minutes)
    API->>DB: INSERT INTO attendance (status='Present', method='auto_livekit', minutes_late=0)
    Teacher->>API: Conclude Period Class
    API->>DB: UPDATE student_dossier SET total_class_hours = total_class_hours + duration
    API->>Parent: Push Notification: "Attendance Confirmed: Physics 10-A"
```

---

### Role 3: Parent Portal (`/parent`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Guardian Oversight & Family Engagement Context*
* **Core Invariants:**
  1. Anti-spam delivery: Push alerts are restricted to urgent items; routine announcements are displayed exclusively on the **Moving Slider Banners**.
  2. PTM slot reservations use pessimistic row locking with a 5-minute temporary hold to prevent double-booking.
  3. Parent fee cashier supports instant dummy QR/UPI, NetBanking, and credit card interfaces with real-time UTR transaction settlement.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph ParentApp ["Parent Mobile-First Portal (/parent)"]
        UI_SLIDER["Anti-Spam Moving Slider Carousel"]
        UI_CASHIER["Digital Cashier (Dummy QR / UPI / NetBanking)"]
        UI_PTM["PTM Booking Slot Grid (5-Min Countdown)"]
        UI_LEAVE["Leave & Medical Excuse Uploader"]
        UI_RADAR["Live School Bus GPS Radar"]
    end

    subgraph ParentServices ["Backend Gateway Handlers"]
        SLIDER_SVC["Daily Notice Aggregator"]
        PAYMENT_RECON["Payment Gateway Webhook Reconciler"]
        PTM_PESSIMISTIC["Pessimistic Hold Engine (SELECT FOR UPDATE)"]
        LEAVE_ROUTER["Leave Workflow Ingestion Service"]
    end

    subgraph ParentTables ["Relational Models"]
        TBL_FEES[("fee_milestones & receipts")]
        TBL_PTM[("ptm_slots")]
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
  * `ptm_slots` (`id` PK, `teacher_id` FK, `slot_start`, `slot_end`, `status`, `held_by_parent_id` FK, `expires_at`, `agenda`)
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
    API->>DB: UPDATE ptm_slots SET status='HELD', held_by=Parent, expires_at=NOW()+5m
    DB-->>Parent: 200 OK (Starts 5-Minute Reservation Bar)
    Parent->>API: POST /api/v1/parent/ptm/slots/confirm (agenda="Math Remedial Plan")
    API->>DB: UPDATE ptm_slots SET status='BOOKED'
    API->>Teacher: WebSocket: "New PTM Confirmed with Parent @ 10:15 AM"
    Parent->>API: POST /api/v1/parent/fees/pay (milestone_id=2, method='UPI_QR')
    API->>PG: Generate Dynamic Merchant QR Payload
    PG-->>Parent: Display In-App QR Code & UPI Intent Link
    Parent->>PG: Complete UPI Payment via PhonePe/GPay
    PG->>API: Webhook: payment.captured (UTR: UTR982348123)
    API->>DB: UPDATE fee_milestones SET status='PAID', utr_number='UTR982348123'
    API-->>Parent: Deliver Timestamped PDF Fee Tax Receipt
```

---

### Role 4: Super Admin / Principal Console (`/admin`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Institutional Supervision & Governance Context*
* **Core Invariants:**
  1. Priority Triage Cockpit (🔴 Red / 🟠 Orange / 🟢 Green) auto-updates every 60 seconds; students with approved leaves are excluded from unexcused absence red flags.
  2. Administrative Overrides are cryptographically stamped with SHA-256 seals.
  3. Student Exit Certificates (TC) require a dual-signature handshake (Library + Accounts clearance) followed by Principal digital seal verification.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AdminConsole ["Principal Executive Console (/admin)"]
        UI_TRIAGE["Priority Triage Cockpit (Red / Orange / Green)"]
        UI_OVERRIDE_PANEL["Administrative Override Control Center"]
        UI_TASK_COCKPIT["Institutional Task Delegation & Escalation Deck"]
        UI_TC_VAULT["Dual-Signature TC Clearance & Vault Desk"]
        UI_ROLLOVER_ENG["Annual Class Promotion & Rollover Pipeline"]
    end

    subgraph AdminEngines ["Governance Engines"]
        TRIAGE_CALC["Triage Health Calculator Worker"]
        OVERRIDE_EXEC["Admin Override Routing Controller"]
        SEAL_SERVICE["Cryptographic Certificate Sealing Engine"]
        AUDIT_LOGGER["SHA-256 Immutability Audit Logger"]
    end

    subgraph AdminLedgers ["Master Ledgers"]
        DB_AUDIT[("security_audit_trail")]
        DB_TASKS[("admin_tasks")]
        DB_CLEARANCE[("exit_clearances")]
    end

    UI_TRIAGE --> TRIAGE_CALC
    UI_OVERRIDE_PANEL --> OVERRIDE_EXEC --> AUDIT_LOGGER --> DB_AUDIT
    UI_TASK_COCKPIT --> DB_TASKS
    UI_TC_VAULT --> SEAL_SERVICE --> DB_CLEARANCE
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `admin_tasks` (`id` PK, `domain`, `title`, `status`, `assigned_to` FK, `escalated_to_principal`, `is_admin_override`, `admin_override_reason`)
  * `security_audit_trail` (`id` PK, `action_type`, `actor_id` FK, `actor_role`, `target_entity`, `target_id`, `sha256_seal`, `timestamp`)
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
* **Bounded Context:** *Assessment Operations & Secrecy Context*
* **Core Invariants:**
  1. Once the Exam Coordinator clicks **Verify & Lock Marks**, grade entries are frozen and teachers cannot edit scores.
  2. Report card batch compilation generates official CBSE-compliant marks memos with institutional headers and digital signatures.
  3. Exportable official CSV adheres directly to the CBSE Pariksha Sangam specification.

#### 2. Architecture Diagram

```mermaid
graph LR
    subgraph ExamDesk ["Exam Coordinator Portal (/exam_coordinator)"]
        UI_SCHED_GRID["Master Exam Timetable & Seating Allocator"]
        UI_MOD_LEDGER["Marks Moderation & Statistical Normalization Desk"]
        UI_LOC_GEN["CBSE Board LOC & Batch PDF Marks Memo Generator"]
    end

    subgraph ExamCore ["Assessment Domain Engines"]
        SEATING_ALG["Conflict-Free Seating & Room Allocator"]
        MOD_VALIDATOR["Statistical Grade Distribution & Outlier Detector"]
        PDF_BATCH_ENG["Deterministic PDF Marks Memo Compiler"]
    end

    subgraph ExamData ["Assessment Ledger"]
        DB_EXAMS[("exams & terms")]
        DB_MOD[("exam_moderations")]
        DB_MARKS[("exam_marks")]
    end

    UI_SCHED_GRID --> SEATING_ALG --> DB_EXAMS
    UI_MOD_LEDGER --> MOD_VALIDATOR --> DB_MOD
    UI_LOC_GEN --> PDF_BATCH_ENG --> DB_MARKS
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `exams` (`id` PK, `name`, `academic_year`, `term`, `start_date`, `end_date`, `is_published`)
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
* **Bounded Context:** *Student Enrollment & CRM Pipeline Context*
* **Core Invariants:**
  1. No online diagnostic test module required (handled through in-person campus evaluation).
  2. Converting an applicant to an enrolled student executes an atomic, single-pass database transaction initializing SIS profile, roll number, fee milestones, and class rosters.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AdmissionsDesk ["Admissions Coordinator Desk (/admissions_coordinator)"]
        UI_KANBAN["Applicant Pipeline Funnel (New -> Tour -> Cleared -> Enrolled)"]
        UI_TOURS["Campus Walk-In & Tour Schedule Desk"]
        UI_INQUIRY["AI Web Chatbot Lead Feed"]
        UI_CONVERT["1-Click SIS Student Provisioner"]
    end

    subgraph AdmissionsServices ["Enrollment Services"]
        LEAD_ORCH["Kanban Lead Stage Transition Engine"]
        PROVISION_ENGINE["Atomic Multi-Table SIS Entity Generator"]
    end

    subgraph TargetSISSchema ["Core Relational Database"]
        DB_LEADS[("admissions_leads")]
        DB_STUDENTS[("students")]
        DB_PARENTS[("parents")]
        DB_FEES[("fee_milestones")]
    end

    UI_KANBAN & UI_TOURS & UI_INQUIRY --> LEAD_ORCH --> DB_LEADS
    UI_CONVERT --> PROVISION_ENGINE
    PROVISION_ENGINE --> DB_STUDENTS & DB_PARENTS & DB_FEES
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `admissions_leads` (`id` PK, `student_name`, `guardian_name`, `phone`, `email`, `stage`, `notes`, `campus_tour_date`)
  * `students` (`id` PK, `admission_no` UNIQUE, `roll_no`, `class_id` FK, `status='Active'`)
  * `fee_milestones` (`id` PK, `student_id` FK, `term_name`, `due_amount`, `status='PENDING'`)

#### 4. End-to-End Workflow: Lead Funnel Triage to Atomic SIS Conversion

```mermaid
sequenceDiagram
    autonumber
    actor ParentLead as Prospective Parent
    actor AdmCoord as Admissions Coordinator
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor Teacher as Class Teacher

    ParentLead->>API: Submit Web Inquiry / Schedule Campus Walk-In
    API->>DB: INSERT INTO admissions_leads (stage='Campus_Tour_Scheduled')
    AdmCoord->>API: POST /api/v1/admissions/leads/{id}/stage-update
    Note over AdmCoord,API: Advances lead: Tour Completed -> Document Verified -> Fee Paid
    API->>DB: UPDATE admissions_leads SET stage='Fee_Paid'
    AdmCoord->>API: POST /api/v1/admissions/convert-to-sis (lead_id=142, class_id="10-A")
    API->>DB: BEGIN ATOMIC TRANSACTION
    API->>DB: INSERT INTO students (admission_no='ADM-2026-1042', class_id='10-A')
    API->>DB: INSERT INTO parents (linked_student_id=new_student.id)
    API->>DB: INSERT INTO fee_milestones (Term 1 & Term 2 Tuition Dues)
    API->>DB: UPDATE admissions_leads SET stage='Enrolled', converted_student_id=new_student.id
    API->>DB: COMMIT ATOMIC TRANSACTION
    API-->>AdmCoord: 200 OK (Dossier Printed & Confirmation CSV Exported)
    API->>Teacher: WebSocket Alert: "New Student Enrolled in Class 10-A: Roll #42"
```

---

### Role 7: Accounts Coordinator (`/accounts_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Bursar Operations & Fee Realization Context*
* **Core Invariants:**
  1. Defaulter aging calculations run continuously across three risk tiers (Tier 1: 0–15d, Tier 2: 16–30d, Tier 3: 30+d).
  2. Counter fee payments require a unique, non-null bank UTR number to prevent reconciliation leaks.
  3. Digital receipts are cryptographically sealed with a SHA-256 hash immediately upon transaction capture.

#### 2. Architecture Diagram

```mermaid
graph LR
    subgraph AccountsConsole ["Accounts Coordinator Portal (/accounts_coordinator)"]
        UI_AGING_GRID["3-Tier Fee Defaulter Aging Register (0-15d, 16-30d, 30+d)"]
        UI_DISPATCH["1-Click WhatsApp & SMS Payment Link Dispatcher"]
        UI_RECON["Online Gateway & Counter UTR Reconciliation"]
        UI_MILESTONES["Term Milestone Schedule & Fee Structure Modeling"]
    end

    subgraph AccountsEngines ["Bursar Processing Services"]
        AGING_CALC["Defaulter Aging Engine"]
        BROADCAST_SVC["Batch Multi-Channel Communication Worker"]
        GATEWAY_RECON["Payment Gateway Webhook Ingestion Engine"]
    end

    subgraph AccountsLedgers ["Financial Database"]
        DB_FEE_LEDGER[("student_fee_ledger")]
        DB_RECEIPTS[("fee_receipts")]
    end

    UI_AGING_GRID --> AGING_CALC --> DB_FEE_LEDGER
    UI_DISPATCH --> BROADCAST_SVC
    UI_RECON --> GATEWAY_RECON --> DB_FEE_LEDGER & DB_RECEIPTS
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `fee_structures` (`id` PK, `class_id` FK, `academic_year`, `total_tuition`, `lab_fee`, `sports_fee`)
  * `fee_milestones` (`id` PK, `student_id` FK, `term_number`, `due_date`, `due_amount`, `paid_amount`, `status`, `concession_amount`, `is_admin_override`)
  * `fee_receipts` (`id` PK, `milestone_id` FK, `utr_number` UNIQUE, `payment_mode`, `amount_paid`, `sha256_hash`, `issued_at`)

#### 4. End-to-End Workflow: 3-Tier Aging Audit, 1-Click Reminder & UTR Reconciliation

```mermaid
sequenceDiagram
    autonumber
    actor AccCoord as Accounts Coordinator
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor Parent as Parent Mobile
    participant PG as Payment Gateway (Razorpay/Stripe)

    AccCoord->>API: GET /api/v1/accounts/defaulters/aging
    API->>DB: Query Overdue Balances Categorized by Days Past Due
    DB-->>AccCoord: Render Aging Register (Tier 1: 18, Tier 2: 7, Tier 3: 3 Defaulters)
    AccCoord->>API: POST /api/v1/accounts/reminders/dispatch-batch (target_tier="Tier_3")
    API->>Parent: Push Notification + WhatsApp ("Fee Milestone 2 Overdue - Click to Pay")
    Parent->>PG: Complete Payment via UPI Intent / NetBanking
    PG->>API: Webhook: payment.captured (payload: {utr: 'UTR7721831', amount: 35000})
    API->>DB: SELECT * FROM fee_milestones WHERE id=:id FOR UPDATE
    API->>DB: UPDATE fee_milestones SET status='PAID', paid_amount=35000
    API->>DB: INSERT INTO fee_receipts (utr_number='UTR7721831', sha256_hash=HMAC(...))
    API->>Parent: Deliver Cryptographically Signed PDF Tax Receipt
```

---

### Role 8: Academic Coordinator (`/academic_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Curriculum Surveillance & Faculty Logistics Context*
* **Core Invariants:**
  1. Period substitutions automatically filter faculty based on three mandatory conditions: teacher is present on campus, has zero teaching periods assigned in that slot, and has not exceeded their daily proxy load cap.
  2. Curriculum pacing compares completed syllabus units against the statutory academic calendar; pacing deviations $>2$ chapters trigger automated remedial alerts to the Principal.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AcadWorkspace ["Academic Coordinator Workspace (/academic_coordinator)"]
        UI_SUB_MATRIX["Period Vacancy & Substitution Allocation Matrix"]
        UI_PACING_RADAR["Curriculum Syllabus Pacing Tracker"]
        UI_FACULTY_ROSTER["Faculty Timetabled Workload & Directory"]
        UI_SLA_ESCALATE["Task SLA Governance & Escalate to Principal"]
    end

    subgraph AcadEngines ["Academic Coordination Services"]
        VACANCY_DETECT["Automated Period Vacancy Matcher"]
        PROXY_FILTER["Conflict-Free Faculty Availability Filter"]
        PACING_CALC["Syllabus Milestone Deviation Engine"]
    end

    subgraph AcadData ["Operational Persistence"]
        DB_TIMETABLE[("timetables")]
        DB_SUBS[("substitution_slots")]
        DB_SYLLABUS[("curriculum_milestones")]
    end

    UI_SUB_MATRIX --> VACANCY_DETECT --> PROXY_FILTER --> DB_SUBS
    UI_PACING_RADAR --> PACING_CALC --> DB_SYLLABUS
    UI_FACULTY_ROSTER --> DB_TIMETABLE
```

#### 3. Database Schema Mapping
* **Primary Tables:**
  * `timetables` (`id` PK, `class_id` FK, `day_of_week`, `period_number`, `subject_id` FK, `teacher_id` FK, `room_number`)
  * `substitution_slots` (`id` PK, `date`, `period_number`, `class_id` FK, `absent_teacher_id` FK, `substitute_teacher_id` FK, `status`, `is_admin_override`)
  * `curriculum_milestones` (`id` PK, `subject_id` FK, `class_id` FK, `expected_units_completed`, `actual_units_completed`, `variance_status`)

#### 4. End-to-End Workflow: Period Vacancy Detection & 1-Click Conflict-Free Substitution

```mermaid
sequenceDiagram
    autonumber
    actor TeacherA as Absent Teacher
    actor AcadCoord as Academic Coordinator
    participant API as FastAPI Backend
    participant DB as PostgreSQL DB
    actor TeacherB as Available Substitute
    actor Students as Class Students

    TeacherA->>API: POST /api/v1/teacher/leaves/apply (Casual Leave Today)
    API->>DB: INSERT INTO substitution_slots (status='PENDING', period=3, class_id='10-A')
    API->>AcadCoord: Push Alert: "Unmanned Class Alert: Period 3, Class 10-A (Mathematics)"
    AcadCoord->>API: GET /api/v1/admin/substitutions/available-faculty?period=3&date=Today
    API->>DB: Query Active Faculty (Excludes absent teachers, period 3 clashes, and overload)
    DB-->>AcadCoord: Return Qualified Candidates (e.g., Dr. Suresh Babu - Math Dept)
    AcadCoord->>API: POST /api/v1/admin/substitutions/assign (slot_id=45, sub_id=12)
    API->>DB: UPDATE substitution_slots SET status='Assigned', substitute_teacher_id=12
    API->>TeacherB: Push Notification: "Assigned Proxy Coverage: Period 3, Class 10-A"
    API->>Students: Timetable Refresh: "Period 3 Mathematics: Substitute Dr. Suresh Babu"
```

---

## 4. Master Cross-Role Orchestration & Handshake Machine

```mermaid
stateDiagram-v2
    [*] --> Inactive

    state AdmissionsDesk {
        NewInquiry --> CampusTour
        CampusTour --> EntranceEvaluation
        EntranceEvaluation --> FeePaid
        FeePaid --> SISPushed: Atomic Transaction
    }

    state OperationalLifeCycle {
        SISPushed --> DailyAttendance
        DailyAttendance --> LiveWebRTCClass: 10-Min Telemetry
        DailyAttendance --> SickLeaveApplied: Parent Request
        SickLeaveApplied --> TeacherLeaveReview: Teacher Check
        TeacherLeaveReview --> AdminLeaveOverride: Principal Bypass (if disputed)
        
        LiveWebRTCClass --> SpeedGraderMarking: Homework Upload
        SpeedGraderMarking --> RemedialFocusTable: Score < 50%
        
        RemedialFocusTable --> ExamSchedule
        ExamSchedule --> MarksModeration: Teacher Grades
        MarksModeration --> BoardLOCExport: Exam Coord Lock
    }

    state FinancialCycle {
        SISPushed --> FeeInvoicing
        FeeInvoicing --> DefaulterAging: Milestone Overdue
        DefaulterAging --> ReminderBroadcast: 1-Click WhatsApp
        ReminderBroadcast --> FeeSettled: Webhook UTR Lock
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
    OperationalLifeCycle --> ExitClearance: Withdrawal Request
    FinancialCycle --> ExitClearance
    PrincipalSealedTC --> [*]: Archived in Vault
```

---

## 5. Architectural Decision Records (ADRs)

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

---

## 6. Verification & Port Access Matrix

| Role | Portal Route | Primary Test Procedure | Expected System Outcome |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `http://localhost:3000/admin` | Execute Admin Override on student leave request #402. | Leave status flips to `Approved`; attendance register updates to `Leave` (`admin_override=True`); teacher rejection disabled. |
| **Academic Coord** | `http://localhost:3000/academic_coordinator` | Click **Assign Substitute Teacher** on Period 3 vacancy. | Engine filters out busy/absent staff; assign Dr. Suresh Babu; schedule updates across teacher and student portals. |
| **Exam Coord** | `http://localhost:3000/exam_coordinator` | Click **Verify & Lock Marks** on Class 10 Math moderation. | Grade set freezes; unlocks batch report card PDF generation and official CBSE LOC CSV export. |
| **Accounts Coord** | `http://localhost:3000/accounts_coordinator` | Open **Defaulters & Aging**; click **Dispatch 1-Click Reminder**. | Dispatches templated WhatsApp reminders with direct UPI deep-links to all Tier 3 overdue accounts. |
| **Admissions Coord**| `http://localhost:3000/admissions_coordinator` | Advance lead to `Fee Paid`; click **Convert to Enrolled Student**. | Single-pass ACID transaction seeds student record, parent account, class roster placement, and fee milestones. |
| **Teacher** | `http://localhost:3000/teacher` | Open **SpeedGrader Studio**; run OCR; adjust score; save. | Side-by-side canvas records annotated PDF; updates student portfolio; delivers parent push notification. |
| **Secondary Student**| `http://localhost:3000/student` | Join LiveKit live lecture; verify connected duration. | Background telemetry verifies connection duration $\ge 10$ mins; automatically logs student as `Present`. |
| **Parent** | `http://localhost:3000/parent` | Reserve 10:15 AM PTM slot; open fee cashier dummy QR. | Acquires 5-minute pessimistic row lock (`SELECT FOR UPDATE`); payment webhook updates milestone to `PAID`. |
