# EDU360: K–12 Outcomes & Intelligence Platform

EDU360 is a modern **School Management & Student Outcomes Platform** for K–12 schools. Unlike traditional school ERPs that function only as passive digital registers, EDU360 is an **Action & Intelligence Platform** focused on clean workflows, aesthetic UI, zero-burden teacher experiences, and outcome-oriented parent engagement.

---

## 🏛️ Supported Roles & Key Modules

| Role | Core Capabilities |
| :--- | :--- |
| 🏛️ **Administration / Management** | • 🔴/🟠/🟢 Priority Triage Command Center (Absenteeism, Fee dues, Academics)<br>• Admissions Enquiry CRM with AI Chatbot logs & 1-click SIS Student conversion<br>• Strict Document Control (Admin-only upload/edit for official certificates)<br>• Dual-Signature Exit & Transfer Certificate (TC) clearance archive<br>• Event & Vendor Command Center with Staff-to-Student volunteer hierarchy |
| 👩‍🏫 **Teacher** | • 10-Minute Online Class Auto-Attendance Rule ($T \le 10\text{ min} \implies$ Present, $>10\text{ min} \implies$ Late)<br>• In-Browser Homework Grading Canvas (Red pen, green tick stamps, typed remarks)<br>• Shared Focus Table with 4-day revision timetable for weak concepts<br>• Parent Connection Hub with 1-click leave approvals & context drawer |
| 👨‍👩‍👧 **Parent** | • Anti-Spam Moving Slider Carousel for routine daily announcements<br>• Live School Bus Route 4 GPS Tracking with ETA & driver contact button<br>• Shared Student Focus Table with home practice sign-off checklist<br>• Fee Milestones with 1-click UPI/Card mock payment & instant receipt download |
| 🎒 **Student** | • 1-Click Live Classroom join & Subject/Chapter recorded classes library<br>• Side-by-Side Portfolio: School Participations vs Verified Achievements<br>• Homework upload & view teacher annotated worksheets with red ink remarks<br>• Official School Vault with verified report cards & bonafide certificates |

---

## 🛠️ Architecture & Monorepo Structure

```text
EDU360/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, database session & security
│   │   ├── models/         # SQLAlchemy models (User, Student, Attendance, Homework, etc.)
│   │   ├── schemas/        # Pydantic v2 schemas
│   │   ├── routers/        # FastAPI route modules:
│   │   │   ├── auth.py     # Role switcher data
│   │   │   ├── admin.py    # Triage, CRM, Events, Inventory, Exit clearance
│   │   │   ├── teacher.py  # Attendance, Inline grading, Focus tables
│   │   │   ├── parent.py   # Banners, Bus GPS, Fees, Leave requests
│   │   │   └── student.py  # Classes, Homework, Portfolio
│   │   ├── services/       # AI analytics & auto-attendance rule engine
│   │   └── seed.py         # Realistic K-12 sample dataset
│   ├── requirements.txt
│   └── main.py             # FastAPI entrypoint
└── frontend/
    ├── src/
    │   ├── app/            # Next.js App Router (Admin, Teacher, Parent, Student)
    │   ├── components/     # Reusable UI widgets (Triage, Canvas, Bus Tracker, Carousel)
    │   └── lib/            # Types & resilient API client with instant state fallback
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 Quick Start Guide

### 1. Start Backend (Python FastAPI)

```bash
cd backend
# Activate virtual environment
.\venv\Scripts\activate   # Windows
# Or create: python -m venv venv && pip install -r requirements.txt

# Seed realistic database
python -m app.seed

# Run FastAPI server
uvicorn main:app --reload --port 8000
```
Backend API interactive documentation available at: `http://localhost:8000/docs`

### 2. Start Frontend (Next.js 14+)

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## ⚡ Instant Role Switcher
Use the top header navigation pill `[Admin] [Teacher] [Parent] [Student]` to instantaneously switch between all 4 role experiences and test cross-role workflows in real-time.
