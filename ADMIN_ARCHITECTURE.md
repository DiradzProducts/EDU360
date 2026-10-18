# EDU360 Admin Architecture Specification
**Enterprise School Operations, Governance & Compliance Platform**  
*Document Version: 1.0.0 | Academic Year 2026–2027*  
*Authors: Principal Architecture Group (/UI Designer, /Frontend Developer, /Backend Architect, /Software Architect, /Trend Researcher)*

---

## 1. Executive Summary & Vision

The **EDU360 Administrator Role** serves as the central operational nerve center of the K–12 institutional ecosystem. Designed to surpass traditional legacy Student Information Systems (SIS) and modern school ERP benchmarks (**PowerSchool**, **Toddle**, **Veracross**, **Teachmint**, and **Alma**), the EDU360 Admin Portal unifies daily frontline workflows, academic faculty operations, financial realization, and immutable regulatory compliance into a unified, high-performance interface.

### Architectural Tenets
1. **Zero-Latency Operational Awareness**: Live counters, proactive triage alerts, and automated conflict detection minimize administrative friction.
2. **Contract-First & Type-Safe Integrity**: Strict OpenAPI schemas in FastAPI mirrored 1:1 with TypeScript type definitions ensure zero runtime discrepancies.
3. **Immutable Compliance by Design**: Critical operations (document stamping, TC clearance, fee reminders, class rollovers) generate cryptographically verifiable audit trails with SHA-256 seals.
4. **Resilient Dual-Mode Execution**: Every interface component operates seamlessly with live FastAPI microservices or offline mock fallbacks with optimistic local state updates.
5. **Accessibility & Aesthetic Excellence**: WCAG AA contrast compliance, dark/light theme persistence, fluid responsive grids, and sticky dual-scroll layouts.

---

## 2. Competitive Benchmark & Gap Analysis

To deliver state-of-the-art school administration, EDU360 was benchmarked against the world's leading school management systems:

| Dimension | Legacy SIS (PowerSchool / Alma) | Modern Suite (Toddle / Teachmint) | Enterprise SIS (Veracross) | EDU360 Architecture |
| :--- | :--- | :--- | :--- | :--- |
| **Substitution & Proxy Coverage** | Manual phone calls and spreadsheet logging. | Period matrix with basic clash check. | Limited to faculty calendar invites. | **Automated Proxy Engine**: Real-time vacancy matrix + standby free faculty roster + **1-Click AI Auto-Resolve**. |
| **Audit & Governance Ledger** | Server log text files accessible only to database administrators. | Minimal activity timestamps. | Role-based audit history tables. | **Cryptographic Audit Ledger**: Tamper-proof SHA-256 seal per event, search, category filters, and CSV/JSON export. |
| **Fee Collection & Recovery** | Batch invoices with static overdue flags. | Simple milestone payment links. | Accounts receivable aging reports. | **Institutional Fee Realization Engine**: Target vs Realized metrics, 3-tier aging risk portfolio (0–15d, 16–30d, 30+d), and batch WhatsApp dispatch. |
| **Academic Year Rollover** | Complex multi-day manual batch jobs prone to data loss. | Simple grade tier increment without retention governance. | Strict database scripts executed by professional services. | **Promotion Pipeline**: Class-by-class progression (AY 2026–27 ➔ 2027–28), retention review triage, teacher assignment, and sealed archival. |

---

## 3. High-Level System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CLIENT APPLICATION (Next.js 16)                              │
│                                                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ FIXED LEFT SIDEBAR   │  │ MAIN SCROLLING WORKSPACE CANVAS                                   │  │
│  │ (Width: 256px / 72px)│  │                                                                  │  │
│  │                      │  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │ 1. Daily Operations  │  │  │ Top Executive Metrics Bar (10 Responsive Metric Tiles)     │  │  │
│  │    • Triage Alerts   │  │  └────────────────────────────────────────────────────────────┘  │  │
│  │    • Front-Desk CRM  │  │                                                                  │  │
│  │    • Tasks & Ops     │  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │                      │  │  │ Active Suite View Canvas:                                  │  │  │
│  │ 2. Faculty & Academics│ │  │  • Substitutions & Proxy Engine                            │  │  │
│  │    • Substitutions   │  │  │  • Security Audit Ledger (SHA-256)                         │  │  │
│  │    • Faculty Roster  │  │  │  • Fee Realization & Aging Analytics                       │  │  │
│  │    • Permissions     │  │  │  • Annual Academic Rollover Pipeline                       │  │  │
│  │    • Rollover Engine │  │  │  • SIS Vault & Exit Clearances                             │  │  │
│  │                      │  │  │  • Asset Inventory & Store Management                      │  │  │
│  │ 3. Finance & Logistics│ │  └────────────────────────────────────────────────────────────┘  │  │
│  │    • Fee Milestones  │  │                                                                  │  │
│  │    • Fleet Bus Radar │  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │    • Asset Inventory │  │  │ Interactive Modal Layer (Proxy, Rollover, SIS Doc, Tasks)  │  │  │
│  │                      │  │  └────────────────────────────────────────────────────────────┘  │  │
│  │ 4. Regulatory & Legal│  └──────────────────────────────────────────────────────────────────┘  │
│  │    • SIS Vault & TC  │                                                                        │
│  │    • Audit Ledger    │                                                                        │
│  └──────────────────────┘                                                                        │
└─────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │ HTTP REST / JSON API (Reverse Proxy: 8000)
┌─────────────────────────────────▼────────────────────────────────────────────────────────────────┐
│                                   BACKEND SERVICES (FastAPI Microservices)                       │
│                                                                                                  │
│  ┌────────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────────────┐  │
│  │ Admin Core Router      │  │ Substitution Engine    │  │ Financial & Rollover Service      │  │
│  │ • /api/admin/triage    │  │ • /api/admin/subs      │  │ • /api/admin/fees/analytics       │  │
│  │ • /api/admin/tasks     │  │ • /api/admin/subs/auto │  │ • /api/admin/fees/remind-all      │  │
│  │ • /api/admin/enquiries │  │ • /api/admin/subs/free │  │ • /api/admin/rollover/preview     │  │
│  │ • /api/admin/audit-logs│  │ • /api/admin/subs/asgn │  │ • /api/admin/rollover/promote     │  │
│  └────────────────────────┘  └────────────────────────┘  └───────────────────────────────────┘  │
└─────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │ ORM / Persistence Engine
┌─────────────────────────────────▼────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE & COMPLIANCE LEDGER (PostgreSQL / SQLite)                │
│                                                                                                  │
│  • staff_members                 • teacher_permissions       • substitution_slots                │
│  • fee_milestones                • student_fee_ledger        • fee_defaulters_registry           │
│  • academic_classes              • student_enrolments        • security_audit_trail (SHA-256)    │
│  • official_documents (Vault)    • exit_clearances           • inventory_records                 │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Detailed Enterprise Modules

### 4.1 Timetable Substitution & Period Coverage Engine
*Benchmark: Toddle Faculty Workflow & Teachmint Proxy Engine*

#### Functional Overview
When teachers take leaves (casual, medical, emergency) or obtain short-duration movement permissions, school administrators face unmanned classrooms. The Substitution Engine eliminates chaos through real-time vacant period detection and automated proxy faculty matching.

#### System Specifications
- **Automatic Vacancy Detection**: Automatically creates `SubstitutionSlot` records whenever a `TeacherPermission` is approved.
- **Conflict-Free Proxy Search**: Evaluates all active educators in the department and school to verify who is on duty, has zero assigned teaching periods in that slot, and has the minimum proxy load today.
- **1-Click AI Auto-Resolve**: Evaluates all unassigned slots and assigns best-fit teachers in milliseconds, updating all classroom schedules instantly.
- **Handover Notes Protocol**: Administrators or departing teachers can attach syllabus directives and worksheet references directly to the proxy assignment.

#### API Contract
- `GET /api/admin/substitutions` ➔ List of all timetable slots today with status (`Unassigned`, `Assigned`, `Completed`).
- `GET /api/admin/substitutions/available-faculty` ➔ Standby faculty roster with free period indices and daily proxy count.
- `POST /api/admin/substitutions/assign` ➔ Assign specific faculty to period slot with optional notes.
- `POST /api/admin/substitutions/auto-resolve` ➔ Autonomous proxy allocation matrix algorithm.

---

### 4.2 Security & Regulatory Compliance Audit Ledger
*Benchmark: Veracross Compliance Standard & PowerSchool Security Audit*

#### Functional Overview
Modern school boards (CBSE, ICSE, IB, Cambridge) and legal frameworks require immutable logs for critical record modifications. The Audit Ledger logs all high-stakes administrator actions into an immutable, cryptographically verifiable ledger.

#### Audit Coverage
1. **Document Control**: Official certificate uploads (Bonafide, TC, Medical), deletion, or vault lock.
2. **Financial Operations**: Batch fee reminders, waiver approvals, manual receipt generations.
3. **Faculty Permissions**: Leave approvals, emergency exits, manual proxy reassignments.
4. **Student Lifecycle**: Class rollover executions, student withdrawals, exit clearance physical signature stamps.
5. **Identity & Access**: Administrative logins, role switches, client code changes.

#### Cryptographic Seal Protocol
Each log entry contains:
- `timestamp`: UTC ISO-8601 millisecond-precision timestamp.
- `actor_name` & `actor_role`: Identity of the administrator or system process.
- `action_type` & `target_entity`: Exact domain verb and affected entity ID.
- `ip_address`: Network origin of request.
- `status`: Verification result (`SUCCESS`, `VERIFIED`, `FLAGGED`).
- `hash_seal`: SHA-256 hash chaining previous record signature for tamper-evidence.

#### API Contract
- `GET /api/admin/audit-logs` ➔ Query logs with pagination, actor search, and category filtering.
- `POST /api/admin/audit-logs/export` ➔ Export certified audit trail with checksum seal in JSON/CSV format.

---

### 4.3 Institutional Fee Realization & Aging Analytics
*Benchmark: Toddle Financial Suite & Blackbaud Tuition Management*

#### Functional Overview
School viability depends on predictable cash flow. Rather than static fee tables, the Fee Realization Engine provides real-time portfolio intelligence, risk-tier aging analysis, and automated multi-channel debt recovery.

#### Key Metrics & Risk Tiers
1. **Total Budget Target**: Institutional fee expected across all active students for AY 2026–2027.
2. **Realized In Bank**: Reconciled collections verified via automated payment gateways (UPI, Razorpay, NetBanking).
3. **Pending Overdue**: Total uncollected receivables currently past due dates.
4. **Aging Portfolio Analysis**:
   - **0–15 Days (Early Overdue)**: Automated SMS & push notification reminders.
   - **16–30 Days (Mid-Tier Overdue)**: Automated WhatsApp statement + direct UPI link.
   - **30+ Days (Critical Follow-Up)**: Tele-caller registry with priority outreach flags for administration.

#### API Contract
- `GET /api/admin/fees/analytics` ➔ Real-time realization rates, amounts, and aging bucket breakdown.
- `POST /api/admin/fees/remind-all` ➔ 1-Click batch reminder dispatch across WhatsApp, SMS, and Parent Portal push notifications.

---

### 4.4 Annual Academic Rollover & Student Promotion Engine
*Benchmark: PowerSchool End-of-Year Rollover & Alma Student Progression*

#### Functional Overview
At the conclusion of the academic year, transferring hundreds of students to the next grade tier is fraught with risk (accidental student omission, record corruption, teacher mismatch). The Rollover Engine implements a safe, class-by-class progression pipeline.

#### Progression Pipeline
```
Class 1-A (32 Students) ───────► Class 2-A (30 Promoted, 2 Review)
Class 3-A Junior (28 Students) ──► Class 4-A Junior (27 Promoted, 1 Review)
Class 8-A (42 Students) ───────► Class 9-A (40 Promoted, 2 Review)
Class 9-B (46 Students) ───────► Class 10-B (45 Promoted, 1 Review)
```

#### Governance Rules
- **Academic & Attendance Threshold Validation**: Students meeting attendance (≥ 75%) and passing grades are flagged as `Eligible for Auto-Promotion`.
- **Retention / Attention Quarantine**: Students flagged for attendance shortage or low score averages are placed in `Retention Review` for manual Principal sign-off.
- **Section & Teacher Re-allocation**: Target grade section and senior class teacher are configured before final promotion.
- **Permanent Archival**: Historical 2026–2027 transcripts, report cards, and fee ledgers are permanently sealed and archived with immutable hashes.

#### API Contract
- `GET /api/admin/rollover/preview` ➔ Class progression cohorts, student eligibility counts, and retention flags.
- `POST /api/admin/rollover/promote` ➔ Executes atomic cohort rollover, updates SIS rosters, and logs event to audit ledger.

---

## 5. UI/UX Architecture & Layout System

### 5.1 Left-Sidebar Navigation Architecture
The Admin Portal features a **sticky, fixed left-sidebar (`w-64` / collapsed `w-18`)** with independent canvas scrolling. Navigation items are structured into 4 enterprise operational suites:

```
┌──────────────────────────────────────────────┐
│  Dr. Sunita Kapoor                           │
│  Principal & Super Admin (EDU-GLOBAL-360)    │
├──────────────────────────────────────────────┤
│  DAILY OPERATIONS                            │
│  • Triage Alerts & Crisis Desk         [ 2 ] │
│  • Front-Desk Admissions CRM           [ 6 ] │
│  • Operational Task Board              [ 4 ] │
├──────────────────────────────────────────────┤
│  FACULTY & ACADEMICS                         │
│  • Substitution & Coverage             [ 2 ] │
│  • Faculty Roster & Duties             [ 5 ] │
│  • Leave & Movement Permissions        [ 1 ] │
│  • Academic Rollover & Promotion       [ 3 ] │
├──────────────────────────────────────────────┤
│  FINANCE & LOGISTICS                         │
│  • Fee Milestones & Realization        [30 ] │
│  • Yellow Bus Fleet Radar              [Live]│
│  • Campus Assets & Inventory           [ 5 ] │
├──────────────────────────────────────────────┤
│  REGULATORY & LEGAL                          │
│  • SIS Document Vault & TC             [ 1 ] │
│  • Security Audit Ledger (SHA-256)     [Live]│
└──────────────────────────────────────────────┘
```

### 5.2 Responsive Metrics Strip
The top of the workspace hosts **10 responsive metrics tiles** summarizing institutional vitals:
1. `Critical Triage Alerts` (Red status if > 0)
2. `Active Enquiries / CRM`
3. `Overdue Fee Accounts` (Amber status)
4. `Physical TC Clearances Pending`
5. `Staff Present Rate` (e.g. 96.8%)
6. `Unmanned Period Gaps` (Rose status if > 0)
7. `Bus Fleet Tracking` (Live active vehicles)
8. `Low Inventory Stock Alerts`
9. `Open Operational Tasks`
10. `Security Audit Integrity` (Verified green badge)

---

## 6. Security, Authentication & Role Isolation

### 6.1 Role Guard Enforcement
Every administrative page route is wrapped with `<RoleGuard allowedRole="admin">`. If an unauthorized role (Teacher, Student, Parent) attempts access:
- An explicit **403 Forbidden Boundary** modal is rendered.
- The user is notified of the boundary violation with their active credentials.
- Safe 1-click redirects guide them back to their authorized role portal or login screen.

### 6.2 Session Synchronization
Authentication is maintained via `AuthContext` with synchronized `localStorage` caching (`edu360_active_user`). Demo persona switching allows instant administrative switching during testing without requiring complex credential re-entry.

---

## 7. Operational Runbook & Verification Steps

### Starting the Platform
```bash
# Terminal 1: Backend FastAPI Microservice
cd e:\Diradz\EDU360\backend
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend Next.js Client
cd e:\Diradz\EDU360\frontend
npm run dev
```

### Verifying Admin Endpoints via Shell
```powershell
# 1. Verify Timetable Substitutions
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/substitutions" -Method GET

# 2. Verify Security Audit Logs
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/audit-logs" -Method GET

# 3. Verify Fee Financial Realization
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/fees/analytics" -Method GET

# 4. Verify Academic Rollover Cohort Preview
Invoke-RestMethod -Uri "http://localhost:8000/api/admin/rollover/preview" -Method GET
```

### Type Checking & Build Validation
```bash
cd e:\Diradz\EDU360\frontend
npm run build
```
*Result: 0 errors across all TypeScript definitions, components, and pages.*

---

## 8. Summary of File Modifications

| File Path | Nature of Change | Description |
| :--- | :--- | :--- |
| `backend/app/schemas/schemas.py` | Addition | Pydantic response and request models for substitution, audit, fee analytics, and rollover. |
| `backend/app/routers/admin.py` | Addition | 6+ REST API endpoints with auto-resolve algorithms and audit ledger export. |
| `frontend/src/lib/types.ts` | Addition | Exported TypeScript interfaces matching backend models with compatibility aliases. |
| `frontend/src/lib/api.ts` | Addition | Client API methods with offline fallback data and simulated latency. |
| `frontend/src/app/admin/page.tsx` | Enhancement | Left-sidebar grouping, executive metric cards, 3 full tab suites, financial analytics banner, and 2 interactive workflow modals. |
| `frontend/src/app/login/page.tsx` | Enhancement | 1-Click persona sign-in and direct role redirect synchronization. |
| `frontend/src/components/junior/JuniorStudentDashboard.tsx` | Type-Safety | Nullish coalescing operators on timetable properties. |
| `frontend/src/app/teacher/page.tsx` | Prerender Fix | Deterministic mock dates to guarantee clean static generation during `next build`. |

---
*EDU360 — Transforming Institutional School Management with Intelligence, Speed, and Rigor.*
