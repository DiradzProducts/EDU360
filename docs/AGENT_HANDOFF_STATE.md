# EDU360 — Agent Handoff & Continuation State

**Last Updated:** 2026-11-28 13:14 IST  
**Session Status:** Clean handoff — **no tasks were stopped mid-way**. All fixes started in this session are complete and verified (`29/29` Playwright tests passing), and the working tree is in a clean, runnable state.  
**Repository:** `e:\Diradz\EDU360` (Current HEAD: `571b924` — *Merge pull request #4 from DiradzProducts/jashwanth-ui*)  
**Stack:** Next.js 16.4.6 (Turbopack, React 19, Tailwind v4) on `http://localhost:3000` + FastAPI (Python 3.11+, Async SQLAlchemy) on `http://localhost:8000`

---

## 1. Environment & Playwright E2E Setup (Ready to Run)

Playwright is **fully installed and configured** inside `e:\Diradz\EDU360\frontend`:
- **Config:** `frontend/playwright.config.ts` (`baseURL: http://localhost:3000`, auto-starts `npm run dev` via `webServer` with `reuseExistingServer: true`)
- **Test Suites:**
  - `frontend/tests/e2e/smoke.spec.ts` (public routes + all 9 role logins)
  - `frontend/tests/e2e/role-workflows.spec.ts` (website admission modal + interactive tab traversal across all 8 roles, outputs `frontend/test-results/workflow-audit-report.json`)
  - `frontend/tests/e2e/stage3-workflows.spec.ts` (existing Stage 3 verification suite)
- **Commands (from `e:\Diradz\EDU360\frontend`):**
  - `npm run test:e2e` — runs all Playwright tests (**last run: 29 / 29 passed**)
  - `npm run test:e2e:ui` — interactive Playwright UI runner
- **Backend Server (must be running on `:8000`):**
  ```powershell
  cd e:\Diradz\EDU360\backend
  .\venv\Scripts\uvicorn.exe main:app --port 8000
  ```
- **Universal Test Credentials (`Password123`, school code `EDU-GLOBAL-360`):**
  - `admin` → `/admin`
  - `academic_coordinator` → `/academic_coordinator`
  - `exam_coordinator` → `/exam_coordinator`
  - `accounts_coordinator` → `/accounts_coordinator`
  - `admissions_coordinator` → `/admissions_coordinator`
  - `teacher_mat` → `/teacher`
  - `sr_student` → `/student`
  - `junior` → `/junior`
  - `parent` → `/parent`

---

## 2. Fixes Completed in the Last Session (Verified Passing)

1. **Public Website Enquiries & Demo Bookings (`401` + Mocked Demo Fixed):**
   - Added unauthenticated `POST /api/public/enquiries` in `backend/main.py` (lines 103–148) that persists `AdmissionEnquiry` to DB and creates a DB notification for `admissions_coordinator`.
   - Updated `handleDemoSubmit` and `handleAdmissionSubmit` in `frontend/src/components/demo-booking-modal.tsx` (lines 76–125) to `POST` to `/api/public/enquiries`.
2. **Admissions Convert Enquiry to SIS (`500` Fixed):**
   - Fixed three `NameError`s in `convert_enquiry_to_student` (`backend/app/routers/admin.py`, lines 1434, 1451, 1458): `base_class` → `new_student.class_name`, `student_uname` → `student_user.username`, `parent_uname` → `parent_user.username`.
   - Verified live: `POST /api/public/enquiries` → `200`, `POST /api/admin/crm/enquiries/{id}/convert` → `200`.
3. **Junior Student Login Redirect Fixed:**
   - Updated `loginWithCredentials` (`frontend/src/lib/auth-context.tsx`, lines 204–215) and auto-redirect (`frontend/src/app/login/page.tsx`, lines 36–47) so K-5 / `junior` users redirect to `/junior` instead of `/student`.
4. **Accounts Prerender & Mobile Navbar Compaction:**
   - Replaced unstable `Date.now()` in `frontend/src/lib/fee-ledger.ts` (line 84) with a static ISO string.
   - Compacted mobile navbar spacing/labels in `frontend/src/components/navbar.tsx` (lines 188–253).

---

## 3. Remaining Open Bugs & Gaps (Prioritized Backlog for Next Agent)

### P0 — Cross-Role Data, Notifications & RBAC
1. **Client-Only Notifications (`publishClientNotification`):**
   - `frontend/src/lib/api.ts` (lines 14551–14590 and 20+ call sites) uses `publishClientNotification`, which only writes to `localStorage` and `BroadcastChannel` (`edu360_global_notifications`)—never persisting to DB `/api/notifications/`. Replace or back these with real backend `create_system_notification` / `POST /api/notifications/`.
2. **Silent Error Masking (`api.ts`):**
   - All 189 mapped `api.*` methods in `frontend/src/lib/api.ts` wrap requests in `try/catch` fallbacks, hiding `401/403/404/422/500` failures and making broken writes look successful in UI.
3. **RBAC `403` / `404` / `422` Mismatches on Direct Role Endpoints:**
   - `Student` calling `GET /api/admin/students/1/documents` or `GET /api/admin/substitutions` returns `403 Forbidden` (`"Staff access required"`).
   - `Parent` calling `GET /api/admin/exit-clearances/student/1` returns `403 Forbidden`.
   - `Parent` `POST /api/parent/leave-requests` returns `422` unless `student_name` and `parent_name` are sent.
   - `Admin` Student TC lookup `GET /api/inventory/clearance/student/999` returns `404`.

### P1 — React Warnings & Visual/UI Gaps (Observed via Playwright)
1. **Teacher Portal Console & Copy Bugs (`frontend/src/app/teacher/page.tsx`):**
   - Logs duplicate React key (`1`) errors during tab switching.
   - Line 1900 uses `new Date()` inside `useState` initializer (Next.js prerender warning).
   - Live invigilation banner renders `"English Literature: Class 8 Mathematics Examination"`.
   - **PARENT & LEAVE QUEUE** card displays `0 Pending` alongside a `"Review Required"` badge.
2. **Dark Sidebar Contrast (Non-Admin Portals):**
   - In `/teacher`, `/student`, `/parent`, `/academic_coordinator`, `/accounts_coordinator`, the top-left school/user block and sidebar pills (`Archive`, `12 Weak Areas`, `32 Urgent`, `5 Pending`, `4 Transfers`) render dark text on a dark `#062820` background.
3. **Desktop Clipping & Overlaps (`1440x900`):**
   - `/admin`: Priority Action Queue **ACTION** column (`Review` / `Open TC`) is clipped on the right edge.
   - `/student`: Floating announcement banner overlaps the hero card (`Present Today ✓` / `P3 Live` pills); Period 3 displays `"Room 204 & Stream & Stream"`.
   - `/parent`: Hero card renders blank `"Homeroom Faculty: •"` / `"guided by ."` and greeting mismatch (`"Dr. & Mrs. Sharma"` vs `"Mr. Rajesh Sharma"`).
   - `/accounts_coordinator`: Monthly Cash Pulse bar width for Vendor Invoices (`₹3,83,100`) is shorter than Monthly Staff Salaries (`₹2,19,700`).
   - `/junior`: Monkey mascot overlaps `"CBSE Class 3-A"` header badge.
   - `/`: Floating `"99.8% Online Attendance"` card overlaps the dashboard mockup URL bar.

### P2 — Cleanup & Coverage
1. **Junior Portal Write Flows:** `JuniorStudentDashboard.tsx` currently only wires 3 read calls (`getJuniorOverview`, `getAdventureTimetable`, `getPortfolio`).
2. **Git Hygiene:** Add `frontend/playwright-report/` and `frontend/test-results/` to `.gitignore`, and review/commit the pending fixes cleanly.

---

## 4. Reference Docs
- `docs/architecture/ROLE_WISE_ARCHITECTURE_AND_WORKFLOWS.md`
- `docs/workflows/EDU360_ROLE_WISE_DAILY_WORKFLOWS_KT.md`
- `README.md`
