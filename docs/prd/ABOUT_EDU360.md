# ABOUT EDU360 — Master Product Requirements Document (PRD)
## Unified Multi-Portal Institutional Management, Live Education, and Student Information System (SIS)

**Document Version:** 2.5 (Production Architecture Baseline — Cross-Role Synchronized)  
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

## 4. Key System Workflows

*All workflows include detailed Mermaid sequence diagrams and execution matrices in [`docs/prd/PRD.md`](file:///e:/Diradz/EDU360/docs/prd/PRD.md):*
- **Workflow 5.1**: Online Class Auto-Attendance & Consecutive Absence Triage
- **Workflow 5.2**: Homework Submission, SpeedGrader Inline Canvas & Focus Table
- **Workflow 5.3**: Parent-Teacher Meeting (PTM) Closed-Loop Lifecycle & Attendance Governance
- **Workflow 5.4**: Student Exit & Dual-Signature Legal Clearance
- **Workflow 5.5**: Batch Class Examination Scheduling & Dynamic Admit Card Delivery
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
