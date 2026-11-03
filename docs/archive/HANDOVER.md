# EDU360: Master Project Handover & Agent Onboarding Guide

> **Document Version**: 5.1 (Living Monorepo Handover)  
> **Last Updated**: November 2026  
> **Primary Purpose**: Master technical onboarding, architectural boundaries, and state of the application for developers and AI agents picking up the EDU360 codebase.

---

## 📌 Executive Summary

**EDU360** is an **Action & Intelligence K–12 Virtual & Hybrid School Outcomes Platform**. It moves beyond passive administrative ERP registers into active, automated pedagogical and operational workflows:
* **Real-time Diagnostic Intelligence**: AI scans descriptive exam answer papers, diagnoses root misconceptions, and auto-enrolls students scoring $\le 70\%$ into 1-week targeted practice sprints.
* **Closed-Loop Attendance & Leave Triage**: Parent leave requests sync directly to the teacher roster. When approved by the teacher, absences are marked "Excused" and automatically filtered out of the Administrator Priority Triage chronic absenteeism alert.
* **Strict Marks Handshake & Teacher Gradebook Lock**: Teachers evaluate answer sheets and commit marks once (`is_locked = true`). Gradebooks become strictly read-only, preventing post-submission modifications and forwarding grades to the Exam Coordinator for consolidated report card compilation.
* **Isolated Multi-Child Parent Portal**: Parents with multiple wards (e.g., Aarav in Class 8-B, Ananya in Class 3-A) switch context seamlessly from a single login with 100% isolated PTM conferences, fee ledgers, and gradebooks.
* **Pure Virtual K–5 Gamified Dashboard (`/junior`)**: A distraction-free, playful environment bound 1:1 to junior students (Ananya Sharma, Class 3-A). Free from unnecessary physical logistics (no bus tracking) and privacy-invasive audio persistence.
* **Instant Multi-Subject Parent-Teacher Chat**: Real-time cross-tab push via `BroadcastChannel` with fallback polling for direct 1-on-1 dialogue with all subject teachers.

---

## 🛠️ Monorepo Architecture & Running Services

### Active Local Services

| Service | Technology | Port / URL | Status | Working Directory |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | Python 3.11+, FastAPI, Uvicorn, SQLAlchemy (Async SQLite) | `http://localhost:8000`<br>Docs: `http://localhost:8000/docs` | 🟢 Running | `e:\Diradz\EDU360\backend` |
| **Frontend Web** | Next.js 16.4.0 (App Router), React 19, TypeScript, TailwindCSS v4 | `http://localhost:3000` | 🟢 Running | `e:\Diradz\EDU360\frontend` |

### Environment Verification Commands:
```powershell
# Frontend TypeScript Build Verification (Zero Errors Mandate)
node frontend/node_modules/typescript/bin/tsc -p frontend/tsconfig.json --noEmit

# Backend Syntax & Compile Check
backend\venv\Scripts\python.exe -m py_compile backend/app/routers/admin.py backend/app/routers/exams.py
```

---

## 📂 Key Codebase & Directory Map

```text
e:\Diradz\EDU360/
├── docs/
│   ├── archive/
│   │   ├── HANDOVER.md                # 🤝 This Master Onboarding & Architecture Guide
│   │   └── WALKTHROUGH.md             # 📖 Comprehensive End-to-End Feature Tour
│   ├── workflows/                     # Role-wise daily workflow diagrams & KT materials
│   └── prd/                           # Master PRD and functional specifications
├── backend/
│   ├── main.py                        # FastAPI entrypoint & CORS middleware
│   └── app/
│       ├── core/                      # Config, SQLite async database engine
│       ├── models/models.py           # SQLAlchemy ORM models
│       ├── schemas/schemas.py         # Pydantic v2 validation contracts
│       ├── routers/                   # Modular REST endpoints (admin, teacher, parent, student, exams, accounts, hr)
│       └── seed.py                    # Complete demo database seed script
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx             # Root layout with ThemeProvider & RoleGuard
        │   ├── page.tsx               # Landing & Role Switcher
        │   ├── admin/page.tsx         # 🏛️ Administrator Command Center & Priority Triage
        │   ├── academic_coordinator/  # 🎓 Academic Coordinator (SLA, Substitution, Syllabus)
        │   ├── exam_coordinator/      # 📝 Exam Cell (Secrecy Vault, Hall Tickets, Report Cards)
        │   ├── accounts_manager/      # 💳 Accounts & Fee Defaulter Outflow Desk
        │   ├── hr_head/               # 👥 HR & Faculty Grievance Management
        │   ├── inventory_manager/     # 📦 Laboratory & Digital Asset Inventory
        │   ├── teacher/               # 👩‍🏫 Comprehensive Teacher Portal (Duties, Homework, Focus Table, Evaluation)
        │   ├── student/page.tsx       # 🎒 Secondary Student Portal (Classes 6–12)
        │   ├── junior/page.tsx        # 🎈 Elementary Gamified Student Portal (K–5)
        │   └── parent/page.tsx        # 👨‍👩‍👧 Multi-Child Parent Co-Tracking Portal
        ├── components/                # Modular domain components (SpeedGrader, Chat, Portfolios)
        └── lib/
            ├── api.ts                 # Type-safe API client with resilient in-memory mock fallback state
            ├── types.ts               # Domain TypeScript interfaces
            └── focus-data.ts          # Remedial Intelligence state engine
```

---

## 🎯 Current State of the Codebase & Recent Milestones

### 1. Leave to Attendance & Admin Triage Closed Loop
* **Workflow**: Parent applies for medical/casual leave in `/parent` $\to$ Teacher reviews and approves in `/teacher` $\to$ Student attendance updates to `Excused Leave` $\to$ Student is automatically removed from the daily unexcused absence count.
* **Admin Triage Filter**: `get_triage_alerts` in `backend/app/routers/admin.py` and `frontend/src/lib/api.ts` filters out approved leaves, preventing false alarms in the "Chronic Absenteeism Telemetry" early-warning card.

### 2. Marks Handshake & Teacher Gradebook Lock
* **One-Time Seal**: When a teacher finishes paper evaluation or OCR grading and clicks `Submit Final Grades to Exam Cell (One-Time Lock)`, the exam status updates to `is_locked = true`.
* **Immutability Invariant**: Further manual edits in the Evaluation Studio are disabled (`Read-Only: Marks Sealed`).
* **Exam Coordinator Aggregation**: Marks are forwarded to the Exam Coordinator (`/exam_coordinator`) for multi-subject moderation and release of consolidated Report Cards with Gemini AI pedagogical narratives.

### 3. K–5 Gamified (`/junior`) Clean-Up & Ananya Linkage
* **Identity Context**: Bound strictly to **Ananya Sharma (Class 3-A, Roll #8, student_id: 7)**.
* **Zero Sibling Confusion**: Removed redundant sibling switcher button from student login; multi-child switching is strictly restricted to parent accounts.
* **Virtual School Optimization**: Removed obsolete physical bus radar component (`YellowBusRadar.tsx`).
* **Privacy-Compliant Phonics**: Phonics studio features delightful browser-side audio feedback without storing minor voice audio on the server (ensuring COPPA & DPDP Act compliance).

### 4. Multi-Subject Parent-Teacher Chat with 0ms Cross-Tab Sync
* **Directory**: Parents can initiate 1-on-1 direct message threads with any assigned subject faculty (Mathematics, Science, English, etc.) or Homeroom mentor.
* **BroadcastChannel Push**: Uses `new BroadcastChannel('edu360_chat_channel')` across tabs. When a teacher replies in one tab, the parent tab updates instantly without waiting for the 3.5s background polling cycle.

### 5. Multi-Child Parent Sibling Management
* **Dual Kids Isolation**: Siblings (e.g. Aarav in 8-B and Ananya in 3-A) have completely independent schedules, fee ledgers, homework submissions, and PTM slots.
* **Sibling Registration Flow**: System verifies existing parent phone number during registration, prompting to link as a sibling profile while keeping academic profiles strictly separated.

---

## ⚡ Account Switching Quickstart (For Your Next Chat)

When you open this workspace in a new chat or account, paste this prompt:

```text
Hi! We are developing EDU360 (Next.js 16 + FastAPI). 
Please read docs/archive/HANDOVER.md and docs/archive/WALKTHROUGH.md to get up to speed with our monorepo architecture, role workflows, and recent state updates.
```
