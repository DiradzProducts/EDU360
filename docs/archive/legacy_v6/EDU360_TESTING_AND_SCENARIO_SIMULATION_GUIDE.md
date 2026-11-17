# 🧪 EDU360 — Testing, QA & Scenario Simulation Playbook
### How to Test Admin Triggers, Escalations, 20+ Absences, 3-4 Month Fee Arrears & Database Repopulation
**Document Version:** 1.0 (Testing & QA Scenario Guide)  
**Target Scope:** 100% Pure Online Virtual Schooling (8 Canonical Roles)  
**Audience:** QA Engineers, Developers, Product Managers & Stakeholders  

---

## 📋 Table of Contents
1. [Overview: The Testing Philosophy of EDU360](#1-overview-the-testing-philosophy-of-edu360)
2. [How to Cleanly Reset & Repopulate the Database](#2-how-to-cleanly-reset--repopulate-the-database)
3. [Scenario 1: Testing Extreme Absenteeism Spikes (20+ Students Absent)](#3-scenario-1-testing-extreme-absenteeism-spikes)
4. [Scenario 2: Testing 3 to 4 Months (90–120+ Days) Overdue Fee Arrears](#4-scenario-2-testing-3-to-4-months-overdue-fee-arrears)
5. [Scenario 3: Testing Admin Task SLA Breaches & Principal Escalations](#5-scenario-3-testing-admin-task-sla-breaches)
6. [Scenario 4: Testing Admissions 1-Click SIS Conversion & Accounts Invoicing](#6-scenario-4-testing-admissions-1-click-sis-conversion)
7. [Scenario 5: Testing Exam Score ≤ 70% & 1-Week Remedial Focus Sprint](#7-scenario-5-testing-exam-score--70-remedial-sprint)
8. [Scenario 6: Testing 15-Minute Missed Homework Cutoff & Forensic Backlog](#8-scenario-6-testing-15-minute-missed-homework-cutoff)
9. [Direct API Testing via Swagger Interactive Docs](#9-direct-api-testing-via-swagger-interactive-docs)
10. [Test Accounts & Credentials Cheat-Sheet](#10-test-accounts--credentials-cheat-sheet)

---

## 1. Overview: The Testing Philosophy of EDU360

In EDU360, automated testing isn't just about clicking buttons to see if a form submits. It is about verifying **reactive cross-role triggers**:

```
[System Event / Threshold Exceeded] 
             │
             ▼
[Dynamic State Transition in DB] 
             │
             ▼
[Priority Triage Alert / In-App Notification / Task SLA Injected] 
             │
             ▼
[Cross-Role Resolution (Approval / Waiver / Extension / Sign-off)]
```

When you move the application from development to **QA and User Acceptance Testing (UAT)**, you need predictable ways to:
1. Re-seed clean test data anytime something gets messy.
2. Simulate extreme conditions (e.g. 20+ students absent, 4 months unpaid fees).
3. Verify that the system escalates and recovers gracefully without crashing or wiping data.

---

## 2. How to Cleanly Reset & Repopulate the Database

Whenever you want to reset all test data back to the clean baseline state, run the automated seed script.

### 💻 Step-by-Step Reset Command:

Open PowerShell or Command Prompt in the project root:

```powershell
# 1. Navigate to the backend directory
cd e:\Diradz\EDU360\backend

# 2. Run the seed script using the backend virtual environment:
.\venv\Scripts\python.exe -m app.seed
```

### ⚙️ What Happens Behind the Scenes:
1. **Atomic Table Drop & Recreate**: Drops all existing SQLite tables (`Base.metadata.drop_all`) and recreates fresh schema tables with strict foreign keys enabled (`PRAGMA foreign_keys = ON`).
2. **Fresh 8-Role Users**: Seeds all 8 administrative and academic users with universal password `Password123`.
3. **Pre-Configured Baseline Edge Cases**:
   - Ingests **Triage Alerts**: Including Chronic Absenteeism (20 students absent), Academic Drop in Class 8-B ($-18\%$), and Fee Overdue alert (30 students overdue, ₹5,55,000 pending).
   - Ingests **Overdue Fee Defaulters**: With varying aging buckets (0–15d, 16–30d, 30+ days).
   - Ingests **Active Admin Tasks**: Including urgent LOC board submissions, remedial briefings, and audit tasks.
   - Ingests **1-Week Remedial Focus Table**: Populates Class 8-B Mathematics with both active sprint students ($\le 70\%$) and exempt students ($> 70\%$).
4. **Outputs**: `EDU360 seed data populated successfully!` in ~2 seconds.

---

## 3. Scenario 1: Testing Extreme Absenteeism Spikes (20+ Students Absent)

### 🎯 Test Objective:
Verify that when attendance drops sharply across classes, the system:
- Flags a **Critical RED Triage Card** on the Super Admin dashboard.
- Assigns an emergency welfare follow-up task to the Class Teacher with an 8-hour countdown SLA.
- Dispatches high-priority in-app alerts to parents.

### 🧪 How to Verify in the Application:

1. **Step 1: Super Admin Cockpit (`/admin`)**:
   - Login as `admin` / `Password123`.
   - Look at the top Priority Triage cards:
     - Card Level: **RED** (Border & Icon).
     - Title: **Chronic Absenteeism: 20 Students Absent Today**.
     - Description: *"5 students (including Kabir Mehta, Roll #15) have been absent for 3+ consecutive days without parent leave applications."*
     - Affected Count: `20 Students`.
   - Click the action button: **`[Assign Class Teacher to Call Parents]`**.
   - Notice the toast confirmation and state transition to acknowledged.

2. **Step 2: Class Teacher Verification (`/teacher`)**:
   - Logout and login as `teacher_mat` / `Password123`.
   - Check the notifications bell and active duties:
     - Notice the urgent task assigned: *"Welfare Intervention: Student Absent 3+ Consecutive Days"*.
     - Notice the **8-Hour SLA countdown timer**.
   - Click the student name $\to$ opens student profile with parent phone number and historical attendance graph.

---

## 4. Scenario 2: Testing 3 to 4 Months (90–120+ Days) Overdue Fee Arrears

### 🎯 Test Objective:
Verify that when students have prolonged unpaid fee installments (over 3 to 4 months):
- The Accounts aging ledger classifies them into the **30+ Days Critical Overdue** bucket.
- The student's examination **hall ticket is automatically locked**.
- The bursar can either collect payment, apply a **Management Hardship Waiver**, or toggle **Institutional Exam Clearance Override** (`exam_clearance = True`) to unlock the hall ticket without wiping out the debt!

### 🧪 How to Verify in the Application:

1. **Step 1: Accounts Coordinator Aging Ledger (`/accounts_coordinator`)**:
   - Login as `accounts_coordinator` / `Password123`.
   - Navigate to the **Fee Defaulters & Aging Ledger** table.
   - Click the aging filter tab: **`[30+ Days Overdue]`**.
   - View students who have been overdue for over 90–120 days:
     - Look at the columns: `Student Name`, `Class`, `Amount Due`, `Days Overdue`, `Reminders Sent`.
   - Notice the red status badge: `Critical Overdue`.

2. **Step 2: Test Hall Ticket Locking (Exam Coord & Student)**:
   - Login as `exam_coordinator` / `Password123` or `student_sec` / `Password123`.
   - Go to Exam Hall Tickets.
   - Notice the hall ticket download button is **LOCKED / DISABLED** with a warning: *"Fee Clearance Pending: Contact Accounts Bursar"*.

3. **Step 3: Test Institutional Exam Clearance Override (Unlocking Hall Ticket)**:
   - Switch back to `accounts_coordinator`.
   - On the defaulter's row, click **`[Exam Clearance Override]`** (or toggle `Clearance`).
   - Notice the status badge switches to `Cleared for Exam (Balance Active)`.
   - Switch back to `student_sec` or `exam_coordinator` $\to$ Refresh screen.
   - **Result**: The Hall Ticket download button is now **UNLOCKED** and ready to download, but the fee debt remains active in the accounts ledger!

4. **Step 4: Test Management Hardship Waiver**:
   - In Accounts Coordinator portal, click **`[Grant Waiver / Concession]`** on a defaulter row.
   - Enter Waiver Amount: `₹5,000`.
   - Enter Reason Code: `COVID / Single-Earner Hardship`.
   - Click `[Submit Waiver]`.
   - **Result**: Balance reduces from ₹25,000 to ₹20,000. System records audit metadata (`waiver_amount`, `waiver_reason`, `waiver_approved_by`) without deleting the original invoice history.

---

## 5. Scenario 3: Testing Admin Task SLA Breaches & Principal Escalations

### 🎯 Test Objective:
Verify that when a staff member faces workload strain:
- They can pause the SLA clock with zero penalty (`[Request Task Relief]`).
- Academic Coordinator can extend the deadline (+12h to +72h) or migrate the task.
- When an SLA expires without resolution, it escalates to the Principal (`escalated_to_principal`).

### 🧪 How to Verify in the Application:

1. **Step 1: Teacher Requests Workload Relief**:
   - Login as `teacher_mat` / `Password123`.
   - Open active tasks (e.g., *Remedial Review - 48h SLA*).
   - Click **`[Request Task Relief]`**.
   - Enter Reason: *"High classroom hours and term paper grading. Requesting 48h grace."*
   - Click `[Submit Relief Request]`.
   - **Result**: The SLA timer displays **PAUSED (Relief Requested)**. Zero penalty is charged against the teacher.

2. **Step 2: Academic Coordinator Grants Extension**:
   - Login as `academic_coordinator` / `Password123`.
   - Open the Task Relief queue.
   - See the teacher's pending request with their justification note.
   - Click **`[Grant Extension: +48 Hours]`**.
   - **Result**: The task deadline is extended by +48 hours. SLA countdown resumes with the new due date. Teacher receives an in-app confirmation alert.

3. **Step 3: Test Executive Escalation to Principal**:
   - On any critical task near breach, Coordinator selects **`[Escalate to Principal]`**.
   - Enters justification: *"Department lead on emergency medical leave. Institutional submission at risk."*
   - Login as `admin` / `Password123`.
   - **Result**: A prominent **ESCALATED TO PRINCIPAL** badge appears on the Admin Task dashboard, allowing the Principal to reassign or close the task by executive order.

---

## 6. Scenario 4: Testing Admissions 1-Click SIS Conversion & Accounts Invoicing

### 🎯 Test Objective:
Verify that qualifying a prospective student atomically creates:
- The active SIS student record with a unique Roll Number & Admission ID.
- Promotes candidate intake documents to the official SIS Vault.
- Automatically generates the corresponding admission fee invoice in the Accounts ledger.

### 🧪 How to Verify in the Application:

1. **Step 1: Admissions Lead Pipeline (`/admissions_coordinator`)**:
   - Login as `admissions_coordinator` / `Password123`.
   - In the CRM pipeline, locate an enquiry in stage `Entrance Cleared` (or click on any lead).
   - Review candidate details: Student Name, Parent Phone, Target Grade.

2. **Step 2: Trigger 1-Click SIS Conversion**:
   - Click the green button: **`[Convert to SIS]`**.
   - Modal prompts for:
     - Assigned Section: `Class 8-B`
     - Admission Fee: `₹25,000`
     - Fee Status: Select `Unpaid / Partial` (to test fee defaulter generation).
   - Click `[Confirm Enrolment]`.

3. **Step 3: Verify SIS Creation & Document Vault**:
   - Notice the lead stage updates to `Converted`.
   - Generated Admission No: `EDU-2026-XXX`.
   - Go to Super Admin (`/admin`) $\to$ Official Documents Vault:
     - Notice the candidate's Birth Certificate and Marks Card are now vaulted with status `Pending Verification (Awaiting Principal Seal)`.

4. **Step 4: Verify Accounts Ledger Routing**:
   - Login as `accounts_coordinator` / `Password123`.
   - Open Fee Defaulters ledger.
   - **Result**: A new record is present with `student_name`, `amount_due = ₹25,000`, and `is_admission_fee = True`!

---

## 7. Scenario 5: Testing Exam Score ≤ 70% & 1-Week Remedial Focus Sprint

### 🎯 Test Objective:
Verify the core outcome philosophy of EDU360:
- Students scoring $\le 70\%$ in Mathematics exams are **automatically enrolled** in the 7-day remedial sprint.
- Students scoring $> 70\%$ are marked **Exempt**.
- Teachers can inspect uploaded photos of the student's physical rough notebook.
- Nightly parent sign-off unlocks Day $N+1$.

### 🧪 How to Verify in the Application:

1. **Step 1: Teacher Focus Table (`/teacher`)**:
   - Login as `teacher_mat` / `Password123`.
   - Open the **Focus Table**. Filter by `Class 8-B`.
   - Observe the enrolled student list:
     - *Kabir Mehta (Score: 64.2%)*: Enrolled in 7-day sprint!
     - *Diya Patel (Score: 92.5%)*: Marked **Exempt** (Green badge).

2. **Step 2: Inspect Student Physical Rough Notebook**:
   - Click on Day 2 for Kabir Mehta.
   - The **Rough Paper Inspection Modal** opens:
     - Left pane: Assigned micro-practice problem + Teacher rubric checkpoint.
     - Right pane: High-resolution photo upload of the student's handwritten rough notebook calculations.
   - Click `[Approve Step ✓]`.
   - Notice Day 2 transitions to `Approved by Teacher (Awaiting Parent Sign-off)`.

3. **Step 3: Nightly Parent Co-Tracking Sign-Off**:
   - Login as `parent_kabir` / `Password123` (or `parent`).
   - Open the **10-Minute Nightly Co-Tracking** card.
   - View tonight's remedial math target and teacher's verification stamp.
   - Click **`[Sign-Off Rough Book]`**.
   - **Result**: Day 2 is fully sealed with green checkmark! Day 3 unlocks for tomorrow.

---

## 8. Scenario 6: Testing 15-Minute Missed Homework Cutoff & Forensic Backlog

### 🎯 Test Objective:
Verify that homework submitted past the daily cutoff time (e.g. 5:00 PM) transitions from `PENDING` to `BACKLOG` with an immutable evidence ID.

### 🧪 How to Verify in the Application:

1. **Teacher Dashboard (`/teacher`)**:
   - Create a homework assignment with strict cutoff time: `5:00 PM`.
2. **Student Dashboard (`/student`)**:
   - For an unsubmitted assignment, observe status `Pending Submission`.
3. **Cutoff Expiration**:
   - When current time crosses the cutoff:
     - Status automatically transitions to **`BACKLOG`**.
     - Generates forensic tracking ID: **`#EVD-BKLOG-2026-X`**.
     - Homework dropzone disables direct submission and requires a late submission reason.
4. **Parent App (`/parent`)**:
   - An unresolved backlog event appears on the parent's dashboard, notifying them of the missed deadline.

---

## 9. Direct API Testing via Swagger Interactive Docs

For automated QA or backend integration testing without opening the frontend UI, all triggers and scenarios can be tested directly via the FastAPI Swagger documentation.

1. Ensure backend is running: `http://localhost:8000`
2. Open Swagger docs in your browser: **`http://localhost:8000/docs`**
3. Key scenario endpoints to test:

| Test Endpoint | Method | Payload / Action | Expected Result |
| :--- | :---: | :--- | :--- |
| `/api/admin/tasks/auto-trigger` | `POST` | `{"event_type": "absence_streak", "entity_id": "Class 8-B"}` | Returns 201 Created with new 8h SLA welfare task. |
| `/api/admin/tasks/auto-trigger` | `POST` | `{"event_type": "exam_concluded", "entity_id": "Term 1"}` | Returns 201 Created with 120h moderation task. |
| `/api/admin/crm/enquiries/{id}/convert` | `POST` | `{"section": "B", "admission_fee": 25000, "fee_status": "Unpaid"}` | Mints student, vaults documents, creates fee defaulter. |
| `/api/finance/defaulters/{id}/waiver` | `POST` | `{"waiver_amount": 5000, "waiver_reason": "Hardship"}` | Deducts amount, records audit metadata. |
| `/api/finance/defaulters/{id}/exam-clearance` | `POST` | `{"clearance": true}` | Toggles `exam_clearance = True`, unlocks hall ticket. |
| `/api/remedial/generate-sprint` | `POST` | `{"student_name": "Test", "score_pct": 62, "subject": "Math"}` | Returns 7-day micro-target curriculum. |

---

## 10. Test Accounts & Credentials Cheat-Sheet

All test accounts in the seeded database share the universal password: **`Password123`**

| Role | Username | Default Password | Primary Test Focus |
| :--- | :--- | :--- | :--- |
| **Super Admin / Principal** | `admin` | `Password123` | Priority Triage (Red/Orange), Tasks, TC Exit Seal |
| **Academic Coordinator** | `academic_coord` | `Password123` | Pacing Surveillance, AI Substitutions, Task Relief |
| **Exam Coordinator** | `exam_coord` | `Password123` | Blueprints, Accounts-Gated Hall Tickets, SpeedGrader |
| **Accounts Coordinator** | `accounts_coord` | `Password123` | Arrears Aging, Admission Invoices, Fee Waivers |
| **Admissions Coordinator** | `admissions_coord` | `Password123` | CRM Leads, Call Logging, 1-Click SIS Conversion |
| **Teacher (Mathematics)** | `teacher_mat` | `Password123` | SpeedGrader Canvas, 1-Week Focus Table, 10m Attendance |
| **Secondary Student** | `sr_student` | `Password123` | Live Class Join, Homework Dropzone, Socratic AI Tutor |
| **Junior K–5 Student** | `jr_student` | `Password123` | Illustrated Adventure Timetable, Magic Booster Chests |
| **Parent (Class 8-B)** | `parent` / `parent_kabir` | `Password123` | 10-Min Nightly Rough Book Check, Instant Fee Checkout |

---

### 💡 Summary Tip for Testers:
Whenever test data gets modified during a QA cycle, simply run:
```powershell
cd e:\Diradz\EDU360\backend
.\venv\Scripts\python.exe -m app.seed
```
This restores all 8 roles, 20+ absence alerts, 30+ fee defaulters, tasks, and focus tables back to pristine baseline state in **under 3 seconds**!
