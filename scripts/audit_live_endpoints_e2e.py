import sys
import os
import asyncio
import httpx

sys.path.insert(0, os.path.abspath('backend'))
from main import app

async def run_audit():
    print("=" * 70)
    print("COMPREHENSIVE MULTI-ROLE ENDPOINT & WORKFLOW AUDIT")
    print("=" * 70)

    # Roles and test endpoints
    role_tests = [
        # 1. Super Admin
        {
            "role": "admin",
            "user_id": 1,
            "tests": [
                ("GET", "/api/admin/executive-pulse"),
                ("GET", "/api/admin/triage"),
                ("GET", "/api/admin/tasks"),
                ("GET", "/api/admin/staff"),
                ("GET", "/api/admin/students"),
                ("GET", "/api/admin/events"),
                ("GET", "/api/admin/fees/analytics"),
                ("GET", "/api/admin/exit-clearances"),
                ("GET", "/api/admin/teacher-permissions"),
                ("GET", "/api/admin/substitutions"),
            ]
        },
        # 2. Academic Coordinator
        {
            "role": "academic_coordinator",
            "user_id": 10,
            "tests": [
                ("GET", "/api/academic/exam-sync/requests"),
                ("GET", "/api/academic/ptm/faculty-attendance"),
                ("GET", "/api/admin/academic/curriculum-pacing"),
                ("GET", "/api/teacher/subjects"),
            ]
        },
        # 3. Exam Coordinator
        {
            "role": "exam_coordinator",
            "user_id": 11,
            "tests": [
                ("GET", "/api/exams/schedules"),
                ("GET", "/api/exams/class-readiness?class_name=Class%208-B"),
                ("GET", "/api/exams/report-cards"),
                ("GET", "/api/exams/question-papers"),
                ("GET", "/api/exams/absentees"),
                ("GET", "/api/exams/hall-tickets/student/1"),
            ]
        },
        # 4. Accounts Coordinator / Finance
        {
            "role": "accounts_coordinator",
            "user_id": 8,
            "tests": [
                ("GET", "/api/finance/stats"),
                ("GET", "/api/finance/defaulters"),
                ("GET", "/api/finance/payroll/batches"),
                ("GET", "/api/finance/transactions"),
                ("GET", "/api/finance/fee-structures"),
                ("GET", "/api/finance/invoices"),
            ]
        },
        # 5. Admissions Coordinator
        {
            "role": "admissions_coordinator",
            "user_id": 9,
            "tests": [
                ("GET", "/api/admin/crm/enquiries"),
                ("GET", "/api/admin/crm/check-guardian-phone?phone=%2B919876543210"),
            ]
        },
        # 6. Teacher
        {
            "role": "teacher",
            "user_id": 2,
            "tests": [
                ("GET", "/api/teacher/schedule"),
                ("GET", "/api/teacher/focus-table"),
                ("GET", "/api/teacher/live-classes"),
                ("GET", "/api/teacher/ptm/slots"),
                ("GET", "/api/teacher/homework"),
                ("GET", "/api/teacher/my-permissions"),
                ("GET", "/api/teacher/duties"),
            ]
        },
        # 7. Student
        {
            "role": "student",
            "user_id": 1,
            "tests": [
                ("GET", "/api/student/classes"),
                ("GET", "/api/student/homework"),
                ("GET", "/api/student/compliance/1"),
                ("GET", "/api/student/profile/1"),
                ("GET", "/api/student/submissions/1"),
                ("GET", "/api/student/portfolio/1"),
                ("GET", "/api/student/recordings"),
            ]
        },
        # 8. Parent
        {
            "role": "parent",
            "user_id": 3,
            "tests": [
                ("GET", "/api/parent/children"),
                ("GET", "/api/parent/focus-table/1"),
                ("GET", "/api/parent/fees/1"),
                ("GET", "/api/parent/ptm/slots"),
                ("GET", "/api/parent/today-homework/1"),
                ("GET", "/api/parent/bus-tracker/1"),
                ("GET", "/api/parent/leave-requests"),
                ("GET", "/api/parent/notes"),
            ]
        },
        # 9. Cross-Cutting Services (Clock & Notifications)
        {
            "role": "all",
            "user_id": 1,
            "tests": [
                ("GET", "/api/system/clock"),
                ("GET", "/api/notifications?role=teacher"),
                ("GET", "/api/notifications?role=parent"),
                ("GET", "/api/notifications?role=student"),
                ("GET", "/api/notifications?role=admin"),
                ("GET", "/api/health"),
            ]
        }
    ]

    total_tested = 0
    passed = 0
    failed = 0
    failures = []

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        for group in role_tests:
            role = group["role"]
            uid = group["user_id"]
            print(f"\n--- Testing Role: {role.upper()} (User ID: {uid}) ---")
            headers = {
                "X-User-Role": role,
                "X-User-Id": str(uid)
            }
            for method, endpoint in group["tests"]:
                total_tested += 1
                try:
                    if method == "GET":
                        res = await client.get(endpoint, headers=headers)
                    elif method == "POST":
                        res = await client.post(endpoint, headers=headers)

                    if res.status_code in [200, 201]:
                        passed += 1
                        print(f"  ✓ [{res.status_code}] {method} {endpoint}")
                    else:
                        failed += 1
                        failures.append((role, method, endpoint, res.status_code, res.text[:200]))
                        print(f"  ✗ [{res.status_code}] {method} {endpoint} -> {res.text[:120]}")
                except Exception as e:
                    failed += 1
                    failures.append((role, method, endpoint, 500, str(e)))
                    print(f"  ✗ [ERR] {method} {endpoint} -> {e}")

    print("\n" + "=" * 70)
    print(f"AUDIT SUMMARY: Total: {total_tested} | Passed: {passed} | Failed: {failed}")
    if failures:
        print("\nFAILURES DETECTED:")
        for r, m, ep, sc, err in failures:
            print(f"  - [{r}] {m} {ep} -> Status {sc}: {err}")
    else:
        print("PERFECT 100% PASS RATE ACROSS ALL 8 ROLES!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_audit())
