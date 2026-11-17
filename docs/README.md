# 📚 EDU360 Documentation Index
**Institutional Operating System for K–12 & Virtual Academies**  
*Single Source of Truth (SSOT) — Certified Active Baseline v7.0*

---

## 📌 Master Product & System Specifications (SSOT)

For any developer, designer, QA engineer, or product manager working on EDU360, the primary specifications are:

| Document | Format | Location | Description |
| :--- | :---: | :--- | :--- |
| **Master PRD (Executive & Client Edition)** | `.docx` | [`docs/prd/EDU360_Master_PRD_System_Specification.docx`](file:///e:/Diradz/EDU360/docs/prd/EDU360_Master_PRD_System_Specification.docx) | Full publication-grade specification with tables, workflows, tech stack, and sign-off blocks. |
| **Master PRD (Developer Markdown Edition)** | `.md` | [`docs/prd/EDU360_MASTER_PRD_SPECIFICATION_v7.md`](file:///e:/Diradz/EDU360/docs/prd/EDU360_MASTER_PRD_SPECIFICATION_v7.md) | GitHub & VS Code native Markdown version with complete 8-role specs, RBAC, and schemas. |

---

## 📂 Active Documentation Structure

```
docs/
├── prd/                                    <-- Single Source of Truth (v7.0)
│   ├── EDU360_Master_PRD_System_Specification.docx
│   └── EDU360_MASTER_PRD_SPECIFICATION_v7.md
│
├── architecture/                           <-- System Architecture Specifications
│   ├── ADMIN_ARCHITECTURE.md               (Admin Nerve Center & Vitals)
│   ├── COORDINATOR_ROLES_SPECIFICATION.md  (The 6 Operational Coordinator Interlocks)
│   └── AGENTS.md                           (Agent guidelines & workspace directives)
│
├── workflows/                              <-- Operational Workflows & Daily Cycles
│   ├── EDU360_ROLE_WISE_DAILY_WORKFLOWS_KT.md (Master 8-Role Daily Lifecycle from 8am-8:30pm)
│   ├── WORKFLOW_OF_FOCUS_TABLE.md          (Focus Table & 1-Week Remedial Intelligence)
│   └── EXAM_ACADEMIC_WORKFLOW_PLAN.md      (Examination Blueprint & Question Paper Secrecy)
│
├── implementation_plans/                   <-- Feature-Level Implementation Specs
│   ├── IMPLEMENTATION_PLAN_FOCUS_TABLE_REMEDIAL.md
│   ├── IMPLEMENTATION_PLAN_ROLES_AND_TASKS.md
│   ├── IMPLEMENTATION_PLAN_ACCOUNTS_OUTFLOWS.md
│   └── IN_APP_NOTIFICATIONS_IMPLEMENTATION_PLAN.md
│
└── archive/                                <-- Historical / Deprecated Artifacts
    ├── legacy_v6/                          (Outdated v6.0 PRDs & old SQLite test guides)
    └── ...                                 (Legacy Sprint 1-3 documents)
```

---

## ⚡ Active Technical Stack (Reference for Developers)

* **Frontend**: Next.js **14.2.15** (App Router), React 18, TypeScript (Strict), Tailwind CSS.
* **Backend API**: FastAPI (Python 3.11+), Uvicorn ASGI, Pydantic v2.
* **Database**: PostgreSQL 15+ (`postgresql+asyncpg://postgres:...@localhost:5432/edu360`).
* **ORM Layer**: SQLAlchemy 2.0 Async with single-pass `OUTER JOIN` queries.
* **Concurrency**: PostgreSQL Pessimistic Row Locking (`SELECT ... FOR UPDATE`).
* **Real-Time Video**: LiveKit WebRTC Server & Client SDK for browser-native virtual classrooms.
* **Security & Auth**: Dual-Mode Authentication (HMAC-SHA256 Signed Tokens + Scoped Role Headers).

---

## 🚀 How to Run the Platform Locally

```bash
# Terminal 1: Backend Microservices (FastAPI)
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend Client (Next.js)
cd frontend
npm run dev
# Accessible at http://localhost:3000
```

> **Note for Developers**: Do NOT refer to files in `docs/archive/`. All historical claims about SQLite or Next.js 16 in archive files are deprecated and replaced by the v7.0 specifications above.
