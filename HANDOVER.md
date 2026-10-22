# EDU360: Project Handover & Agent Onboarding Guide

> **Document Version**: 4.0  
> **Last Updated**: 2026-10-18  
> **Primary Purpose**: Complete handover for developers and AI agents switching accounts or onboarding to the EDU360 monorepo.

---

## 📌 Executive Summary

**EDU360** is an **Action & Intelligence K–12 School Outcomes Platform**. It moves beyond passive administrative ERP registers into outcome-driven workflows:
* **Real-time Diagnostic Intelligence**: AI scans exam answer papers, diagnoses root misconceptions, and prescribes 1-week targeted practice sprints.
* **Zero-Friction Teacher Workflows**: 10-minute auto-attendance engine, in-browser homework speed grader with canvas drawing tools, faculty duty center, and section-filtered remedial tracking.
* **Unified Parent-School Co-Tracking**: GPS bus tracking, instant WhatsApp progress dispatches, sliding announcement carousels, and 1-on-1 PTM video conference scheduling.

---

## 🛠️ Monorepo Architecture & Running Services

### Active Local Services (Already Running)

| Service | Technology | Port / URL | Status | Working Directory |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | Python 3.11+, FastAPI, Uvicorn, SQLite | `http://localhost:8000`<br>Docs: `http://localhost:8000/docs` | 🟢 Running | `e:\Diradz\EDU360\backend` |
| **Frontend Web** | Next.js 16.4.0 (App Router), React 19, TypeScript, TailwindCSS | `http://localhost:3000` | 🟢 Running | `e:\Diradz\EDU360\frontend` |

> [!NOTE]
> When switching accounts or reloading the IDE, verify terminal processes before starting new ones. The servers run with:
> - Backend: `uvicorn main:app --reload --port 8000`
> - Frontend: `npm run dev`

---

## 📂 Key File & Directory Map

```text
e:\Diradz\EDU360/
├── AGENTS.md                          # Auto-discovered context rules for Antigravity agents
├── HANDOVER.md                        # This onboarding document
├── WORKFLOW_OF_FOCUS_TABLE.md         # Deep-dive architecture of the 1-Week Remedial feature
├── WALKTHROUGH.md                     # Comprehensive tour of all role portals built so far
├── backend/
│   ├── main.py                        # FastAPI entrypoint & CORS configuration
│   └── app/
│       ├── core/config.py             # Settings & database connection
│       ├── models/                    # SQLAlchemy models (User, Attendance, Homework, etc.)
│       ├── schemas/                   # Pydantic validation schemas
│       ├── routers/                   # Endpoints: auth, admin, teacher, parent, student
│       └── seed.py                    # Database seeder with realistic secondary school data
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx             # Root layout with ThemeProvider & RoleGuard
        │   ├── page.tsx               # Landing & Role Switcher
        │   ├── admin/page.tsx         # 🏛️ Administrator Command Center
        │   ├── teacher/
        │   │   ├── page.tsx           # 👩‍🏫 Comprehensive Teacher Portal (Duties, Homework, Focus Table)
        │   │   └── focus/[id]/page.tsx# 🎯 Dedicated 1-Week Remedial Sprint & Rough Notebook Review
        │   ├── student/page.tsx       # 🎒 Secondary Student Portal
        │   ├── junior/                # 🎈 Gamified K-5 Elementary Student Portal
        │   └── parent/page.tsx        # 👨‍👩‍👧 Parent Co-Tracking & GPS Portal
        ├── lib/
        │   ├── focus-data.ts          # 🧠 Remedial Intelligence Data Store (v4, Section-Based)
        │   ├── api.ts                 # Resilient HTTP client with fallback simulation
        │   ├── types.ts               # Global TypeScript domain definitions
        │   └── theme-context.tsx      # Dark / Light / System theme engine
        └── components/                # Reusable domain components (SpeedGrader, Bus Tracker, etc.)
```

---

## 🎯 Current State of the Codebase & Recent Milestones

### 1. Subject-Centric, Section-Filtered Remedial Focus Table
* **Faculty Scope**: Scoped to the teacher's subject (**Mathematics**, taught by Mrs. Ananya Verma).
* **Section Filter Tabs**: Rather than switching between subjects, teachers filter by the **sections they teach**:
  * `Class 8-B (Homeroom)` (3 students on plan)
  * `Class 8-A` (2 students on plan)
  * `Class 9-A` (2 students on plan)
  * `Class 9-B` (1 student on plan)
  * `All Sections` (8 students on plan)
* **Mastery Threshold Invariant**:
  * Students with Mid-Term scores $>70\%$ have demonstrated baseline mastery and are **exempt** from the focus table.
  * Only students scoring $\le 70\%$ are enrolled in the 1-Week (7-Day) Action Plan.
* **Section Benchmark Banner**: Displays dynamic Section Strength, Mastered (>70%), Improvement Batch count, and Section Average.

### 2. Dedicated 1-Week Action Plan Page (`/teacher/focus/[id]`)
* **State Machine Invariant**: Previous day work ($d < \text{current day}$) can **never** be "Upcoming". It is strictly toggled between `Completed ✓` and `Pending Review ⏳` via dedicated buttons.
* **Assigned Diagnostic Practice Questions**: The rough notebook review section displays the exact mathematical problems and teacher rubric checkpoints right above the student's solution steps.
* **Removal of Call Script**: Redundant telephonic call script card and "Copy Call Script" button removed; replaced by instant 1-click WhatsApp progress dispatch and PTM conference scheduling.

### 4. Academic Coordinator Workflows & Teacher Cross-Role Interlocks (v4.1.0)
* **Curriculum Syllabus Delivery**: Clerical `+1 Unit Delivered` removed from Academic Coordinator portal (`/academic_coordinator`). Pacing checkoff is self-serviced directly by assigned teachers in the Teacher Portal (`/teacher`) via `POST /api/teacher/curriculum/log-unit`. Academic Coordinator retains surveillance and 1-click Remedial Task dispatch (48h SLA).
* **Human-in-the-Loop SLA Breach Governance**: Never auto-escalates SLA countdown breaches to the Principal. Notifies the Academic Coordinator first with 3 action choices:
  * `[Grant Extension]` (+12h, +24h, +48h, +72h) via `POST /api/admin/tasks/{id}/extend-sla`.
  * `[Migrate Task]` to peer faculty with zero penalty on original teacher via `POST /api/admin/tasks/{id}/approve-relief`.
  * `[⚠️ Escalate to Principal]` with rationale via `POST /api/admin/tasks/{id}/escalate`.
* **Task Relief & Workload Rebalancing**: Teachers experiencing medical emergencies or exam workload surges click `[Request Task Relief / Migration]` on any task in `/teacher`. This pauses the SLA and alerts the Academic Coordinator.
* **Timetable Substitution Sync**: Assigning a substitute teacher in `/academic_coordinator` dynamically calls `inject_substitution_period` in FastAPI, auto-badging a `SUBSTITUTION_COVER` period in the substitute's daily personal schedule in `/teacher`.
* **Institutional PTM Event Governance**:
  * Coordinator monitors school-wide faculty readiness (`readiness_percentage%`), published slots, and remedial focus table briefs via `GET /api/admin/ptm/governance`.
  * 1-click `[📢 Remind Defaulting Teachers]` broadcasts urgent 6-hour SLA publishing tasks via `POST /api/admin/ptm/remind-unready`.
  * Parents self-book 10-minute sliding slots without teacher phone calls.

---

## ⚡ Account Switching Quickstart (For Your Next Chat)

When you sign into your new Antigravity account and open this workspace, paste this prompt into the chat:

```text
Hi! We are developing EDU360 (Next.js 16 + FastAPI). 
Please read AGENTS.md, HANDOVER.md, and WORKFLOW_OF_FOCUS_TABLE.md at the workspace root to get up to speed with our current progress and recent focus table updates.
```
