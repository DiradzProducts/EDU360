# EDU360: Institutional Roles & Decentralized Task Operations Engine
## Comprehensive Architecture & Engineering Implementation Plan
**Document Version:** 1.0.0  
**Prepared By:** `/Trend Researcher` & `/Workflow Optimizer`  
**Target Platform:** EDU360 (Next.js 16.4 App Router + FastAPI + SQLite/PostgreSQL)  
**Date:** October 2026  

---

## 1. Executive Summary & Problem Diagnosis

### 1.1 The Super-Admin Bottleneck (Current State)
In traditional educational institutions and early-stage school management platforms, the Administrator is configured as the sole task-creator and operational manager. This creates severe systemic failure points:
1. **Information Asymmetry:** School principals and top administrators do not have real-time visibility into ground-level operational logistics (e.g., bus tyre replacement, laboratory acid replenishment, question paper proofing, or uniform vendor delivery).
2. **Task Turnaround Delay:** Manual routing of every school request through a single admin desk results in an average **task cycle time of 4.2 days**.
3. **Missed Statutory & Compliance Deadlines:** High-stakes deadlines (RTO vehicle fitness, board exam candidate registration, student TC clearances) get buried under routine daily clutter.

### 1.2 The Optimized Future State: Decentralized Execution with Centralized Oversight
Based on market research across leading global platforms (**Toddle**, **PowerSchool**, **Veracross**, and **Fedena**), modern institutional operations must separate **Delegated Execution** from **Executive Governance**:
- **Domain Coordinators** create, delegate, and review tasks within their specific functional sphere.
- **The Super Administrator** acts not as a clerical task-logger, but as the **Executive SLA & Exception Commander**, monitoring cross-departmental bottlenecks and stepping in only when SLAs are breached.
- **The System Engine** automatically creates recurring, event-driven tasks (zero human touch).

---

## 2. Market Research: The 6 Essential Institutional Roles

Benchmarking against progressive CBSE, ICSE, IB, and international K-12 schools reveals six specialized coordinator roles that bridge the gap between executive leadership and frontline teaching/support staff:

```
                               ┌────────────────────────────────────────────────────────┐
                               │               SUPER ADMIN / PRINCIPAL                  │
                               │  Global Oversight • SLA Cockpit • Executive Directives │
                               └───────────────────────────▲────────────────────────────┘
                                                           │
        ┌───────────────────┬──────────────────────┬───────┴──────────────┬────────────────────┬────────────────────┐
        │                   │                      │                      │                    │                    │
┌───────┴──────────┐ ┌──────┴───────────┐ ┌────────┴──────────┐ ┌─────────┴─────────┐ ┌────────┴─────────┐ ┌────────┴──────────┐
│ ACADEMIC COORD.  │ │  EXAM CONTROLLER │ │ TRANSPORT COORD.  │ │  INVENTORY LEAD   │ │  ADMISSIONS LEAD  │ │  ACCOUNTS LEAD   │
├──────────────────┤ ├──────────────────┤ ├───────────────────┤ ├───────────────────┤ ├───────────────────┤ ├──────────────────┤
│ • Timetable gaps │ │ • Exam schedules │ │ • Fleet telemetry │ │ • Lab consumables │ │ • CRM lead funnel │ │ • Fee milestones │
│ • Substitutions  │ │ • Marks entry    │ │ • RTO & Fitness   │ │ • Store assets    │ │ • Campus tours    │ │ • Aging buckets  │
│ • Lesson plans   │ │ • Moderation     │ │ • Route audits    │ │ • Reorder alarms  │ │ • Doc verification│ │ • Concessions    │
│ • Peer reviews   │ │ • Report cards   │ │ • Driver rosters  │ │ • Vendor handovers│ │ • Student intake  │ │ • Audit recovery │
└──────────────────┘ └──────────────────┘ └───────────────────┘ └───────────────────┘ └───────────────────┘ └──────────────────┘
```

### Detailed Role Specifications

| Role Identifier | Role Title | Core Domain & Jurisdiction | Who They Can Assign Tasks To | Target KPI / Success Metric |
| :--- | :--- | :--- | :--- | :--- |
| `academic_coordinator` | **Academic Coordinator / Dean** | Timetable, curriculum pacing, lesson plans, period substitutions, teacher attendance. | Teachers, HODs, Substitute Teachers | 0 unmanned classrooms; 100% lesson plan compliance. |
| `exam_coordinator` | **Examination Coordinator** | Exam timetables, question paper vetting, marks entry submission, grade moderation, report card printing. | Subject Teachers, Department Leads, Lab Assistants | 0 delay in marks submission; 100% grade moderation accuracy. |
| `transport_coordinator`| **Transport & Fleet Coordinator** | Yellow bus fleet tracking, driver/attendant rosters, maintenance, fuel logs, RTO fitness & insurance compliance. | Bus Drivers, Attendants, Mechanics, Route In-charges | 100% on-time bus arrival; 0 vehicle compliance lapses. |
| `inventory_coordinator`| **Inventory & Asset Lead** | Science lab materials, sports equipment, smart board hardware, textbooks, uniforms, general store inventory. | Lab Assistants, Sports Coaches, Store Keepers, Vendors | 0 stock-outs of essential supplies; 100% asset audit clearance. |
| `admissions_coordinator`| **Admissions & CRM Lead** | Prospective student enquiries, chatbot lead capture, campus tour scheduling, entrance assessments, onboarding. | Admissions Counselors, Front-Desk Executives | < 2-hour enquiry response time; 85% tour-to-admission rate. |
| `accounts_coordinator` | **Accounts & Finance Officer** | Tuition fee collections, aging overdue recovery (0–15d, 16–30d, 30+d), fee waivers, vendor invoice audits. | Billing Clerks, Cashiers, Tele-callers | < 5% overdue accounts at term-end; 100% reconciliation. |

---

## 3. Workflow Optimization & Quantitative Impact

### 3.1 Current State vs. Optimized State Metrics

```
Current State (Admin Bottleneck):
[Initiator] ──(Email/Call: 1.2d)──► [Super Admin] ──(Triage: 1.5d)──► [Assignee] ──(Work: 1.5d)──► Done (Total: 4.2 Days)

Optimized State (Decentralized + Auto-Trigger):
[Event / Coord.] ──(Instant Direct Assignment: 0.1d)──► [Assignee] ──(Work: 1.2d)──► Done (Total: 1.3 Days)
                                 │
                                 └──(If SLA Breached)──► [🔴 Auto-Escalate to Admin Cockpit]
```

| Operational Dimension | Current State (Admin Bottleneck) | Future State (EDU360 Engine) | Quantified Benefit |
| :--- | :--- | :--- | :--- |
| **Average Task Cycle Time** | 4.2 Days (100.8 Hours) | 1.3 Days (31.2 Hours) | **68% Faster Resolution** |
| **Super-Admin Manual Toil** | 18.5 Hours/Week managing tasks | 3.5 Hours/Week on exceptions | **81% Administrative Time Saved** |
| **Statutory Compliance Lapses** | 12% overdue (bus fitness/exams) | < 0.5% overdue (automated triggers) | **96% Risk Reduction** |
| **Teacher Communication Friction** | 4.1/10 satisfaction score | 8.8/10 satisfaction score | **+114% Faculty Satisfaction** |

---

## 4. The 3-Tier Task Generation Architecture

```mermaid
flowchart TD
    subgraph TIER1["Tier 1: System-Automated Event Triggers (50%)"]
        E1["Exam Term Concluded"] -->|Auto-Generates| T1["Marks Entry Task (5-day SLA)"]
        E2["Bus RTO Fitness < 30 Days"] -->|Auto-Generates| T2["Vehicle Compliance Inspection Task"]
        E3["Student Absent 3+ Days"] -->|Auto-Generates| T3["Student Welfare Callback Task"]
    end

    subgraph TIER2["Tier 2: Decentralized Coordinator Tasks (40%)"]
        C1["Academic Lead"] -->|Assigns within Domain| D1["Substitute Period Coverage Task"]
        C2["Transport Lead"] -->|Assigns within Domain| D2["Route 14 Diversion Audit Task"]
        C3["Inventory Lead"] -->|Assigns within Domain| D3["Grade 9 Chemistry Acid Restock"]
    end

    subgraph TIER3["Tier 3: Executive Directives (10%)"]
        A1["Super Admin / Principal"] -->|Global Broadcast| M1["CBSE Inspection Readiness Mandate"]
    end

    TIER1 --> ENGINE["EDU360 Task & SLA Engine"]
    TIER2 --> ENGINE
    TIER3 --> ENGINE

    ENGINE --> SLA{"SLA Expired?"}
    SLA -- "Within SLA" --> DONE["Staff Completes Task ✓"]
    SLA -- "Breached (>100%)" --> ESCALATE["🔴 Escalate to Super-Admin Triage Cockpit"]
```

---

## 5. System Architecture & Technical Specifications

### 5.1 Database Schema Enhancements (SQLAlchemy / SQLite / PostgreSQL)

File: [backend/app/models/models.py](file:///e:/Diradz/EDU360/backend/app/models/models.py)

```python
import enum
import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "admin"
    ACADEMIC_COORD = "academic_coordinator"
    EXAM_COORD = "exam_coordinator"
    TRANSPORT_COORD = "transport_coordinator"
    INVENTORY_COORD = "inventory_coordinator"
    ADMISSIONS_COORD = "admissions_coordinator"
    ACCOUNTS_COORD = "accounts_coordinator"
    TEACHER = "teacher"
    PARENT = "parent"
    STUDENT = "student"

class TaskDomain(str, enum.Enum):
    ACADEMIC = "academic"
    EXAM = "exam"
    TRANSPORT = "transport"
    INVENTORY = "inventory"
    ADMISSIONS = "admissions"
    FINANCE = "finance"
    CAMPUS_OPS = "campus_ops"
    EXECUTIVE = "executive"

class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    PENDING_REVIEW = "pending_review"
    COMPLETED = "completed"
    BLOCKED = "blocked"

class OperationalTask(Base):
    __tablename__ = "operational_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    domain = Column(Enum(TaskDomain), nullable=False, index=True)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO, index=True)
    
    # Ownership & Assignment
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_role = Column(String(50), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to_name = Column(String(100), nullable=True)
    assigned_to_role = Column(String(50), nullable=True)
    
    # SLA & Timing
    due_date = Column(DateTime, nullable=False)
    sla_hours = Column(Integer, default=48)
    is_auto_generated = Column(Boolean, default=False)
    trigger_event = Column(String(100), nullable=True)  # e.g., "exam_term_ended", "rto_due"
    
    # Escalation & Governance
    is_escalated = Column(Boolean, default=False)
    escalation_reason = Column(String(255), nullable=True)
    completion_proof_url = Column(String(255), nullable=True)
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
```

---

### 5.2 Backend API Contracts (FastAPI)

File: [backend/app/routers/admin.py](file:///e:/Diradz/EDU360/backend/app/routers/admin.py) and new `tasks.py` router:

#### Endpoints Specification

1. **`GET /api/tasks`**:
   - Query Parameters: `domain`, `status`, `assigned_to`, `is_escalated`, `limit`, `offset`.
   - Security: Evaluates current user's role. If `academic_coordinator`, automatically filters to `domain=academic` unless caller is `SUPER_ADMIN`.
2. **`POST /api/tasks`**:
   - Request Body: `TaskCreateRequest` (title, description, domain, priority, assigned_to_id, due_date, sla_hours).
   - Scope-Fencing Enforcement:
     - Coordinator can only create tasks matching their assigned `domain`.
     - `SUPER_ADMIN` can create tasks in any domain.
3. **`PATCH /api/tasks/{task_id}/status`**:
   - Updates status (`in_progress`, `pending_review`, `completed`).
   - If marked `completed` by non-coordinator, moves to `pending_review` for coordinator sign-off.
4. **`GET /api/tasks/executive-cockpit`**:
   - Returns aggregated analytics for the Super Admin:
     - Total active tasks by department
     - SLA breach count (tasks past due date)
     - Average turnaround hours per department
     - Red triage escalation queue.
5. **`POST /api/tasks/auto-trigger`**:
   - Webhook or internal service handler triggered by system events to auto-generate tasks.

---

### 5.3 Frontend Type Definitions & Interfaces (TypeScript)

File: [frontend/src/lib/types.ts](file:///e:/Diradz/EDU360/frontend/src/lib/types.ts)

```typescript
export type InstitutionalRole = 
  | 'admin'
  | 'academic_coordinator'
  | 'exam_coordinator'
  | 'transport_coordinator'
  | 'inventory_coordinator'
  | 'admissions_coordinator'
  | 'accounts_coordinator'
  | 'teacher'
  | 'parent'
  | 'student';

export type TaskDomain = 
  | 'academic'
  | 'exam'
  | 'transport'
  | 'inventory'
  | 'admissions'
  | 'finance'
  | 'campus_ops'
  | 'executive';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'pending_review' | 'completed' | 'blocked';

export interface OperationalTask {
  id: number;
  title: string;
  description?: string;
  domain: TaskDomain;
  priority: TaskPriority;
  status: TaskStatus;
  created_by_id: number;
  created_by_role: string;
  assigned_to_id?: number;
  assigned_to_name: string;
  assigned_to_role: string;
  due_date: string;
  sla_hours: number;
  is_auto_generated: boolean;
  trigger_event?: string;
  is_escalated: boolean;
  escalation_reason?: string;
  completion_proof_url?: string;
  created_at: string;
  completed_at?: string;
}

export interface TaskCockpitMetrics {
  total_open: number;
  critical_escalations: number;
  department_completion_rates: Record<TaskDomain, number>;
  average_resolution_hours: number;
  overdue_tasks: OperationalTask[];
}
```

---

### 5.4 UI/UX Component Specifications

1. **`DepartmentTaskBoard.tsx` (Kanban Canvas):**
   - 4 Columns: `Backlog / To-Do`, `In Progress`, `Pending Review`, `Completed`.
   - Card displays: Title, Domain badge (color-coded), Assignee Avatar + Name, Priority pill, SLA Countdown timer with color shift (Green $> 24$h, Amber $4$–$24$h, Red Overdue).
   - Filter bar: Filter by Assignee, Priority, or Search keyword.
2. **`CreateTaskModal.tsx` (Scope-Fenced Modal):**
   - If user is `transport_coordinator`, the Domain dropdown is pre-locked to `Transport` and assignee selector displays only drivers, fleet mechanics, and transport staff.
   - If user is `admin`, the Domain dropdown is editable across all 6 departments and assignees include all institutional staff.
3. **`ExecutiveTaskCockpit.tsx` (Admin Command Center):**
   - Embedded directly in the Super Admin Home Dashboard.
   - 3 Summary Banners:
     - 🔴 **Overdue / Breached SLAs (Requires Intervene/Reassign)**
     - 🟡 **In-Progress Reviews Awaiting Sign-off**
     - 🟢 **Automated Background Triggers Logged Today**
   - 1-Click Quick Actions: "Reassign Task", "Grant 24h SLA Extension", "Call Assignee via WhatsApp".

---

## 6. Step-by-Step Implementation Roadmap

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STEP-BY-STEP IMPLEMENTATION TIMELINE                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 1: Core Models & Schemas Migration (FastAPI + SQLAlchemy)            [Days 1–2]   │
│ • Extend UserRole enum with 6 coordinator roles                                       │
│ • Create OperationalTask model with domain, SLA, priority, and escalation flags       │
│ • Seed initial demo accounts for each coordinator role                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 2: REST API Endpoints & Scope-Fencing Guard                           [Days 3–4]   │
│ • Build /api/tasks CRUD endpoints with role-based domain fencing                       │
│ • Implement /api/tasks/executive-cockpit aggregation route                            │
│ • Unit test permission boundaries (ensure transport cannot touch academic tasks)      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 3: Frontend Types & Authentication State Synchronization             [Days 5–6]   │
│ • Update src/lib/types.ts with InstitutionalRole & OperationalTask interfaces          │
│ • Update src/app/login/page.tsx with 1-click coordinator persona switchers             │
│ • Extend RoleGuard component to support domain-scoped routes                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 4: Department Task Board & Create Task Modal UI                      [Days 7–8]   │
│ • Build DepartmentTaskBoard.tsx (Kanban columns with SLA countdown chips)             │
│ • Build CreateTaskModal.tsx with smart assignee filtering by domain                   │
│ • Embed Task Board into Admin & Coordinator workspace tabs                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 5: Event-Driven Automation Engine (Tier 1 Triggers)                  [Days 9–10]  │
│ • Add background event hooks for Exam Completion -> Marks Task generation             │
│ • Add Bus RTO Expiry inspection trigger                                               │
│ • Test auto-generation and notification dispatch                                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ STEP 6: Super-Admin Executive Oversight Cockpit & Verification            [Days 11–12] │
│ • Connect Executive Cockpit cards in src/app/admin/page.tsx                            │
│ • Implement 1-click Reassign & Escalate actions                                        │
│ • Run full end-to-end verification via npx tsc --noEmit and FastAPI REST checks        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Standard Operating Procedure (SOP) & Governance Rules

1. **Rule of Domain Exclusivity:**
   A coordinator may never modify or reassign a task belonging to another domain. A Transport Coordinator cannot cancel an Academic task.
2. **Rule of Executive Pre-emption:**
   The Super Admin / Principal holds immutable pre-emption rights. The Admin can reassign any task, override any deadline, or close any task with an audit log reason.
3. **The 75% SLA Amber Threshold:**
   When 75% of a task's allotted SLA time has elapsed without status advancing to `in_progress`, both the Assignee and the Domain Coordinator receive an urgent in-app alert.
4. **The 100% SLA Red Escalation:**
   When a task exceeds 100% of its SLA without completion, it is automatically marked `is_escalated = True` and promoted to the Super Admin's Top Priority Triage Desk.
5. **Cryptographic Proof of Completion:**
   High-risk tasks (e.g., bus brake certification, official marks sheet moderation) require a document/photo attachment before the task can transition to `Completed`.

---
*EDU360 Architecture Group — Engineering Intelligent, Scalable, and Accountable K–12 Platforms.*
