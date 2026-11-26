# ABOUT EDU360 — Master Product Requirements Document (PRD)
## Unified Multi-Portal Institutional Management, Live Education, and Student Information System (SIS)

**Document Version:** 3.0 (Production Architecture Baseline — Hardened & Synchronized)  
**Target Segment:** K–12 Education (Nursery to Class 12)  
**Platforms:** Web Application (Admin, Coordinators, Teachers, Secondary Students) & Mobile Application (Parents, Companion PWA for Students/Teachers)  
**Target Audience:** Executive Leadership, System Architects, Full-Stack Engineers, UI/UX Designers, QA Engineers  
**Canonical File Locations:**
- Primary Canonical PRD: [`docs/prd/PRD.md`](file:///e:/Diradz/EDU360/docs/prd/PRD.md)
- About EDU360 Markdown: [`docs/ABOUT_EDU360.md`](file:///e:/Diradz/EDU360/docs/ABOUT_EDU360.md)
- Architectural Reference: [`docs/architecture/ROLE_WISE_ARCHITECTURE_AND_WORKFLOWS.md`](file:///e:/Diradz/EDU360/docs/architecture/ROLE_WISE_ARCHITECTURE_AND_WORKFLOWS.md)

---

## 1. Executive Summary & Product Vision

**EDU360** is an enterprise-grade, cloud-native **Educational Operating System & Student Outcomes Platform** engineered for K–12 institutions. Traditional School ERPs operate as disconnected, static digital registers that spam users with notifications and leave leadership blind to operational risks. 

EDU360 functions as a **Unified Action & Intelligence System** connecting **Administration, 4 Specialized Coordinators, Teachers, Parents, and Students** around five foundational product principles:

1. **Actionable Management Intelligence:** Highlights *what needs attention today, why it matters, and who needs to take action* via a real-time **Red / Orange / Green Priority Triage Engine** with purged inactive categories.
2. **Outcome-Oriented Parent Involvement & Tri-Directional Communications:** Eliminates spam via an **anti-spam moving-slider dashboard** on mobile, coupled with a shared **Student Focus Table**, multi-student family switching, and high-signal alerts (morning absence warnings and homework oversight).
3. **Zero Extra Burden for Teachers:** Automated attendance via **10-minute WebRTC telemetry rule**, period-wise subject attendance auto-excused upon approved leave, curriculum delivery checked off directly into PostgreSQL, homework assignment dual notification fan-out, and SpeedGrader browser canvas evaluation.
4. **Deterministic Time-Alignment & Governance-First Security:** The entire platform operates against a centralized **ClockProvider** simulation engine, synchronizing timetables, period bells, and exam lifecycles across all 8 portals, backed by HMAC-SHA256 tokens and pessimistic row locks (`SELECT ... FOR UPDATE`).
5. **Zero-Disruption Atomic SIS Onboarding:** Candidate conversions execute as single-pass transactional inceptions calculating sequential roll numbers, seeding annual fee milestones, linking parent accounts, and auto-populating teacher and exam rosters.

---

## 2. Platform Strategy & Multi-Portal Architecture

EDU360 follows a **Role-Optimized Platform Strategy** tailored to ergonomic workstation needs, user mobility, and task complexity across all **8 Canonical Roles**:

| User Role | Route / Portal | Primary Platform | Secondary Platform | Operational Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin / Principal** | `/admin` | **Web App (Desktop 1080p+)** | Mobile Web (Urgent alerts only) | High-density priority triage, institutional task delegation, statutory document vault locking, medical re-exam adjudication, and administrative overrides. |
| **Academic Coordinator** | `/academic_coordinator` | **Web App (Desktop/Laptop)** | Tablet Web | Curriculum pacing audit, conflict-free teacher timetable substitutions, faculty workload balancing, and inter-coordinator exam-syllabus sync. |
| **Exam Coordinator** | `/exam_coordinator` | **Web App (Desktop/Laptop)** | Tablet Web | Atomic batch class exam scheduling, hall deployment, seat allocation, financial clearance gating, dynamic admit cards, and re-exam scheduling. |
| **Accounts Coordinator** | `/accounts_coordinator` | **Web App (Desktop/Laptop)** | Tablet Web | Real-time 3-tier fee aging, authentic counter cash/cheque collection, fee structures, online bank reconciliation, and monthly staff payroll with LOP deductions (Maker). |
| **Admissions Coordinator** | `/admissions_coordinator` | **Web App (Desktop/Laptop)** | Mobile App / Tablet | 24/7 AI chatbot lead capture CRM, follow-up call tracking, and 1-click atomic conversion into SIS profiles with sibling discounts (15%) and parent-user linkage. |
| **Teachers** | `/teacher` | **Web App (Desktop/Laptop)** | Mobile App / Tablet | Desktop displays optimal for LiveKit classroom hosting, browser SpeedGrader annotation, homework assignment fan-out, PTM attendance & summary notes, and categorized staff leave. |
| **Parents** | `/parent` | **Mobile App (Android / iOS)** | Responsive Web | Mobile-first for on-the-go push notifications, multi-child family switching, 1-tap UPI fee payments with authentic QR codes, morning absence alerts, and PTM booking. |
| **Students (Secondary)** | `/student` | **Web App (Desktop/Laptop)** | Mobile App / Tablet (PWA) | Full-width displays for distraction-free LiveKit classes, digital notes, dynamic admit cards with seating details, online exams, and homework uploads. |

---

## 3. User Roles & Permission Matrix (RBAC & Governance)

> ⚠️ **Strict Document Security & Administrative Override Rule**:  
> 1. Official student documents in the **Student Information System (SIS)** can **ONLY** be uploaded, edited, or replaced by **Administration**. Teachers, Parents, and Students have strictly **View/Download-Only** access.  
> 2. The **Administrative Override Engine** grants Principal/Super Admin ultimate executive authority over student leaves, institutional SLAs, exam moderation, and fee overrides. When an executive override is stamped (`is_admin_override=True`), downstream roles (Teachers/Coordinators) are locked out (`403 Forbidden`) from reversing the action.  
> 3. **Secondary Profile Lock**: Only authenticated students (`role='student'`) may edit their secondary extracurricular profile and 2nd guardian emergency details.

| Module / System Capability | Super Admin / Principal | Academic Coordinator | Exam Coordinator | Accounts Coordinator | Admissions Coordinator | Teacher | Student | Parent |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Institutional Priority Triage & Tasks** | **Full (Executive)** | View / Action | View / Action | View / Action | View / Action | None | None | None |
| **SIS Official Document Vault Control** | **Full (Exclusive)** | View Only | View Only | View Only | View Only | View Only | View Only | View Only |
| **Administrative Override Engine** | **Full (Tier-3 Bypass)**| None | None | None | None | None | None | None |
| **Admissions CRM & SIS Conversion** | Full (Audit) | View Only | View Only | Fee Handshake | **Full (Lead CRM)** | None | None | None |
| **Atomic SIS Onboarding (Milestones/Roll)**| Full (Audit) | Auto-Roster | Auto-Roster | Auto-Invoice | **1-Click Convert**| Auto-Roster| View Profile| Multi-Child |
| **Sibling Linking & 15% Fee Discount** | Full (Audit) | None | None | Auto-Invoice | **Apply Link** | None | None | **Verify Link** |
| **Batch Exam Scheduling & Hall Alloc.** | Full (Audit) | Sync Pacing | **Full (Batch Eng)**| Fee Clearance | None | View Duty | View Admit | View Admit |
| **Inter-Coordinator Exam Sync Protocol**| Full (Audit) | **Request / Align**| **Resolve / Cutoff**| None | None | Pacing Feed | None | None |
| **Financial Fee Hold on Admit Cards** | **Override Hold** | None | **Enforce Hold** | **Manage Dues** | None | None | Gated Card | View Hold Alert|
| **Medical Re-Exam Scheduling** | **Approve Request** | Pacing Sync | **Schedule Hall/Date**| Fee Audit | None | Invigilate | View Admit | **Apply (Docs)**|
| **Dynamic Admit Card Generation** | Full (Audit) | View Only | **Full (Publish)** | Fee Clearance | None | View Only | **Download (Live)**| View Only |
| **Teacher Exam & Substitution Sync** | Full (Audit) | Manage Proxy | Invigilation Sync| None | None | **Live Schedule**| None | None |
| **Teacher Homework Assignment Fan-out** | Full (Audit) | Audit Pacing | None | None | None | **Assign HW** | **Receive Alert**| **Receive Alert**|
| **3-Tier Fee Aging & Counter Payment** | Full (Audit) | None | Clearance Lock | **Full (Counter Pay)**| None | None | View Status | **Pay (Online)**|
| **Bank Reconcile Ledger Auto-Settlement**| Full (Audit) | None | None | **Reconcile Ledger**| None | None | View Receipt| **Scan & Pay** |
| **Staff Payroll & LOP Deductions** | **Authorize (Checker)**| Workload Sync| None | **Draft Batch (Maker)**| None | View Payslip | None | None |
| **Live Online Class Hosting (WebRTC)** | Full (Audit) | Monitor Class | None | None | None | **Full (Host)** | Join / Replay | None |
| **Auto-Attendance (10-Min Rule)** | Full (Audit) | View Register | None | None | None | **Live Roster** | Status Stamp | View Child |
| **Morning Absence Critical Alert** | Full (Audit) | None | None | None | None | **Trigger Alert**| Status Stamp | **Receive Alert**|
| **SpeedGrader Inline Canvas Correction** | Full (Audit) | Audit Pacing | None | None | None | **Grade & Mark** | Submit / View| View Child |
| **Staff Leave (CL/SL/EL/LOP) Application**| **Approve / Reject** | Substitute Match| None | Payroll LOP Sync | None | **Apply / Track**| None | None |
| **PTM Slot Concurrency Booking (Locks)**| Full (Audit) | Faculty Audit | None | None | None | **Create Slots** | None | **Hold & Book** |
| **PTM Completion & Notes Governance** | Full (Audit) | **Attendance Audit**| None | None | None | **Mark & Summary** | None | **Receive Notes**|
| **Dual-Signature Student Exit / TC** | **Sign & Seal** | Inventory Sync| None | Dues Clearance | None | View Only | View Status | **Digital Sign** |

---

## 4. Key System Workflows

*All workflows include detailed Mermaid sequence diagrams and execution matrices in [`docs/prd/PRD.md`](file:///e:/Diradz/EDU360/docs/prd/PRD.md):*
- **Workflow 5.1**: Online Class Auto-Attendance & Morning Absence Parent Alert
- **Workflow 5.2**: Homework Assignment Fan-Out, Submission & SpeedGrader Studio
- **Workflow 5.3**: Parent-Teacher Meeting (PTM) Closed-Loop Lifecycle & Attendance Governance
- **Workflow 5.4**: Student Exit & Dual-Signature Legal Clearance (Withdrawn Status Transition)
- **Workflow 5.5**: Batch Class Examination Scheduling & Financial Fee Hold Gating
- **Workflow 5.6**: Four-Eye Staff Payroll Generation & LOP Deduction Clearance
- **Workflow 5.7**: Administrative Override & Governance Cascade
- **Workflow 5.8**: Inter-Coordinator Exam & Curriculum Pacing Sync (Academic $\times$ Exam $\times$ Teacher)
- **Workflow 5.9**: Medical Re-Examination Lifecycle (Parent $\to$ Admin $\to$ Exam Coordinator)

---

## 5. UI/UX Screen Checklist & Technology Stack
- Full Screen checklist for all 8 Portals + Notification Center & Dynamic Admit Cards.
- Production Tech Stack: Next.js 14/16 (React 18/19), FastAPI, PostgreSQL 15+ Async, LiveKit WebRTC, Centralized ClockProvider, Google Gemini Flash Vision API, `fee-ledger.ts`, and Authentic QR components.

---

*Verified & Synchronized for EDU360 Engineering, Design, and Product Operations.*
