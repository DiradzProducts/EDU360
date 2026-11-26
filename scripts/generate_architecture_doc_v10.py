import sys
import os

DOC_PATH = r"docs/architecture/ROLE_WISE_ARCHITECTURE_AND_WORKFLOWS.md"

content = """# EDU360 Master System Architecture & Role-Wise Workflow Specification
**Enterprise Cloud-Native Institutional Management, WebRTC Live Education & Unified SIS Ecosystem**  
**Document Classification:** Production Architectural Baseline (v10.0 — Fully Synchronized Cross-Role Ecosystem with Real-Time Academic & Governance Event Buses)  
**Authors:** Principal Software Architect (`/Software Architect`), Backend Architect (`/Backend Architect`), Database Optimizer (`/Database Optimizer`), Frontend Developer (`/Frontend Developer`), Codebase Archaeologist (`/Codebase Archaeologist`), Lead Technical Writer (`/Technical Writer`)  
**Scope:** The 8 Canonical Roles (Excluding Junior K–5 as specified) + Administrative Override Governance Engine + Cross-Role Real-Time Synchronization Bus

---

## 1. System Topology & Macro Architecture

EDU360 operates as a **modular monolith** with domain-driven bounded contexts. The system runs an asynchronous **FastAPI (Python 3.11+)** ASGI service, a **Next.js 14/16 (React 18/19 SSR/Client)** multi-portal frontend, a **PostgreSQL 15+** transactional relational store with asynchronous connection pooling via `asyncpg`, a distributed **LiveKit WebRTC** cluster for live video classroom instruction, a centralized **ClockProvider** simulation engine, a real-time **In-App Notification Center**, a reactive cross-portal **Fee Ledger Synchronization Bus**, a **Tri-Directional Homework Notification Fan-Out Engine**, a **Dynamic Surveillance Room Segregator**, and an S3-compatible encrypted **Object Vault** for homework, prescriptions, and document compliance records.

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
        FEE_SYNC_BUS["Reactive Client-Side Fee Ledger Sync (fee-ledger.ts)<br/>(Immediate Tri-Portal Sync: Accounts, Admin & Parent)"]
        HW_FANOUT["Tri-Directional Homework Notification Fan-Out Bus<br/>(Teacher Assign ➔ Student Workspace + Parent Evening Slider)"]
        AUTHENTIC_QR["Authentic 29x29 UPI QR Generator (authentic-qr.tsx)<br/>(Dynamic Merchant Payload: PhonePe / GPay / BHIM)"]
        SURVEILLANCE_ROUTER["Surveillance Room Segregator (get_surveillance_room)<br/>(Isolated Dynamic Channels: exam-room-class8-b)"]
        FIN_HOLD_GATE["Financial Fee Hold Gating Engine<br/>(Withholds Hall Tickets & Sensitive Report Card Marks)"]
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
        SUB_MATCHER["Emergency Substitution & Scoped Proxy Injector"]
        EXIT_CLEARANCE["Dual-Custody Exit Clearance & Automated Withdrawn Engine"]
        FEE_AGING["Dynamic Timestamp Aging & Bank Reconciliation Engine"]
        PAYROLL_ENG["Staff Salaries & Payroll Engine (LOP Deductions & Four-Eye Maker-Checker)"]
        BATCH_EXAM_ENG["Batch Class Exam Scheduling & Dynamic Admit Card Engine"]
        ACADEMIC_SYNC["Academic & Exam Coordinator Syllabus Sync Protocol (ExamSyncRequest)"]
        ATOMIC_ENROLL["Admissions Atomic SIS Entity Inception Engine (Sequential Roll No)"]
        MODERATION_LEDGER["Assessment Normalization & Redacted Report Card Publisher"]
    end

    subgraph PersistenceTier ["Data Persistence, Compliance & Storage Layer"]
        PG_MASTER[("PostgreSQL 15+ Primary Schema<br/>(Transactional ACID Engine via asyncpg)")]
        AUDIT_CHAIN[("Append-Only Security Audit Ledger<br/>(SHA-256 Cryptographic Seals)")]
        S3_VAULT[("Encrypted Asset & Document Vault<br/>(S3 / MinIO Object Storage)")]
    end

    UI_ADMIN & UI_ACAD & UI_EXAM & UI_ACC & UI_ADM & UI_TEACH & UI_STUD & UI_PAR --> NOTIF_BELL & DYNAMIC_CLOCK
    UI_TEACH --> HW_FANOUT
    UI_PAR --> AUTHENTIC_QR
    UI_ACC & UI_ADMIN & UI_PAR --> FEE_SYNC_BUS
    UI_EXAM & UI_STUD & UI_TEACH --> SURVEILLANCE_ROUTER
    UI_EXAM & UI_STUD & UI_ACC --> FIN_HOLD_GATE

    NOTIF_BELL & DYNAMIC_CLOCK & FEE_SYNC_BUS & HW_FANOUT & SURVEILLANCE_ROUTER & FIN_HOLD_GATE --> INGRESS
    INGRESS --> AUTH_RBAC
    AUTH_RBAC --> CLOCK_SVC
    CLOCK_SVC --> OVERRIDE_ENG & LIVEKIT_WORKER & SPEEDGRADER_ENG & CONCURRENCY_MGR & SUB_MATCHER & EXIT_CLEARANCE & FEE_AGING & PAYROLL_ENG & BATCH_EXAM_ENG & ACADEMIC_SYNC & ATOMIC_ENROLL & MODERATION_LEDGER

    OVERRIDE_ENG & PAYROLL_ENG & EXIT_CLEARANCE --> AUDIT_CHAIN
    OVERRIDE_ENG & LIVEKIT_WORKER & SPEEDGRADER_ENG & CONCURRENCY_MGR & SUB_MATCHER & EXIT_CLEARANCE & FEE_AGING & PAYROLL_ENG & BATCH_EXAM_ENG & ACADEMIC_SYNC & ATOMIC_ENROLL & MODERATION_LEDGER --> PG_MASTER
    SPEEDGRADER_ENG & EXIT_CLEARANCE --> S3_VAULT
```

### 1.2 Core Architectural Invariants (Guaranteed System Constraints)

1. **Single Source of Temporal Truth (`ClockProvider`)**: All period bells, live class broadcasings, proctored examinations, and late marks derive strictly from the centralized `ClockProvider` simulation engine running on synchronized 30-second heartbeats.
2. **Defaulter Payment Balance Cap**: Any fee payment against a defaulter row (`POST /api/parent/fees/{id}/pay` or `POST /api/finance/counter-payment`) strictly caps payment at the overdue balance (`amount_paid <= defaulter.amount_due`), preventing negative balances or ledger divergence.
3. **Atomic Multi-Aggregate SIS Inception**: Converting an admissions lead (`POST /api/admin/admissions/enquiries/{id}/convert`) executes as a single-pass ACID transaction that generates `Student` (with collision-free `_next_sequential_roll_no`), `Parent`, `User` credentials, active class roster entry, Day 1 baseline `AttendanceRecord`, dynamic `HallTicket`, and 5 standardized annual `FeeMilestones`.
4. **Dual-Custody Exit Clearance & Automatic Roster Pruning**: Under CBSE Rule 44, student withdrawal requires Parent Digital Signature followed by Admin Physical Wet-Signature Register Verification (`POST /api/admin/exit-clearances/{id}/verify-physical`). Upon completion, the student entity status transitions to `Withdrawn` and is automatically excluded from daily classroom attendance registers.
5. **Scoped Faculty Substitution Proxy Injection**: When an emergency substitute is assigned (`assign_substitution`), proxy period injection targets strictly the chosen substitute teacher's schedule (`activity_type = 'SUBSTITUTION_COVER'`), preserving uninvolved faculty timetables while broadcasting live proxy tags to student timetables.
6. **Financial Fee Hold on High-Stakes Academic Credentials**: Students with uncleared institutional fee arrears (`exam_clearance == False`) are locked out of downloading examination hall tickets (`is_on_hold = True`). Term report cards published by the Exam Coordinator redact sensitive marks memos (`overall_grade = 'WITHHELD'`, `grades_grid = {}`) until cleared or overridden.
7. **Proctoring Liveness Gate & Session Termination**: Live proctoring malpractice alerts on `/teacher` strictly require an active commenced exam session (`localStorage.getItem('edu360_exam_commenced') === 'true'` and not ended). Zombie alerts during off-hours are purged. Concluding an exam (`POST /api/exams/schedules/{id}/conclude`) permanently marks the session `CONCLUDED`, suppressing student exam pop-ups.
8. **Tri-Directional Homework Notification Fan-Out**: Creating homework (`POST /api/teacher/homework`) automatically dispatches dual asynchronous notifications: one to the student cohort (with action deep-links to submission canvases) and one to parents (for evening oversight in the "Tonight Verification Tasks" slider).
9. **Parent-Teacher Medical Closed-Loop**: Parents can attach medical doctor prescriptions (Base64 DataURL slips) to leave applications. Homeroom faculty can inspect and print the prescription via the Leave Receipt Viewer Modal, and approving the leave instantly marks the student's status on the live register as `Excused Leave` (`is_on_leave = True`).
10. **Universal Dynamic Student Lifecycles**: Non-default and newly enrolled students operate identically to seeded legacy students—joining LiveKit rooms dynamically, clocking attendance under the 10-minute rule (+5.5m Present, +14.5m Late), and receiving teacher attendance overrides without manual setup.

---

## 2. Cross-Cutting Administrative Override & Governance Engine

In virtual and physical school operations, exceptional circumstances arise where automated rules or frontline decisions threaten institutional compliance, equity, or operations (e.g., disputed medical leaves, fee disputes blocking board exams, or coordinator SLA breaches).

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

### 2.1 The 6 Concrete Administrative Override Domains

| Override Module | Database Attributes | Trigger Condition | Execution Rule & Invariant |
| :--- | :--- | :--- | :--- |
| **1. Student Leave & Attendance** | `LeaveRequest.is_admin_override = Boolean`<br>`Attendance.admin_override = Boolean`<br>`Attendance.override_by_role = "ADMIN"` | Principal approves a disputed leave (e.g. hospitalization) previously rejected or unhandled by teacher. | **Downstream Reversal Lockout**: If `LeaveRequest.is_admin_override == True`, teacher portal rejection endpoints return `403 Forbidden`. The attendance register updates to `status='Leave'`, sets `admin_override=True`, and dispatches an `ADMIN_OVERRIDE_ALERT` notification to both teacher and parent. |
| **2. Institutional Tasks & SLA** | `Task.is_admin_override = Boolean`<br>`Task.admin_override_reason = Text`<br>`Task.approved_by = "Principal (Override)"` | A coordinator or department task stalls beyond its SLA, threatening statutory filing or board deadlines. | Force-closes or reassigns task immediately without coordinator sign-off. Emits `TASK_ADMIN_OVERRIDE_CLOSE` to the audit log with mandatory justification text. |
| **3. Exam Marks Moderation** | `ExamModeration.is_locked = Boolean`<br>`ExamModeration.admin_override = Boolean` | Post-moderation grade adjustments required due to board re-evaluation or calculation discrepancy. | Breaks the coordinator cryptographic mark freeze. Requires dual administrator credentials; archives previous score vector snapshot into historical audit table. |
| **4. Emergency Timetable Substitution** | `SubstitutionSlot.is_admin_override = Boolean`<br>`SubstitutionSlot.status = "Assigned"` | Severe faculty absenteeism where all available department teachers exceed daily workload caps ($>6$ periods/day). | Suppresses workload ceiling warning; logs emergency coverage directive with Principal authorization ID. |
| **5. Financial Fee Hold & Exam Clearance** | `FeeDefaulter.exam_clearance = Boolean`<br>`FeeMilestone.is_admin_override = Boolean` | Extreme hardship, scholarship grant, or fee dispute resolution enabling student to write board exams. | Admin executes `POST /api/finance/defaulters/{id}/exam-clearance` to toggle clearance. Immediately unfreezes hall ticket docket and un-redacts report card marks. |
| **6. Statutory Exit Clearance Verification** | `ExitClearance.status = "Completed & Permanently Archived"`<br>`Student.status = "Withdrawn"` | Admin verifies physical wet-signature scan of school-leaving register (`POST /api/admin/exit-clearances/{id}/verify-physical`). | Completes dual-custody clearance; automatically sets student entity status to `Withdrawn` and removes them from active teacher attendance rosters. |

---

## 3. The 8 Role-Wise Architectures & Workflows

---

### Role 1: Teacher Portal (`/teacher`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Pedagogical Delivery, Assessment & Faculty Workforce Context*
* **Core Invariants:**
  1. A teacher can only grade submissions for sections and subjects explicitly mapped to them in `teacher_assignments`.
  2. The teacher cannot overturn an active Principal Administrative Override on student leaves or attendance.
  3. AI-suggested scores (via Gemini OCR) are strictly recommendations; the teacher retains final evaluation authority.
  4. **Leave Categorization**: Teacher leave requests declare a formal category: `Casual Leave (CL)`, `Medical Leave (ML)` (with prescription), `On-Duty (OD)`, or `Loss of Pay / Unpaid (LOP)`.
  5. **Attendance Integrity**: Teachers log daily check-in/check-out via `StaffAttendanceDaily`, providing ground truth for substitute allocation.
  6. **Dynamic Class Roster Sync**: When Admissions converts a lead, the student profile and Day 1 attendance baseline automatically appear in the assigned class teacher's live register.
  7. **Homework Dual Fan-Out**: Assigning homework via `/api/teacher/homework` automatically dispatches dual notifications to the student cohort and parent oversight feed.
  8. **Period Attendance Roll Call**: Teachers take subject-specific period roll calls (`POST /api/teacher/attendance/mark-period`). Any student marked absent triggers an automated high-priority alert to the parent.
  9. **Prescription Slip Verification**: Teachers can view parent-uploaded medical certificates directly inside the Leave Receipt Viewer Modal before approving medical leave.
  10. **Proctoring Liveness Guard**: Proctoring malpractice warnings only fire when an exam is actively commenced (`localStorage.getItem('edu360_exam_commenced') === 'true'`).

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph TeacherWorkspace ["Teacher Presentation Workspace (/teacher)"]
        UI_LIVE_STUDIO["Live Lecture Studio (Broadcaster Stage)"]
        UI_SPEEDGRADER["2-Pane SpeedGrader Studio (PDF/OCR Canvas)"]
        UI_ATT_REGISTER["Bulk Attendance Register & Period Roll Call"]
        UI_HW_MODAL["Assign New Homework Modal (Daily, Project, Remedial)"]
        UI_LEAVE_RECEIPT["Parent Leave Medical Receipt Viewer Modal"]
        UI_LEAVE_DESK["Staff Leave Desk (CL, ML, OD, LOP Types)"]
        UI_PROCTOR_COCKPIT["Live Invigilator Cockpit (Liveness Guarded)"]
        UI_FOCUS_TABLE["1-Week Shared Focus Table Generator"]
    end

    subgraph TeacherServices ["FastAPI Teacher Application Services"]
        ROOM_MGR["LiveKit Room Management Service"]
        GRADING_ENG["Rubric & Annotation Evaluation Service"]
        GEMINI_OCR["Gemini Multimodal OCR Ingestion Worker"]
        ATT_RECON["Attendance Register Reconciliation Service"]
        PERIOD_ATT_SVC["Period Attendance & Absence Dispatch Service"]
        HW_DISPATCH["Homework Creation & Fan-Out Service"]
        LEAVE_REVIEW["Leave Request Review & Register Excusal Service"]
        PROCTOR_SVC["Exam Session Surveillance Service"]
    end

    subgraph TeacherPersistence ["Teacher Domain Tables"]
        T_CLASSES[("live_classes")]
        T_ATTENDANCE[("attendance_records")]
        T_PERIOD_ATT[("period_attendance")]
        T_SUBMISSIONS[("student_submissions")]
        T_HOMEWORK[("homework")]
        T_LEAVES[("leave_requests")]
        T_STAFF_LEAVES[("staff_permissions")]
    end

    UI_LIVE_STUDIO --> ROOM_MGR
    UI_SPEEDGRADER --> GRADING_ENG & GEMINI_OCR
    UI_ATT_REGISTER --> ATT_RECON & PERIOD_ATT_SVC
    UI_HW_MODAL --> HW_DISPATCH
    UI_LEAVE_RECEIPT --> LEAVE_REVIEW
    UI_LEAVE_DESK --> LEAVE_REVIEW
    UI_PROCTOR_COCKPIT --> PROCTOR_SVC

    ROOM_MGR --> T_CLASSES
    ATT_RECON --> T_ATTENDANCE
    PERIOD_ATT_SVC --> T_PERIOD_ATT
    GRADING_ENG & GEMINI_OCR --> T_SUBMISSIONS
    HW_DISPATCH --> T_HOMEWORK
    LEAVE_REVIEW --> T_LEAVES & T_STAFF_LEAVES & T_ATTENDANCE
```

#### 3. Database Schema Mapping
* `homework` (`id` PK, `title`, `subject`, `class_name`, `task_type`, `due_date`, `due_time`, `teacher_id` FK, `max_marks`, `description`)
* `period_attendance` (`id` PK, `period_no`, `subject_code`, `class_name`, `section`, `session_date`, `student_id` FK, `status`, `elapsed_minutes`, `note`)
* `leave_requests` (`id` PK, `student_id` FK, `parent_name`, `from_date`, `to_date`, `reason`, `is_medical`, `attachment_url`, `status`, `teacher_notes`)
* `staff_permissions` (`id` PK, `staff_id` FK, `leave_category`, `from_date`, `to_date`, `lop_deduction_amount`, `status`, `principal_authorized`)

#### 4. Workflows & Sequence Charts

##### Workflow A: Homework Assignment & Dual Notification Fan-Out
```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Class Faculty
    participant UI as Teacher Portal (/teacher)
    participant API as FastAPI Gateway (/api/teacher)
    participant DB as PostgreSQL Master
    participant NotifBus as Notification Engine
    actor Student as Student Cohort
    actor Parent as Parent Oversight

    Teacher->>UI: Click "+ Assign Homework"
    UI->>UI: Open Assign New Homework Modal
    Teacher->>UI: Fill Title, Subject ("Mathematics"), Class ("Class 8-B"), Task Type ("DAILY_HOMEWORK"), Due Date/Time, Max Marks (20)
    Teacher->>UI: Click "Assign & Dispatch"
    UI->>API: POST /api/teacher/homework (Payload)
    API->>DB: INSERT INTO homework (title, subject, class_name, task_type, due_date, max_marks)
    API->>NotifBus: Dispatch Student Notification ("New Homework Assigned: Mathematics")
    API->>NotifBus: Dispatch Parent Notification ("Tonight Verification Task: Mathematics Homework Due")
    NotifBus->>Student: In-App Notification Bell & Badge (+ Deep Link)
    NotifBus->>Parent: Parent Feed & "Tonight Verification Tasks" Slider
    API-->>UI: Return 200 OK + Homework Object
    UI-->>Teacher: Toast: "✓ Homework assigned successfully to Class 8-B"
```

##### Workflow B: Period Attendance Roll Call & Parent Absence Alert
```mermaid
sequenceDiagram
    autonumber
    actor Teacher as Homeroom Faculty
    participant UI as Teacher Portal
    participant API as FastAPI Gateway
    participant DB as PostgreSQL
    participant NotifBus as Notification Dispatcher
    actor Parent as Parent Mobile App

    Teacher->>UI: Open "Take Period Roll Call" Modal
    UI->>UI: Populate Active Class Roster (Auto-tag "On Leave" if is_on_leave=True)
    Teacher->>UI: Mark Student #2 "Absent" for Period 2
    Teacher->>UI: Click "Save & Dispatch Register"
    UI->>API: POST /api/teacher/attendance/mark-period
    API->>DB: INSERT INTO period_attendance (period_no=2, student_id=2, status='Absent')
    API->>NotifBus: Dispatch High-Priority Parent Alert (type='STUDENT_ABSENT', title='Morning Roll Call / Period 2 Absence')
    NotifBus->>Parent: High-Signal Notification Chime: "Your ward was marked absent during Period 2"
    API-->>UI: Return 200 OK
    UI-->>Teacher: Toast: "✓ Period 2 roll call recorded successfully"
```

---

### Role 2: Secondary Student Cockpit (`/student`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Learning Engagement, Assessment Execution & Academic Self-Service*
* **Core Invariants:**
  1. Student cannot access live proctored exam stages until: `Date == Today` AND `Lifecycle == LIVE` AND `status != 'completed'` AND `exam_clearance == True`.
  2. If an institutional fee hold is active (`exam_clearance == False`), the hall ticket docket is blocked (`is_on_hold = True`), and a fee hold alert is displayed directing the student to the bursar.
  3. Student timetable periods dynamically reflect emergency proxy teachers (`Proxy: [Substitute Name]`).
  4. Concluded or dismissed exam sessions persist dismissal across browser tabs using `sessionStorage` (`edu360_exam_dismissed_active`).
  5. Any enrolled student (including new admissions) dynamically clocks LiveKit attendance under the 10-minute rule (+5.5m Present, +14.5m Late).

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph StudentCockpit ["Secondary Student Cockpit (/student)"]
        UI_STAGE["Live Class WebRTC Stage (Viewer Role)"]
        UI_TIMETABLE["Daily Dynamic Timetable (Proxy Faculty Tags)"]
        UI_HW_DESK["Homework & Assignment Desk (Direct Upload)"]
        UI_EXAM_MODAL["Proctored Exam Stage (Financial Hold Protected)"]
        UI_ADMIT_CARD["Digital Admit Card Docket (Gate Protected)"]
        UI_REPORT_CARD["Official Term Report Card (Redacted if On Hold)"]
    end

    subgraph StudentServices ["FastAPI Student Application Services"]
        ST_LIVEKIT["LiveKit Participant Ingestion Hook"]
        ST_TIMETABLE_SVC["Timetable & Substitution Merge Service"]
        ST_HW_SVC["Homework Submission & Upload Service"]
        ST_EXAM_SVC["Exam Schedule & Surveillance WebSocket Hook"]
        ST_GATE_SVC["Financial Clearance Verification Service"]
    end

    subgraph StudentPersistence ["Student Relational Tables"]
        T_STUDENTS[("students")]
        T_ADMIT[("hall_tickets")]
        T_REPORT[("report_cards")]
        T_SUBMISSIONS[("student_submissions")]
        T_ATTENDANCE[("attendance_records")]
    end

    UI_STAGE --> ST_LIVEKIT
    UI_TIMETABLE --> ST_TIMETABLE_SVC
    UI_HW_DESK --> ST_HW_SVC
    UI_EXAM_MODAL & UI_ADMIT_CARD & UI_REPORT_CARD --> ST_GATE_SVC & ST_EXAM_SVC

    ST_LIVEKIT --> T_ATTENDANCE
    ST_HW_SVC --> T_SUBMISSIONS
    ST_GATE_SVC --> T_ADMIT & T_REPORT
```

#### 3. Database Schema Mapping
* `students` (`id` PK, `admission_no` UNIQUE, `roll_no`, `name`, `class_name`, `section`, `status`, `is_on_leave`, `today_attendance_status`)
* `hall_tickets` (`id` PK, `student_id` FK, `exam_id` FK, `ticket_number`, `hall_name`, `seat_code`, `chief_invigilator_name`, `exam_clearance`)
* `report_cards` (`id` PK, `student_id` FK, `term`, `academic_year`, `grades_grid_json`, `total_marks_obtained`, `overall_percentage`, `overall_grade`, `is_published`, `is_on_hold`, `hold_reason`)

#### 4. End-to-End Workflow: Student Proctored Exam Lifecycle & Financial Gate
```mermaid
sequenceDiagram
    autonumber
    actor Student as Secondary Student
    participant UI as Student Cockpit (/student)
    participant API as FastAPI Gateway
    participant DB as PostgreSQL DB

    Student->>UI: Access "Digital Admit Card" Docket
    UI->>API: GET /api/exams/hall-tickets/student/{id}
    API->>DB: Query Student & FeeDefaulter (Check exam_clearance)
    alt Fee Arrears Active (exam_clearance == False)
        API-->>UI: 200 OK (is_on_hold=True, hall_ticket=null, hold_reason="Institutional Fee Clearance Hold")
        UI-->>Student: Display Red Fee Hold Alert Banner ("Contact Accounts Department")
    else Fees Cleared (exam_clearance == True)
        API-->>UI: 200 OK (is_on_hold=False, hall_ticket=TicketData)
        UI-->>Student: Render Official Digital Admit Card with Invigilator Seal & QR
    end

    Student->>UI: Exam Date Arrives (ClockProvider signals LIVE)
    UI->>API: Connect WebSocket /api/exams/ws/surveillance/exam-room-class8-b
    UI->>UI: Mount Online Exam Modal (Render questions & camera feed)
    Student->>UI: Submit Exam
    UI->>API: POST /api/exams/submissions
    API->>DB: INSERT INTO student_submissions (status='completed')
    UI->>UI: Persist dismissal in sessionStorage (edu360_exam_dismissed_active=true)
    UI-->>Student: Exam modal unmounts; success notification displayed
```

---

### Role 3: Parent Mobile Portal (`/parent`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Guardian Oversight, Statutory Governance & Financial Settlement*
* **Core Invariants:**
  1. Parents can switch between multiple enrolled siblings without re-authenticating.
  2. All fee payments cap at the exact overdue balance and dynamically update Accounts and Admin dashboards.
  3. Under CBSE Rule 44, parents must digitally sign Transfer Certificate (TC) exit clearances.
  4. Homework assigned by teachers appears in the "Tonight Verification Tasks" slider.
  5. Parents receive immediate high-priority alerts upon morning roll call or period-wise subject absence.
  6. Medical leave applications allow uploading medical prescription certificates.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph ParentWorkspace ["Parent Mobile Portal (/parent)"]
        UI_SLIDER["Anti-Spam Moving Slider Dashboard"]
        UI_ABSENCE_ALERT["Morning & Period Absence High-Signal Alerts"]
        UI_TONIGHT_HW["Tonight Verification Tasks (Homework Oversight)"]
        UI_FEE_CHECKOUT["Authentic 29x29 UPI QR Code Checkout"]
        UI_PTM_BOOKER["Dynamic PTM Slot Grid (5-Min Concurrency Lock)"]
        UI_LEAVE_APP["Leave Request Desk (Prescription Attachment)"]
        UI_TC_MODAL["CBSE Rule 44 Exit Clearance Digital Sign Modal"]
    end

    subgraph ParentServices ["FastAPI Parent Application Services"]
        PAR_FEE_SVC["Fee Ledger Reconciliation Service"]
        PAR_PTM_SVC["PTM Slot Booking & Cancellation Service"]
        PAR_LEAVE_SVC["Leave Application & Attachment Service"]
        PAR_TC_SVC["Statutory Exit Digital Signature Service"]
        PAR_NOTIF_SVC["Parent Notification Ingestion Hook"]
    end

    subgraph ParentPersistence ["Parent Relational Tables"]
        T_PARENTS[("parents")]
        T_DEFAULTERS[("fee_defaulters")]
        T_PTM[("ptm_slots")]
        T_CLEARANCE[("exit_clearances")]
        T_TRANSACTIONS[("payment_transactions")]
    end

    UI_FEE_CHECKOUT --> PAR_FEE_SVC
    UI_PTM_BOOKER --> PAR_PTM_SVC
    UI_LEAVE_APP --> PAR_LEAVE_SVC
    UI_TC_MODAL --> PAR_TC_SVC
    UI_ABSENCE_ALERT & UI_TONIGHT_HW --> PAR_NOTIF_SVC

    PAR_FEE_SVC --> T_DEFAULTERS & T_TRANSACTIONS
    PAR_PTM_SVC --> T_PTM
    PAR_TC_SVC --> T_CLEARANCE
```

#### 3. Database Schema Mapping
* `fee_defaulters` (`id` PK, `student_id` FK, `student_name`, `amount_due`, `days_overdue`, `status`, `exam_clearance`)
* `ptm_slots` (`id` PK, `slot_time`, `day_of_week`, `teacher_id` FK, `status`, `booked_student_id` FK, `focus_table_agenda`)
* `exit_clearances` (`id` PK, `student_id` FK, `status`, `digital_parent_approved`, `parent_signature_timestamp`, `physical_scan_verified`, `tc_serial_no`)

#### 4. End-to-End Workflow: Fee Partial Payment & PTM Booking with Teacher Alerts
```mermaid
sequenceDiagram
    autonumber
    actor Parent as Student Parent
    participant UI as Parent Portal
    participant API as FastAPI Backend (parent.py)
    participant DB as PostgreSQL DB
    participant NotifBus as Notification Engine
    actor Teacher as Assigned Faculty

    Parent->>UI: Select Term 1 Fee (₹15,000 of ₹35,000 total overdue)
    UI->>UI: Render Authentic 29x29 UPI QR Code (Dynamic Intent URI)
    Parent->>UI: Pay via UPI & enter UTR "E2E-TEST-UTR-15000"
    UI->>API: POST /api/parent/fees/1/pay (amount=15000)
    API->>DB: BEGIN TRANSACTION (SELECT ... FOR UPDATE on fee_defaulters)
    API->>DB: UPDATE fee_defaulters SET amount_due=20000.0, status='Partially Paid'
    API->>DB: INSERT INTO payment_transactions (amount=15000, status='Success')
    API->>DB: COMMIT TRANSACTION
    API-->>UI: 200 OK (Defaulter amount reduced; Admin/Accounts synced via fee-ledger.ts)

    Parent->>UI: Open PTM Grid & Select 15-Minute Slot ("slot-05c")
    UI->>API: POST /api/parent/ptm-slots/book (student_id=1, agenda=["Midterm Review"])
    API->>DB: UPDATE ptm_slots SET status='BOOKED', booked_student_id=1 WHERE status='AVAILABLE'
    API->>NotifBus: Dispatch Notification to Teacher (type='PTM_SLOT_BOOKED')
    NotifBus->>Teacher: Live Bell Notification: "PTM Slot Booked by Mr. Rajesh Sharma for Aarav Sharma"
    API-->>UI: 200 OK (Slot confirmed)
```

---

### Role 4: Super Admin / Principal Console (`/admin`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Institutional Supervision, Executive Governance & Financial Authorization Context*
* **Core Invariants:**
  1. Priority Triage Cockpit (🔴 Red / 🟠 Orange / 🟢 Green) auto-updates every 60 seconds; students with approved leaves are excluded from unexcused absence red flags.
  2. Administrative Overrides are cryptographically stamped with SHA-256 seals.
  3. Student Exit Certificates (TC) require a dual-signature handshake (Library + Accounts clearance) followed by Parent Digital Sign and Principal physical wet-signature verification.
  4. Completing physical scan verification (`/verify-physical`) automatically updates student status to `Withdrawn` and removes them from active attendance registers.
  5. **Four-Eye Maker-Checker Payroll Authorization**: Monthly staff salary disbursements require mandatory executive sign-off (`POST /api/finance/payroll/batches/{id}/authorize`) before corporate wire execution.
  6. **Dynamic Financial Exam Clearance Toggle**: Principal can override fee defaulter exam blocks (`POST /api/finance/defaulters/{id}/exam-clearance`), instantly releasing hall tickets.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AdminConsole ["Principal Executive Console (/admin)"]
        UI_TRIAGE["Priority Triage Cockpit (Red / Orange / Green)"]
        UI_OVERRIDE_PANEL["Administrative Override Control Center"]
        UI_LEAVE_WIDGET["Faculty Staff Leave Review Pop-Up & Badges"]
        UI_PAYROLL_AUTH["Four-Eye Payroll Batch Sign-Off Desk"]
        UI_TC_VAULT["Dual-Signature TC Clearance & Physical Verify Desk"]
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
        DB_STUDENTS[("students")]
    end

    UI_TRIAGE --> TRIAGE_CALC
    UI_OVERRIDE_PANEL --> OVERRIDE_EXEC --> DB_AUDIT
    UI_LEAVE_WIDGET --> DB_STAFF_LEAVES
    UI_PAYROLL_AUTH --> PAYROLL_SIGNER --> DB_PAYROLL
    UI_TC_VAULT --> SEAL_SERVICE --> DB_CLEARANCE & DB_STUDENTS
```

#### 3. Database Schema Mapping
* `security_audit_trail` (`id` PK, `action`, `actor_role`, `actor_id`, `entity_name`, `entity_id`, `sha256_seal`, `timestamp`)
* `payroll_batches` (`id` PK, `month_year`, `total_gross`, `total_lop_deductions`, `net_payable`, `status`, `authorized_by`, `disbursed_at`)
* `exit_clearances` (`id` PK, `student_id` FK, `status`, `library_cleared`, `finance_cleared`, `digital_parent_approved`, `physical_scan_verified`, `tc_serial_no`)

#### 4. End-to-End Workflow: Dual-Custody Exit Clearance & Automated Withdrawn Status
```mermaid
sequenceDiagram
    autonumber
    actor Admin as School Principal
    participant UI as Admin Portal (/admin)
    actor Parent as Parent Mobile (/parent)
    participant API as FastAPI Backend (admin.py)
    participant DB as PostgreSQL DB
    actor Teacher as Class Faculty

    Admin->>API: POST /api/admin/exit-clearances/initiate (student_id=4)
    API->>DB: INSERT INTO exit_clearances (student_id=4, status='Initiated')
    API->>Parent: Notification: "Official School-Leaving Transfer Certificate Ready for Signature"
    Parent->>API: POST /api/parent/exit-clearance/4/digital-sign (confirmation=True)
    API->>DB: UPDATE exit_clearances SET digital_parent_approved=True, status='Parent Signed'
    
    Admin->>UI: Inspect Signed Clearance & Upload Physical Scan
    UI->>API: POST /api/admin/exit-clearances/{id}/verify-physical (scan_url="/assets/scans/tc_4.pdf")
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE exit_clearances SET physical_scan_verified=True, status='Completed & Permanently Archived'
    API->>DB: UPDATE students SET status='Withdrawn' WHERE id=4
    API->>DB: COMMIT TRANSACTION
    API-->>UI: 200 OK (TC Archived)
    
    Teacher->>API: GET /api/teacher/students (Fetch Daily Attendance Register)
    API->>DB: SELECT * FROM students WHERE status != 'Withdrawn'
    DB-->>Teacher: Student #4 successfully excluded from active attendance register!
```

---

### Role 5: Exam Coordinator (`/exam_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Assessment Operations, Secrecy Vault & Examination Logistics Context*
* **Core Invariants:**
  1. Once the Exam Coordinator clicks **Verify & Lock Marks**, grade entries are frozen and teachers cannot edit scores.
  2. Batch class exam scheduling executes via `POST /api/exams/schedules/batch-class` tagging slots with unique `batch_id`.
  3. Dynamic hall and room allocation segregates WebSocket proctoring channels via `get_surveillance_room(class_name, section)`.
  4. Concluding an exam session (`/conclude`) marks it permanently `CONCLUDED`, recording the invigilator and stopping student alerts.
  5. Report card publishing gates against financial fee holds: students on fee hold have marks memos redacted (`overall_grade = 'WITHHELD'`, `grades_grid = {}`).

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph ExamDesk ["Exam Coordinator Portal (/exam_coordinator)"]
        UI_BATCH_SCHED["Batch Class Exam Timetable Allocator"]
        UI_MOD_LEDGER["Marks Moderation & Statistical Normalization Desk"]
        UI_SURVEILLANCE["Multi-Room Invigilator Surveillance Cockpit"]
        UI_REPORT_PUB["Report Card Batch Publisher & Financial Gate"]
    end

    subgraph ExamCore ["Assessment Domain Engines"]
        BATCH_SCHED_ENG["Atomic Batch Examination Scheduler"]
        ROOM_SEGREGATOR["Dynamic Surveillance Channel Router"]
        MOD_VALIDATOR["Statistical Grade Distribution & Outlier Detector"]
        GATE_KEEPER["Financial Fee Hold Gating Engine"]
    end

    subgraph ExamData ["Assessment Ledger"]
        DB_SCHEDS[("exam_schedules")]
        DB_MOD[("exam_moderations")]
        DB_MARKS[("exam_marks")]
        DB_REPORTS[("report_cards")]
        DB_DEFAULTERS[("fee_defaulters")]
    end

    UI_BATCH_SCHED --> BATCH_SCHED_ENG --> DB_SCHEDS
    UI_SURVEILLANCE --> ROOM_SEGREGATOR
    UI_MOD_LEDGER --> MOD_VALIDATOR --> DB_MOD
    UI_REPORT_PUB --> GATE_KEEPER --> DB_REPORTS & DB_DEFAULTERS
```

#### 3. Database Schema Mapping
* `exam_schedules` (`id` PK, `batch_id`, `series_name`, `class_name`, `subject`, `exam_date`, `start_time`, `end_time`, `session_status`, `hall_name`)
* `report_cards` (`id` PK, `student_id` FK, `class_name`, `section`, `term`, `grades_grid_json`, `overall_grade`, `is_published`, `is_on_hold`)

#### 4. End-to-End Workflow: Report Card Publication with Financial Withholding Gate
```mermaid
sequenceDiagram
    autonumber
    actor ExamCoord as Exam Coordinator
    participant UI as Exam Coordinator Portal
    participant API as FastAPI Backend (exams.py)
    participant DB as PostgreSQL DB
    actor StudentCleared as Cleared Student (#2)
    actor StudentHeld as Held Student (#1)

    ExamCoord->>UI: Click "Publish Batch Report Cards" (Class 8-B, Term 1)
    UI->>API: POST /api/exams/report-cards/batch-publish (class_name="Class 8", section="B")
    API->>DB: Query ReportCards and JOIN fee_defaulters
    loop For Each Student in Class 8-B
        alt Student has Active Fee Hold (exam_clearance == False)
            API->>DB: UPDATE report_cards SET is_published=True, is_on_hold=True, overall_grade='WITHHELD', grades_grid_json='{}'
        else Student Cleared of Fees (exam_clearance == True)
            API->>DB: UPDATE report_cards SET is_published=True, is_on_hold=False, overall_grade=ActualGrade
        end
    end
    API-->>UI: 200 OK (Published: 1, Withheld: 1)
    
    StudentHeld->>API: GET /api/student/1/report-cards
    API-->>StudentHeld: Returns Overall Grade: "WITHHELD" (Marks memo redacted)
    StudentCleared->>API: GET /api/student/2/report-cards
    API-->>StudentCleared: Returns Complete Official Report Card with Grades Grid
```

---

### Role 6: Accounts Coordinator (`/accounts_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Bursar Operations, Fee Realization & Staff Payroll Engine*
* **Core Invariants:**
  1. Fee defaulter aging calculations run dynamically based on invoice timestamps across 4 standardized tiers (0–15d, 16–30d, 31–60d, 60d+).
  2. Settled records (`amount_due == 0`) are filtered out of active defaulters and queryable via `include_settled=true`.
  3. Bank reconciliation of online payments (`/reconcile`) automatically deducts defaulter balances and clears exam holds (`exam_clearance = True`).
  4. Maker in the Four-Eye payroll cycle, computing LOP deductions from approved staff permissions.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AccountsDesk ["Accounts Coordinator Desk (/accounts_coordinator)"]
        UI_AGING["Dynamic 4-Tier Fee Aging Ledger (0-15d, 16-30d, 31-60d, 60d+)"]
        UI_RECON["Online Bank Payment Reconciliation Desk"]
        UI_COUNTER["Counter POS Cashier Modal (Balance Capped)"]
        UI_PAYROLL["Staff Payroll Engine (Automated LOP Deductions)"]
    end

    subgraph AccountsServices ["Financial Services"]
        AGING_CALC["Dynamic Invoice Timestamp Aging Engine"]
        RECON_ENGINE["Bank Statement & UTR Reconciliation Engine"]
        CASHIER_SVC["Pessimistic Row Lock Cashiering Service"]
        PAYROLL_CALC["Pro-Rated LOP Payroll Calculator"]
    end

    subgraph AccountsLedger ["Financial Relational Tables"]
        DB_DEFAULTERS[("fee_defaulters")]
        DB_TRANSACTIONS[("payment_transactions")]
        DB_MILESTONES[("fee_milestones")]
        DB_PAYROLL[("payroll_batches")]
        DB_PAYSLIPS[("staff_payslips")]
    end

    UI_AGING --> AGING_CALC --> DB_DEFAULTERS
    UI_RECON --> RECON_ENGINE --> DB_TRANSACTIONS & DB_DEFAULTERS
    UI_COUNTER --> CASHIER_SVC --> DB_MILESTONES & DB_DEFAULTERS
    UI_PAYROLL --> PAYROLL_CALC --> DB_PAYROLL & DB_PAYSLIPS
```

#### 3. Database Schema Mapping
* `fee_defaulters` (`id` PK, `student_id` FK, `amount_due`, `days_overdue`, `status`, `exam_clearance`, `created_at`)
* `payment_transactions` (`id` PK, `utr_number`, `amount`, `payment_method`, `bank_name`, `status`, `reconciled`, `reconciled_by`)
* `staff_payslips` (`id` PK, `batch_id` FK, `staff_id` FK, `basic_salary`, `lop_deduction`, `net_salary`)

#### 4. End-to-End Workflow: Bank Reconciliation Auto-Settlement & Defaulter Reduction
```mermaid
sequenceDiagram
    autonumber
    actor Accounts as Accounts Coordinator
    participant UI as Accounts Portal
    participant API as FastAPI Backend (finance.py)
    participant DB as PostgreSQL DB
    actor Student as Student Portal

    Accounts->>UI: Inspect Unreconciled Payment (UTR: "UPI/TEST-RECON-1001", Amount: ₹10,000)
    UI->>API: POST /api/finance/transactions/{id}/reconcile
    API->>DB: BEGIN TRANSACTION
    API->>DB: UPDATE payment_transactions SET reconciled=True, received_by='Bank Verified (Accounts Officer)'
    API->>DB: UPDATE fee_defaulters SET amount_due = amount_due - 10000.0 WHERE student_name=tx.student_name
    alt Overdue Balance Reaches 0.0
        API->>DB: UPDATE fee_defaulters SET status='Paid', days_overdue=0, exam_clearance=True
    else Partial Balance Remains
        API->>DB: UPDATE fee_defaulters SET status='Partially Paid'
    end
    API->>DB: COMMIT TRANSACTION
    API-->>UI: 200 OK (Transaction reconciled; defaulter aging updated)
    
    Student->>API: GET /api/exams/hall-tickets/student/{id}
    API-->>Student: Hall Ticket and Exam Timetable released cleanly upon financial clearance!
```

---

### Role 7: Admissions Coordinator (`/admissions_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Student Outreach, Enrollment CRM & Atomic Identity Inception Context*
* **Core Invariants:**
  1. Lead conversion calculates sequential roll numbers dynamically (`_next_sequential_roll_no`) to avoid gaps.
  2. Automatically seeds annual fee milestone installments (`_seed_student_fee_milestones`).
  3. Single-pass atomic transaction provisions all SIS aggregates (Student, Parent, User, HallTicket, Attendance, Fees).

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AdmissionsDesk ["Admissions Coordinator Desk (/admissions_coordinator)"]
        UI_KANBAN["Applicant Pipeline Funnel (New -> Tour -> Cleared -> Enrolled)"]
        UI_TOURS["Campus Walk-In & Tour Schedule Desk"]
        UI_ENROLL_MODAL["Confirm Enrollment Modal (Sequential Roll No & Fees)"]
    end

    subgraph AdmissionsServices ["Enrollment Services"]
        LEAD_ORCH["Kanban Lead Stage Transition Engine"]
        PROVISION_ENGINE["Atomic Multi-Table SIS Entity Generator"]
        ROLL_SEQ["Collision-Free Sequential Roll Number Allocator"]
    end

    subgraph TargetSISSchema ["Core Relational Database"]
        DB_LEADS[("admissions_leads")]
        DB_STUDENTS[("students")]
        DB_USERS[("users")]
        DB_FEES[("fee_milestones")]
        DB_ATT[("attendance_records")]
        DB_TICKETS[("hall_tickets")]
    end

    UI_KANBAN --> LEAD_ORCH --> DB_LEADS
    UI_ENROLL_MODAL --> ROLL_SEQ & PROVISION_ENGINE
    PROVISION_ENGINE --> DB_STUDENTS & DB_USERS & DB_FEES & DB_ATT & DB_TICKETS
```

#### 3. Database Schema Mapping
* `admissions_leads` (`id` PK, `student_name`, `grade_applying`, `parent_name`, `parent_phone`, `parent_email`, `stage`)
* `students` (`id` PK, `admission_no` UNIQUE, `roll_no`, `name`, `class_name`, `section`, `status`)
* `fee_milestones` (`id` PK, `student_id` FK, `title`, `amount`, `due_date`, `status`)

#### 4. End-to-End Workflow: Atomic Lead Conversion & SIS Inception
```mermaid
sequenceDiagram
    autonumber
    actor AdmCoord as Admissions Coordinator
    participant UI as Admissions Portal
    participant API as FastAPI Backend (admin.py)
    participant DB as PostgreSQL DB
    actor Teacher as Class Teacher

    AdmCoord->>UI: Advance Lead to "Fee Paid" & Open ConfirmEnrollmentModal
    AdmCoord->>UI: Submit Enrollment (Class 8, Section B)
    UI->>API: POST /api/admin/admissions/enquiries/{id}/convert
    API->>DB: BEGIN ATOMIC TRANSACTION
    API->>DB: Execute _next_sequential_roll_no(class_name="Class 8", section="B") -> Roll #15
    API->>DB: INSERT INTO students (admission_no='ADM-2026-1045', roll_no="15", class_name='Class 8', section='B')
    API->>DB: INSERT INTO users (Student and Parent credentials)
    API->>DB: Execute _seed_student_fee_milestones -> 5 Annual Installments
    API->>DB: INSERT INTO attendance_records (Day 1 baseline: 'Present')
    API->>DB: INSERT INTO hall_tickets (Initial scheduled exams)
    API->>DB: UPDATE admissions_leads SET stage='Enrolled'
    API->>DB: COMMIT ATOMIC TRANSACTION
    API-->>UI: 200 OK (Enrolled Successfully)
    
    Teacher->>API: GET /api/teacher/students
    API-->>Teacher: Student #15 ("New Enrollee") appears instantly on classroom register!
```

---

### Role 8: Academic Coordinator (`/academic_coordinator`)

#### 1. Architectural Responsibility & Bounded Context
* **Bounded Context:** *Curriculum Surveillance, Pedagogical Auditing, PTM Logistics & Inter-Coordinator Alignment Context*
* **Core Invariants:**
  1. Period substitutions filter faculty based on on-campus presence (`staff_attendance_daily`), zero teaching period clashes, and daily workload caps.
  2. Assigning an emergency substitute (`inject_substitution_period`) targets strictly the chosen substitute teacher's schedule (`activity_type = 'SUBSTITUTION_COVER'`), leaving uninvolved faculty schedules untouched.
  3. Coordinates syllabus completion cut-offs with the Exam Coordinator via `ExamSyncRequest` in `academic.py`.

#### 2. Architecture Diagram

```mermaid
graph TD
    subgraph AcadWorkspace ["Academic Coordinator Workspace (/academic_coordinator)"]
        UI_SUB_MATRIX["Period Vacancy & Substitution Allocation Matrix"]
        UI_PACING_RADAR["Curriculum Syllabus Pacing Tracker"]
        UI_EXAM_SYNC["Inter-Coordinator Exam & Syllabus Sync Desk"]
    end

    subgraph AcadEngines ["Academic Coordination Services"]
        VACANCY_DETECT["Automated Period Vacancy Matcher"]
        SCOPED_INJECTOR["Scoped Substitution Proxy Injector"]
        EXAM_SYNC_ENG["Inter-Coordinator Syllabus vs Exam Alignment Service"]
    end

    subgraph AcadData ["Operational Persistence"]
        DB_TIMETABLE[("timetables")]
        DB_SUBS[("substitution_slots")]
        DB_STAFF_LEAVES[("staff_permissions")]
        DB_STAFF_ATT[("staff_attendance_daily")]
        DB_EXAM_SYNC[("exam_sync_requests")]
    end

    UI_SUB_MATRIX --> VACANCY_DETECT & SCOPED_INJECTOR
    SCOPED_INJECTOR --> DB_SUBS & DB_TIMETABLE
    UI_EXAM_SYNC --> EXAM_SYNC_ENG --> DB_EXAM_SYNC
```

#### 3. Database Schema Mapping
* `substitution_slots` (`id` PK, `period_number`, `class_name`, `subject`, `absent_teacher`, `substitute_teacher_id` FK, `status`, `notes`)
* `exam_sync_requests` (`id` PK, `title`, `class_name`, `subject`, `curriculum_lag_units`, `current_completion_pct`, `proposed_resolution`, `status`)

#### 4. End-to-End Workflow: Scoped Faculty Substitution & Proxy Timetable Reflection
```mermaid
sequenceDiagram
    autonumber
    actor TeacherA as Absent Teacher
    actor AcadCoord as Academic Coordinator
    participant API as FastAPI Backend (admin.py / teacher.py)
    participant DB as PostgreSQL DB
    actor TeacherB as Assigned Substitute (Mr. Deepak Rao)
    actor Student as Student Timetable

    TeacherA->>API: Apply for Sick Leave (Period 2, Class 8-B)
    API->>DB: INSERT INTO staff_permissions & substitution_slots (status='PENDING')
    AcadCoord->>API: POST /api/admin/substitutions/assign (slot_id=4, sub_id=4, name="Mr. Deepak Rao")
    API->>DB: UPDATE substitution_slots SET status='Assigned', substitute_teacher_id=4
    Note over API: Scoped Injection: Mutates Mr. Deepak Rao schedule strictly; preserves other teachers!
    API->>TeacherB: Schedule updated: Period 2 -> SUBSTITUTION_COVER ("Covering for Mr. Rajesh Sharma")
    API->>Student: Timetable reflects: "Period 2 Mathematics [Proxy: Mr. Deepak Rao]"
    API-->>AcadCoord: 200 OK (Proxy Assigned)
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
        ConfirmEnrollmentModal --> SISPushed: Atomic Transaction (Sequential Roll No + Fee Milestones)
    }

    state OperationalLifeCycle {
        SISPushed --> DailyAttendance: Baseline Present
        DailyAttendance --> LiveWebRTCClass: 10-Min Telemetry
        DailyAttendance --> SickLeaveApplied: Parent Uploads Prescription
        SickLeaveApplied --> TeacherLeaveReview: Teacher Prescription Viewer
        TeacherLeaveReview --> DynamicRegisterExcusal: is_on_leave = True
        
        LiveWebRTCClass --> HomeworkAssigned: Teacher Assign Modal
        HomeworkAssigned --> DualNotificationFanOut: Student Workspace + Parent Evening Slider
        DualNotificationFanOut --> SpeedGraderMarking: Student Uploads Work
        SpeedGraderMarking --> RemedialFocusTable: Score < 50%
        
        RemedialFocusTable --> BatchExamSchedule: Exam Coord Action
        BatchExamSchedule --> FinancialClearanceCheck: Accounts Hold Gate
        FinancialClearanceCheck --> StudentAdmitCardReady: Cleared (exam_clearance=True)
        FinancialClearanceCheck --> AdmitCardLocked: On Hold (exam_clearance=False)
        
        StudentAdmitCardReady --> LiveExamProctorStage: Today + Live + Unsubmitted
        LiveExamProctorStage --> ExamConcluded: Invigilator Signs Off
        ExamConcluded --> MarksModeration: Teacher Scores Entered
        MarksModeration --> ReportCardPublished: Withheld if On Hold, Delivered if Cleared
    }

    state FacultyAndPayrollCycle {
        TeacherLeaveApplied --> LeaveCategorized: CL, ML, OD, or LOP
        LeaveCategorized --> AdminDashboardPopUp: Principal Approval
        AdminDashboardPopUp --> ProxyAssigned: Scoped Substitute Injection
        AdminDashboardPopUp --> PayrollBatchGenerated: End of Month Run
        PayrollBatchGenerated --> LOPDeductionsComputed: (Basic/30)*LOP Days
        LOPDeductionsComputed --> FourEyePrincipalReview: High-Value Gate
        FourEyePrincipalReview --> CorporateWireDisbursed: Accounts Action
    }

    state FinancialCycle {
        SISPushed --> FeeInvoicing: 5 Milestones Seeded
        FeeInvoicing --> DynamicAging: Tiers 0-15d, 16-30d, 31-60d, 60d+
        DynamicAging --> OnlinePaymentSettled: Authentic 29x29 UPI QR
        OnlinePaymentSettled --> BankReconciliation: Reconcile Endpoint
        BankReconciliation --> FeeSettled: Defaulter Zeroed & Exam Hold Cleared
    }

    state ExitClearance {
        StudentExitInitiated --> LibraryClearance
        StudentExitInitiated --> AccountsClearance
        LibraryClearance --> ParentDigitalSign: CBSE Rule 44 Digital Stamp
        AccountsClearance --> ParentDigitalSign
        ParentDigitalSign --> AdminWetSignatureVerify: Physical Register Scan Verified
        AdminWetSignatureVerify --> StudentWithdrawn: Status Updated to 'Withdrawn'
        StudentWithdrawn --> RosterPruned: Excluded from Daily Teacher Registers
    }

    Inactive --> AdmissionsDesk: Lead Capture
    AdmissionsDesk --> OperationalLifeCycle
    AdmissionsDesk --> FinancialCycle
    OperationalLifeCycle --> FacultyAndPayrollCycle
    OperationalLifeCycle --> ExitClearance: Withdrawal Request
    FinancialCycle --> ExitClearance
    RosterPruned --> [*]: Archived in Vault
```

---

## 5. Architectural Decision Records (ADRs 001 – 014)

### ADR-001: Hierarchical Administrative Override Engine
* **Status:** Accepted | **Scope:** Cross-Role Governance
* **Decision:** Introduce a cross-cutting administrative override model (`is_admin_override`, `admin_override_reason`, `override_by_role`). Locks records against downstream reversal (returning `403 Forbidden`) and writes SHA-256 audit logs.

### ADR-002: Pessimistic Row Locking (`SELECT ... FOR UPDATE`)
* **Status:** Accepted | **Scope:** Concurrency & Payments
* **Decision:** Enforce pessimistic row locking in SQLAlchemy Async for PTM slot allocation (5-minute lease) and student fee deductions.

### ADR-003: Two-Phase Dual-Signature Exit Authorization
* **Status:** Accepted | **Scope:** Student Transfers
* **Decision:** Phase 1 requires Library and Accounts boolean sign-offs; Phase 2 requires Parent Digital Signature followed by Principal wet-signature verification.

### ADR-004: Decoupled WebRTC Telemetry Webhook Processing
* **Status:** Accepted | **Scope:** LiveKit Video Attendance
* **Decision:** Telemetry webhooks are ingested asynchronously by a background telemetry worker applying the 10-minute active attendance rule.

### ADR-005: Four-Eye Principle for Institutional Payroll & Capital Outflows
* **Status:** Accepted | **Scope:** Accounts & Principal
* **Decision:** Strict Maker-Checker architecture: Accounts Coordinator generates draft with LOP deductions; Principal reviews and authorizes; Accounts executes corporate wire disbursement.

### ADR-006: Atomic Batch Examination Scheduling & Dynamic Admit Cards
* **Status:** Accepted | **Scope:** Exam Coordinator
* **Decision:** Batch scheduling (`POST /api/exams/schedules/batch-class`) tags slots with unique `batch_id`. Student admit cards query live database schedules dynamically.

### ADR-007: Real-Time Dynamic Timetable Lifecycle Driven by ClockProvider
* **Status:** Accepted | **Scope:** Temporal Synchronization
* **Decision:** Centralized `ClockProvider` simulation hook drives timetable period transitions (`upcoming`, `live`, `completed`) on 30-second heartbeats.

### ADR-008: Reactive Client-Side Fee Ledger Sync with PostgreSQL Consistency
* **Status:** Accepted | **Scope:** Multi-Portal Sync
* **Decision:** FastAPI persists payments using row locks while client portals utilize a synchronized shared bus (`fee-ledger.ts`) to broadcast instant optimistic updates.

### ADR-009: Atomic Multi-Aggregate SIS Provisioning on Lead Conversion
* **Status:** Accepted | **Scope:** Admissions Inception
* **Decision:** All enrollment entities (`Student`, `Parent`, `User`, `FeeMilestones`, `AttendanceRecord`, `HallTicket`) are created within a single atomic database transaction.

### ADR-010: Inter-Coordinator Alignment Protocol for Curriculum & Exam Feasibility
* **Status:** Accepted | **Scope:** Academic & Exam Coordinators
* **Decision:** Formal `ExamSyncRequest` protocol enables Academic Coordinator to negotiate assessment blueprints or dates when curriculum delivery lags by $>1$ unit.

### ADR-011: Tri-Directional Notification Fan-Out for Student Academic Tasks
* **Status:** Accepted | **Scope:** Teacher, Student & Parent
* **Context:** Assigning homework in traditional LMS environments notifies only the student, resulting in missed assignments and zero parental oversight.
* **Decision:** `POST /api/teacher/homework` executes an automated dual notification fan-out: a high-priority academic task notification to the student cohort and an evening oversight task in the parent's "Tonight Verification Tasks" slider.
* **Consequences:** Maximizes student homework completion rates; creates transparent evening parent-child accountability.

### ADR-012: Dual-Custody Student Exit Lifecycle & Roster Status Invariant
* **Status:** Accepted | **Scope:** Admin, Parent & Teacher
* **Context:** Withdrawing students manually in legacy systems often left active students on daily attendance registers or allowed certificates to be issued without parent consent.
* **Decision:** Under CBSE Rule 44, exit clearance requires parent digital sign-off followed by Admin wet-signature register verification (`verify-physical`). Completing this verification updates the `Student.status` directly to `Withdrawn`. Active class rosters (`/api/teacher/students`) automatically filter out withdrawn students.
* **Consequences:** Eliminates legal liability; ensures clean attendance metrics; preserves archived historical records for compliance audits.

### ADR-013: Dynamic Surveillance Channel Segregation & Proctoring Liveness Guard
* **Status:** Accepted | **Scope:** Exam Coordinator & Teacher Invigilator
* **Context:** Unified WebSocket broadcast rooms flooded teachers with cross-class alerts and fired false malpractice warnings during off-hours.
* **Decision:** Surveillance channels are dynamically segregated by grade and section via `get_surveillance_room(class_name, section)` (e.g. `exam-room-class8-b`). Malpractice alerts in `/teacher` are gated strictly on active commenced exams (`localStorage.getItem('edu360_exam_commenced') === 'true'`).
* **Consequences:** Provides noise-free proctoring feeds; guarantees zero zombie alerts when no examination is live.

### ADR-014: Financial Fee Hold Gating on High-Stakes Academic Credentials
* **Status:** Accepted | **Scope:** Accounts, Exam & Student
* **Context:** Uncoordinated examination workflows allowed students with severe financial fee defaults to sit for internal exams and receive final term report cards without bursar clearance.
* **Decision:** Enforce an automated financial gate: students with `exam_clearance == False` have their admit card dockets locked (`is_on_hold = True`). Term report cards published by the Exam Coordinator redact marks memos (`overall_grade = 'WITHHELD'`, `grades_grid = {}`). Bank reconciliation of online payments automatically restores clearance.
* **Consequences:** Preserves institutional revenue compliance while providing an auditable Principal override path for emergency hardship cases.

---

## 6. Verification & Port Access Matrix

| Role | Portal Route | Primary Test Procedure | Expected System Outcome |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `http://localhost:3000/admin` | Verify physical scan on exit clearance (`/verify-physical`); toggle exam clearance on fee defaulter. | Student status transitions to `Withdrawn` and vanishes from active teacher register; student admit card unlocks instantly. |
| **Academic Coord** | `http://localhost:3000/academic_coordinator` | Assign substitute for Period 2 (`assign_substitution`); inspect substitute schedule. | Proxy period injected strictly into substitute teacher's schedule; proxy badge broadcast to student timetable. |
| **Exam Coord** | `http://localhost:3000/exam_coordinator` | Conclude live exam session (`/conclude`); publish batch report cards for Class 8-B. | Session marked `CONCLUDED` and student alerts cease; held students have report cards withheld, cleared students receive full grades. |
| **Accounts Coord** | `http://localhost:3000/accounts_coordinator` | Reconcile bank transaction (`/reconcile`); query dynamic aging defaulters. | Overdue balance automatically reduced; `exam_clearance` set to True; zero-due records filtered into settled ledger. |
| **Admissions Coord**| `http://localhost:3000/admissions_coordinator` | Convert CRM inquiry to student (`convert_enquiry_to_student`). | Dynamic sequential roll number allocated; 5 fee milestones structured; new student immediately functional across all portals. |
| **Teacher** | `http://localhost:3000/teacher` | Assign homework via new modal; take period roll call with absent student; inspect medical leave slip. | Dual notification dispatches to student and parent; parent receives absence chime; prescription slip renders in viewer modal. |
| **Secondary Student**| `http://localhost:3000/student` | Join LiveKit room as dynamic student; verify proxy teacher on timetable; inspect admit card under fee hold. | +5.5m check-in marks Present; timetable renders "Proxy: [Name]"; admit card displays fee hold warning banner if uncleared. |
| **Parent** | `http://localhost:3000/parent` | Pay fee milestone via Authentic 29x29 UPI QR; digitally sign TC exit clearance; check "Tonight Tasks". | Defaulter balance reduced without wiping ledger; TC clearance stamped; assigned homework appears in evening task slider. |
"""

with open(DOC_PATH, "w", encoding="utf-8") as f:
    f.write(content.strip() + "\n")

print(f"Successfully generated full v10.0 architecture spec with {len(content.splitlines())} lines.")
