# EDU360: Agent System Directives & Context

> **Auto-Loaded by Antigravity IDE** for any agent or account working in this workspace.

---

## 📌 Project Identity & Stack
* **Project**: **EDU360** — K–12 Outcomes & Intelligence Platform
* **Architecture**: Next.js 16.4 (App Router) + Python FastAPI (Uvicorn) Monorepo
* **Frontend**: `http://localhost:3000` (`e:\Diradz\EDU360\frontend`)
* **Backend**: `http://localhost:8000` (`e:\Diradz\EDU360\backend`)
* **Key Reference Docs**:
  * [`HANDOVER.md`](file:///e:/Diradz/EDU360/HANDOVER.md) — Current state, services, and handover guide.
  * [`WORKFLOW_OF_FOCUS_TABLE.md`](file:///e:/Diradz/EDU360/WORKFLOW_OF_FOCUS_TABLE.md) — Detailed Focus Table and 1-Week Remedial spec.
  * [`WALKTHROUGH.md`](file:///e:/Diradz/EDU360/WALKTHROUGH.md) — Comprehensive tour of all role portals.

---

## 🚨 Critical Operating Constraints

1. **Browser Subagent Prohibition**:
   * The user has explicitly mandated: **"dont use my browser"**.
   * **NEVER** invoke `browser_subagent` or open automated browser windows.
   * Verify all frontend and backend endpoints using shell commands (e.g. `npx tsc --noEmit`, PowerShell `Invoke-WebRequest` or `curl`).

2. **Teacher Focus Table Domain Invariants**:
   * **Subject Scoping**: The Focus Table is subject-scoped (**Mathematics**, taught by Mrs. Ananya Verma).
   * **Section Filtering**: Teachers filter by **Sections** (`Class 8-B`, `Class 8-A`, `Class 9-A`, `Class 9-B`, `All`), **NOT** by subject.
   * **Mastery Threshold**: Students with exam score $>70\%$ are **Exempt** from the focus plan. Only students scoring $\le 70\%$ are in the 1-Week Remedial sprint.
   * **State Machine Invariant**: For any previous day ($d < \text{current day}$), status can **never** be "Upcoming". It can only toggle between `Completed ✓` and `Pending Review ⏳`.
   * **Rough Work Inspection**: The rough paper review section must display the **Assigned Practice Question(s)** and **Teacher Rubric Checkpoint** directly alongside the student's solution steps.
   * **No Telephonic Call Scripts**: The old "Copy Call Script" and talking points text have been removed in favor of 1-click WhatsApp progress updates and direct PTM booking.

3. **Code Quality & Style**:
   * Strict TypeScript typing (always verify with `npx tsc --noEmit` before concluding).
   * Dark / Light mode compatibility with Tailwind CSS.
   * Maintain clean component boundaries and zero clutter.
