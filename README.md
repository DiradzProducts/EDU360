# 🎓 EDU360 — K–12 Online Academy Outcomes & Active Intelligence Platform

> **Modern Monorepo Stack**: Next.js 16.4.2 (App Router / Turbopack) + Python 3.11+ FastAPI (Async ASGI Monolith) + SQLite / PostgreSQL  
> **Target Scope**: 100% Pure Online Virtual Schooling / Virtual K–12 Academies  
> **Canonical Core**: The 8 Canonical Institutional Roles (Zero Physical Transport / Inventory Overhead)

---

## 🌟 What is EDU360?

Traditional School ERPs (Fedena, Entab, Teachmint, Lead School) operate as **passive digital registers**. They record attendance after the fact, archive marks memos in disconnected tables, issue generic receipts, and inundate parents with unread WhatsApp broadcasts.

**EDU360** is engineered as an **Active Intelligence & Outcomes Engine** specifically architected for virtual K–12 academies. It unites Administration, Academic Governance, Examinations, Accounts, Admissions, Faculty, Students, and Parents into a closed-loop real-time ecosystem governed by three core philosophies:

1. **Actionable Governance Intelligence**: Dynamic Red/Orange/Green Priority Triage Engine evaluates learning drops, consecutive absences, and fee arrears every 60 seconds.
2. **Outcome-Oriented Parent Co-Tracking**: Anti-spam moving announcement carousel + 1-Week Shared Remedial Focus Sprint table with 10-minute nightly rough-work verification.
3. **Zero Extra Clerical Burden for Faculty**: 10-Minute auto-attendance webhooks, in-browser SpeedGrader canvas with digital red pen, and 1-click syllabus pacing synchronization.

---

## 🏛️ The 8 Canonical Online Academy Roles

| # | Role | Route | Description & Mission |
| :- | :--- | :--- | :--- |
| **1** | 🛡️ **Super Admin / Principal** | `/admin` | Institutional cockpit, Priority Triage (Red/Orange/Green), CBSE compliance audit logs, and dual-signature exit clearance. |
| **2** | 🧭 **Academic Coordinator** | `/academic_coordinator` | Curriculum pacing surveillance, AI Timetable Governor (dynamic substitutions), and faculty SLA workload relief. |
| **3** | 📋 **Exam Coordinator** | `/exam_coordinator` | Exam scheduling, question blueprint locks (72h prior), accounts-gated hall tickets, and paper moderation distribution. |
| **4** | 💳 **Accounts Coordinator** | `/accounts_coordinator` | Real-time arrears aging buckets (0–15d, 16–30d, 30+d), fee waivers, bank reconciliation, and exam clearance overrides. |
| **5** | 🎯 **Admissions Coordinator** | `/admissions_coordinator` | Virtual intake CRM, telephonic call notes & temperature tracking, and 1-click atomic SIS student conversion. |
| **6** | ✏️ **Teacher Portal** | `/teacher` | 10-Min auto-attendance, in-browser SpeedGrader with digital red pen, 1-Week Remedial Focus Table, and syllabus delivery logging. |
| **7** | 🎒 **Student Portals** | `/student` & `/junior` | Secondary LMS (1-click video join, homework dropzone, AI Socratic Doubt Tutor) + Junior K–5 gamified adventure quest map. |
| **8** | 👨‍👩‍👧 **Parent Portal** | `/parent` | Anti-spam moving announcement carousel, 10-minute nightly rough-work sign-off, live class radar, and instant fee checkout. |

---

## 📂 Repository Directory Architecture

```text
EDU360/
├── README.md                           # Main Project Landing Page & Setup Guide
├── .gitignore                          # Clean Monorepo Git Ignore Rules
├── edu360.db                           # Local SQLite Database (Git Ignored)
│
├── backend/                            # Python 3.11+ FastAPI Async ASGI Monolith
│   ├── app/
│   │   ├── core/                       # Database session, config, security
│   │   ├── models/                     # SQLAlchemy 2.0 ORM models
│   │   ├── schemas/                    # Pydantic v2 schemas
│   │   ├── routers/                    # Domain-driven route controllers (203 Endpoints)
│   │   └── seed.py                     # Realistic online academy seed dataset
│   ├── requirements.txt
│   └── main.py
│
├── frontend/                           # Next.js 16.4.2 App Router Frontend
│   ├── src/
│   │   ├── app/                        # Role portals (admin, teacher, student, junior, etc.)
│   │   ├── components/                 # Reusable UI components & canvas SpeedGrader
│   │   └── lib/                        # Resilient API client, types & auth context
│   ├── package.json
│   └── tailwind.config.ts
│
├── scripts/                            # Operational & Generation Tooling
│   └── build_prd_artifacts.py          # Programmatic HTML/PDF compiler using PyMuPDF
│
└── docs/                               # Comprehensive Documentation Hub
    ├── prd/                            # Master PRD Specifications
    │   ├── EDU360_MASTER_PRD_SPECIFICATION.md
    │   ├── EDU360_MASTER_PRD_SPECIFICATION.pdf
    │   └── EDU360_MASTER_PRD_SPECIFICATION.html
    │
    ├── workflows/                      # Knowledge Transfer & Process Diagrams
    │   ├── EDU360_KT_PRESENTATION_GUIDE.md
    │   ├── EDU360_COMPLETE_WORKFLOW_MAP.png
    │   ├── WORKFLOW_OF_FOCUS_TABLE.md
    │   └── EXAM_ACADEMIC_WORKFLOW_PLAN.md
    │
    ├── architecture/                   # System Design & RBAC Specifications
    │   ├── ADMIN_ARCHITECTURE.md
    │   ├── COORDINATOR_ROLES_SPECIFICATION.md
    │   └── AGENTS.md
    │
    ├── implementation_plans/           # Sprint Implementation & Execution Plans
    │   ├── IN_APP_NOTIFICATIONS_IMPLEMENTATION_PLAN.md
    │   ├── IMPLEMENTATION_PLAN_FOCUS_TABLE_REMEDIAL.md
    │   ├── IMPLEMENTATION_PLAN_ACADEMIC_COORDINATOR_WORKFLOWS.md
    │   ├── IMPLEMENTATION_PLAN_ACCOUNTS_OUTFLOWS.md
    │   └── IMPLEMENTATION_PLAN_ROLES_AND_TASKS.md
    │
    └── archive/                        # Deprecated & Historical Reference Documents
        ├── EDU360_PRD_GoogleDocs.docx
        ├── EDU360_PRD.md
        ├── IMPLEMENTATION_PLAN_INVENTORY_COORDINATOR.md
        ├── HANDOVER.md
        └── WALKTHROUGH.md
```

---

## 🚀 Quick Start Guide

### 1. Start Backend (Python FastAPI)

```bash
cd backend
# Windows:
.\venv\Scripts\activate
# Or create: python -m venv venv && pip install -r requirements.txt

# Seed realistic database:
python -m app.seed

# Run FastAPI async server on port 8000:
uvicorn main:app --reload --port 8000
```
- **Backend API Interactive Swagger Docs**: `http://localhost:8000/docs`

### 2. Start Frontend (Next.js 16.4.2)

```bash
cd frontend
npm install
npm run dev
```
- **Web Application Portal**: `http://localhost:3000`

---

## 🔑 Universal Authentication & Login Profiles

All roles in EDU360 share the certified universal password: **`Password123`**

| Role | Username / Email | Default Password | Primary Portal Route |
| :--- | :--- | :--- | :--- |
| **Super Admin / Principal** | `admin` | `Password123` | `/admin` |
| **Academic Coordinator** | `academic_coordinator` | `Password123` | `/academic_coordinator` |
| **Exam Coordinator** | `exam_coordinator` | `Password123` | `/exam_coordinator` |
| **Accounts Coordinator** | `accounts_coordinator` | `Password123` | `/accounts_coordinator` |
| **Admissions Coordinator** | `admissions_coordinator` | `Password123` | `/admissions_coordinator` |
| **Teacher (Mathematics)** | `teacher_mat` | `Password123` | `/teacher` |
| **Student (Secondary)** | `student_sec` | `Password123` | `/student` |
| **Student (Junior K–5)** | `junior` | `Password123` | `/junior` |
| **Parent** | `parent` | `Password123` | `/parent` |

> 🛡️ **Offline & Latency Resilience**: The frontend includes a 3-second `AbortController` timeout with an instant fallback profile resolver (`resolveFallbackAuthProfile`). Users will **never** be locked out even during backend cold starts or network restarts.

---

## 📑 Documentation Index

- 📘 [Master PRD Specification (Markdown)](docs/prd/EDU360_MASTER_PRD_SPECIFICATION.md)
- 📕 [Master PRD Specification (Printable PDF)](docs/prd/EDU360_MASTER_PRD_SPECIFICATION.pdf)
- 🌐 [Master PRD Specification (Interactive HTML)](docs/prd/EDU360_MASTER_PRD_SPECIFICATION.html)
- 🎙️ [Knowledge Transfer (KT) Presentation Guide](docs/workflows/EDU360_KT_PRESENTATION_GUIDE.md)
- 🗺️ [Complete System Workflow Map (Infographic Image)](docs/workflows/EDU360_COMPLETE_WORKFLOW_MAP.png)
- 🔔 [In-App Notifications Implementation Plan](docs/implementation_plans/IN_APP_NOTIFICATIONS_IMPLEMENTATION_PLAN.md)
- 🎯 [Workflow of Focus Table & Remedial Sprints](docs/workflows/WORKFLOW_OF_FOCUS_TABLE.md)
