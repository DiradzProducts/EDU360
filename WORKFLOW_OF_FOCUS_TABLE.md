# EDU360: Workflow & Technical Specification of Focus Table & 1-Week Remedial Intelligence

> **Specification Version**: 4.0  
> **Module**: Teacher Portal &rarr; Focus Table & AI 1-Week Action Plan  
> **Key Files**: 
> - [`frontend/src/app/teacher/page.tsx`](file:///e:/Diradz/EDU360/frontend/src/app/teacher/page.tsx) (Tab: `focus_table`)
> - [`frontend/src/app/teacher/focus/[id]/page.tsx`](file:///e:/Diradz/EDU360/frontend/src/app/teacher/focus/%5Bid%5D/page.tsx) (Dedicated Remedial Page)
> - [`frontend/src/lib/focus-data.ts`](file:///e:/Diradz/EDU360/frontend/src/lib/focus-data.ts) (Domain Store & Telemetry)

---

## 1. High-Level Concept & Problem Statement

Traditional School ERPs show exam marks as static grade sheets (e.g. *Aarav scored 52% in Mid-Term Math*). They offer no path for improvement or diagnostic insight.

**EDU360 AI Remedial Intelligence closes the loop**:
```
Exam Answer Paper Scanned by AI
           │
           ▼
Diagnostic Root Misconception Diagnosed (e.g. "Drops negative signs during LCM expansion in Q7 & Q9")
           │
           ▼
Threshold Evaluation (Score <= 70% enters Remedial; >70% Exempt)
           │
           ▼
Personalized 7-Day Practice Sprint Generated
           │
           ├── Daily assigned practice questions & teacher rubric checkpoints
           ├── Student uploads rough notebook photos / step-by-step working
           ├── Teacher reviews rough paper alongside questions & verifies / requests re-work
           └── 1-Click WhatsApp / SMS progress update sent to parent
```

---

## 2. Core Business Rules & Invariants

| Rule ID | Rule Name | Description | Enforced In |
| :--- | :--- | :--- | :--- |
| **BR-01** | **>70% Mastery Benchmark** | Students scoring $>70\%$ in that subject's exam are marked as **Mastered** and are **Exempt** from the remedial table. Only students scoring $\le 70\%$ appear in the improvement batch. | `focus-data.ts`, `page.tsx` |
| **BR-02** | **Subject-Wise Faculty Scope** | The Focus Table is strictly scoped to the teacher's subject (**Mathematics**). Teachers do not toggle across other unrelated subjects. | `page.tsx` |
| **BR-03** | **Section-Based Filtering** | Teachers filter their focus students by the **Sections/Classes they deal with**: `Class 8-B (Homeroom)`, `Class 8-A`, `Class 9-A`, `Class 9-B`, or `All Sections`. | `page.tsx` |
| **BR-04** | **State Machine Invariant: No Future Regression** | Any work belonging to a **previous day** ($d < \text{current day}$) can **NEVER be "Upcoming"**. Past days can only transition between: `Completed ✓` $\leftrightarrow$ `Pending Review ⏳`. | `focus/[id]/page.tsx` |
| **BR-05** | **Side-by-Side Question & Rubric Review** | When a teacher inspects a student's rough notebook, they must see the **Assigned Practice Question(s)** and **Teacher Rubric Checkpoint** directly adjacent to the student's handwritten solution steps. | `focus/[id]/page.tsx` |
| **BR-06** | **Zero Tele-Script Clutter** | Verbatim tele-call scripts are removed; parent communication is handled through instant 1-click **WhatsApp progress dispatch**, in-app chat, or **1-on-1 PTM scheduling**. | `focus/[id]/page.tsx` |

---

## 3. User Flows & Interaction Models

### Flow A: Teacher Portal Overview (`/teacher?tab=focus_table`)

1. **Header Context**: Displays subject badge `Subject: Mathematics • Secondary Faculty`.
2. **Section Switcher**:
   * Teacher clicks between `[Class 8-B (3 on Plan)]`, `[Class 8-A (2 on Plan)]`, `[Class 9-A (2 on Plan)]`, `[Class 9-B (1 on Plan)]`, or `[All Sections (8 on Plan)]`.
3. **Section Diagnostic Benchmark Banner**:
   * Updates instantly with:
     * **Section Strength**: Total students in that class.
     * **Mastered (>70%)**: Percentage and count of exempt students.
     * **Improvement Batch (<=70%)**: Active remedial students on a 1-week plan.
     * **Section Average**: Mean exam score in that section.
4. **Status Filter & Search**:
   * Filter by submission state: `All`, `Needs Verification`, `Verified`, `Pending Submission`.
   * Real-time search across student name, roll number, or diagnosed weak concept.
5. **Student Cards & Actions**:
   * Each card highlights student exam score (e.g. `Exam: 52% (<=70%)`), root misconception, 1-week sprint progress bar (`Day 3 of 7 (43%)`), and rough notebook upload status badge.
   * Clicking **`Open 1-Week Plan →`** navigates to the dedicated deep-dive page: `/teacher/focus/[id]`.
   * Clicking **`⚡ Quick Verify All Validated`** batch approves all clean solution uploads.

---

### Flow B: Dedicated 1-Week Remedial Page (`/teacher/focus/[id]`)

A full-screen, dedicated environment with 3 distinct tabs:

#### Tab 1: 1-Week (7-Day) Targeted Action Plan
* **Day-by-Day Grid (Days 1 to 7)**:
  * **Previous Days ($d < \text{today}$)**:
    * Displays `Completed ✓` or `Pending Review ⏳` badge.
    * Buttons: `Mark Completed ✓` / `Mark Pending ⏳` for instant status toggling.
    * `Inspect` button to view that specific day's questions and student work.
  * **Current Day ($d = \text{today}$)**:
    * Highlighted with amber border and glow.
    * Buttons: `Inspect & Verify Work →` and quick `Mark Completed ✓`.
  * **Upcoming Days ($d > \text{today}$)**:
    * Preview-only button: `Preview Questions →`.

#### Tab 2: Rough Notebook Solution Review
* **Day Switcher Selector**: Pills (`Day 1` • `Day 2` • `Day 3 [Today]` • ...) allowing the teacher to inspect any day's work on demand.
* **1. Assigned Practice Questions & Evaluation Rubric**:
  * Card showing Problem Number, problem statement, and **Teacher Rubric Checkpoint** (what key intermediate steps to check for).
* **2. Student Handwritten Solution Steps & Canvas Preview**:
  * Student submission notes & upload timestamp.
  * Monospace step-by-step working preview.
  * `Download Original Solution Scan` link.
* **3. Faculty Decision Box**:
  * Feedback textarea pre-populated with diagnostic feedback.
  * `Return for Re-work` button (sets day status to `Pending`).
  * `Approve & Mark Day Completed ✓` button (advances student to next day and marks day completed).

#### Tab 3: Guardian Co-Tracking & Progress Updates
* **Registered Guardian Card**: Contact name, phone, and co-tracking verification status.
* **Instant Parent WhatsApp / SMS Update**: 1-click button dispatching a message reminding the parent to check the student's rough notebook practice tonight.
* **Direct Channels**: `Open In-App Chat`, `Schedule 1-on-1 PTM`, and `Print 1-Week Summary`.

---

## 4. Frontend Data Contracts & Interfaces

Defined in [`frontend/src/lib/focus-data.ts`](file:///e:/Diradz/EDU360/frontend/src/lib/focus-data.ts):

```typescript
export interface WeekFocusProblem {
  question_number: string;
  question_text: string;
  rubric_key: string;
  expected_solution?: string;
}

export interface WeekFocusDay {
  day_num: number;
  day_label: string; // e.g. "Day 3 (Wed)"
  title: string;
  focus_task: string;
  resource: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Upcoming';
  submission_required: boolean;
  parent_checklist: string;
  questions?: WeekFocusProblem[];
  student_solution_steps?: string[];
  submitted_file?: {
    name: string;
    size: string;
    submitted_at: string;
    student_notes?: string;
    preview_url?: string;
  };
}

export interface FocusRosterItem {
  id: number;
  student_id: number;
  roll_no: string;
  name: string;
  class_name: string; // e.g. "Class 8-B", "Class 8-A"
  subject: string;    // "Mathematics"
  category: 'Critical Remedial' | 'Targeted Practice';
  exam_name: string;
  exam_score_pct: number; // <= 70%
  target_score_pct: number; // > 70%
  ai_exam_scan: {
    scanned_at: string;
    questions_flagged: string;
    weak_concept: string;
    diagnostic_summary: string;
    recommended_focus: string;
  };
  current_day: number;
  total_days: number; // 7
  plan_days: WeekFocusDay[];
  submission_status: 'Submitted' | 'Pending' | 'Verified' | 'Needs Revision';
  parent_name: string;
  parent_phone: string;
  parent_status: 'Parent Verified ✓' | 'Pending Parent Review ⏳';
}
```

---

## 5. Backend Migration Roadmap (Planned Database & API)

When connecting the client prototype to the FastAPI backend:

### Proposed Database Tables (SQLAlchemy)
1. `focus_rosters`: `(id, student_id, section_id, subject_id, exam_id, score_pct, target_pct, current_day, status, created_at)`
2. `ai_exam_diagnostics`: `(id, focus_roster_id, flagged_questions, weak_concept, diagnostic_summary, prescription)`
3. `remedial_plan_days`: `(id, focus_roster_id, day_num, title, task_description, resource_url, status, parent_checklist)`
4. `remedial_assigned_questions`: `(id, plan_day_id, question_number, prompt_text, rubric_checkpoint, expected_answer)`
5. `remedial_submissions`: `(id, plan_day_id, file_url, student_notes, teacher_remarks, verified_at, status)`

### Proposed Endpoints
* `GET /api/v1/teacher/focus-table?section={section_id}&subject={subject_id}`
* `GET /api/v1/teacher/focus-table/{student_id}`
* `PATCH /api/v1/teacher/focus-table/{student_id}/day/{day_num}/status`
* `POST /api/v1/teacher/focus-table/{student_id}/verify`
* `POST /api/v1/teacher/focus-table/{student_id}/notify-parent`
