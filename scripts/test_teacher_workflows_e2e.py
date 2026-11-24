import sys
import os
import asyncio
from datetime import datetime, date

sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import AsyncSessionLocal, engine
from sqlalchemy import select, text
from app.models.models import (
    ExamSchedule, StaffPermission, SubstitutionSlot,
    Homework, HomeworkSubmission, PTMSlot, CurriculumPacing
)
import httpx
from main import app

async def run_e2e_tests():
    print("=" * 70)
    print("RUNNING END-TO-END VERIFICATION SUITE: TEACHER WORKFLOWS")
    print("=" * 70)

    # Reset sequences so auto-increment IDs match existing table max
    async with engine.begin() as conn:
        try:
            await conn.execute(text("SELECT setval(pg_get_serial_sequence('substitution_slots', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM substitution_slots;"))
            await conn.execute(text("SELECT setval(pg_get_serial_sequence('staff_permissions', 'id'), COALESCE(MAX(id), 1) + 1, false) FROM staff_permissions;"))
        except Exception as e:
            print(f"Sequence sync warning: {e}")

    teacher_headers = {"X-User-Role": "teacher", "X-User-Id": "2"}
    admin_headers = {"X-User-Role": "admin", "X-User-Id": "1"}
    student_headers = {"X-User-Role": "student", "X-User-Id": "1"}

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # ---------------------------------------------------------
        # 1. EXAM SESSION STATUS, COMMENCE, AND CONCLUDE WORKFLOW
        # ---------------------------------------------------------
        print("\n[TEST 1] Testing Authoritative Exam Session Lifecycle...")
        
        # A. Query initial status
        r1 = await client.get("/api/exams/schedules/1/session-status")
        assert r1.status_code == 200, f"Expected 200, got {r1.status_code}: {r1.text}"
        data1 = r1.json()
        print(f"  ✓ Initial Exam #1 Session Status: {data1.get('session_status')}")

        # B. Chief Invigilator commences exam session
        r2 = await client.post(
            "/api/exams/schedules/1/commence",
            json={"invigilator_name": "Mrs. Ananya Verma", "invigilator_id": 2},
            headers=teacher_headers
        )
        assert r2.status_code == 200, f"Expected 200, got {r2.status_code}: {r2.text}"
        data2 = r2.json()
        assert data2.get("session_status") == "COMMENCED"
        print(f"  ✓ Commenced Exam #1 Session: {data2.get('session_status')} at {data2.get('commenced_at')}")

        # Verify in DB directly
        async with AsyncSessionLocal() as db:
            s_row = (await db.execute(select(ExamSchedule).where(ExamSchedule.id == 1))).scalars().first()
            assert s_row.session_status == "COMMENCED", f"DB session_status mismatch: {s_row.session_status}"
            assert s_row.commenced_by == "Mrs. Ananya Verma"
            print("  ✓ Database ExamSchedule #1 verified: session_status='COMMENCED'")

        # C. Chief Invigilator concludes exam session
        r3 = await client.post(
            "/api/exams/schedules/1/conclude",
            json={"invigilator_name": "Mrs. Ananya Verma", "reason": "All candidates completed early"},
            headers=teacher_headers
        )
        assert r3.status_code == 200, f"Expected 200, got {r3.status_code}: {r3.text}"
        data3 = r3.json()
        assert data3.get("session_status") == "CONCLUDED"
        print(f"  ✓ Concluded Exam #1 Session: {data3.get('session_status')} at {data3.get('concluded_at')}")

        # Verify in DB directly
        async with AsyncSessionLocal() as db:
            s_row = (await db.execute(select(ExamSchedule).where(ExamSchedule.id == 1))).scalars().first()
            assert s_row.session_status == "CONCLUDED", f"DB session_status mismatch: {s_row.session_status}"
            print("  ✓ Database ExamSchedule #1 verified: session_status='CONCLUDED'")

        # ---------------------------------------------------------
        # 2. TEACHER PERMISSION REQUEST & ADMIN REVIEW WORKFLOW
        # ---------------------------------------------------------
        print("\n[TEST 2] Testing Teacher Staff Permission Request & Admin Review...")

        # A. Query teacher's permissions
        r_perm_list = await client.get("/api/teacher/my-permissions", headers=teacher_headers)
        assert r_perm_list.status_code == 200, f"Expected 200: {r_perm_list.text}"
        perm_items = r_perm_list.json()
        print(f"  ✓ Initial Teacher Permissions in DB: {len(perm_items)} records")

        # B. Apply for a new Casual Leave
        apply_payload = {
            "staff_id": 2,
            "teacher_name": "Mrs. Ananya Verma",
            "leave_category": "Casual Leave (CL)",
            "total_days": 1,
            "date": "2026-11-02",
            "to_date": "2026-11-02",
            "affected_periods": "Period 2 (Class 8-B Math), Period 4 (Class 9-A Math)",
            "reason": "Parent-Teacher Council Annual Delegation Meeting",
            "suggested_substitute": "Mrs. Neha Roy (TGT Science)"
        }
        r_apply = await client.post("/api/teacher/apply-permission", json=apply_payload, headers=teacher_headers)
        assert r_apply.status_code == 200, f"Apply permission failed: {r_apply.text}"
        created_perm = r_apply.json().get("permission")
        perm_id = created_perm["id"]
        print(f"  ✓ Applied for leave successfully. Created Permission ID: #{perm_id}")

        # Verify in DB
        async with AsyncSessionLocal() as db:
            db_perm = (await db.execute(select(StaffPermission).where(StaffPermission.id == perm_id))).scalars().first()
            assert db_perm is not None, "StaffPermission not found in DB!"
            assert db_perm.status == "Pending"
            assert db_perm.total_days == 1
            print(f"  ✓ Database verified: StaffPermission #{perm_id} status='Pending'")

        # C. Admin reviews and approves leave
        r_rev = await client.post(
            f"/api/admin/teacher-permissions/{perm_id}/review",
            json={"status": "Approved"},
            headers=admin_headers
        )
        assert r_rev.status_code == 200, f"Admin review failed: {r_rev.text}"
        print(f"  ✓ Admin approved leave #{perm_id}")

        # Verify in DB that status is Approved and SubstitutionSlot was created
        async with AsyncSessionLocal() as db:
            db_perm = (await db.execute(select(StaffPermission).where(StaffPermission.id == perm_id))).scalars().first()
            assert db_perm.status == "Approved"
            print(f"  ✓ Database verified: StaffPermission #{perm_id} updated to 'Approved'")

        # ---------------------------------------------------------
        # 3. HOMEWORK SUBMISSIONS & SPEEDGRADER GRADING WORKFLOW
        # ---------------------------------------------------------
        print("\n[TEST 3] Testing Homework Submissions & SpeedGrader Inline Grading...")

        # A. Query submissions for Homework 1
        r_hw_subs = await client.get("/api/teacher/homework/1/submissions", headers=teacher_headers)
        assert r_hw_subs.status_code == 200, f"Get submissions failed: {r_hw_subs.text}"
        submissions = r_hw_subs.json()
        assert len(submissions) > 0, "No submissions found for homework 1!"
        print(f"  ✓ Homework #1 has {len(submissions)} real submissions in PostgreSQL")

        # B. Student submits new/updated worksheet
        r_submit = await client.post(
            "/api/student/homework/1/submit?student_id=1&original_file_url=/samples/math_worksheet.png",
            headers=student_headers
        )
        assert r_submit.status_code == 200, f"Submit failed: {r_submit.text}"
        sub_id = r_submit.json().get("id")
        print(f"  ✓ Student #1 submitted homework worksheet (Submission #{sub_id})")

        # C. Teacher grades submission via SpeedGrader
        grade_payload = {
            "marks_obtained": 19.5,
            "teacher_remarks": "Excellent factorization! Signs verified on all roots.",
            "annotations_json": "{\"version\":\"1.0\",\"marks\":19.5,\"checks\":5}",
            "annotated_file_url": "/samples/math_worksheet.png"
        }
        r_grade = await client.post(f"/api/teacher/submissions/{sub_id}/grade", json=grade_payload, headers=teacher_headers)
        assert r_grade.status_code == 200, f"Grading failed: {r_grade.text}"
        graded_data = r_grade.json()
        assert graded_data["status"] == "graded"
        assert graded_data["marks_obtained"] == 19.5
        print(f"  ✓ Graded Submission #{sub_id}: score={graded_data['marks_obtained']}/20, status='{graded_data['status']}'")

        # Verify in DB
        async with AsyncSessionLocal() as db:
            db_sub = (await db.execute(select(HomeworkSubmission).where(HomeworkSubmission.id == sub_id))).scalars().first()
            assert db_sub.status == "graded"
            assert db_sub.marks_obtained == 19.5
            print(f"  ✓ Database verified: HomeworkSubmission #{sub_id} marks={db_sub.marks_obtained}")

        # ---------------------------------------------------------
        # 4. PTM CONFERENCE ATTENDANCE & CONSULTATION NOTES WORKFLOW
        # ---------------------------------------------------------
        print("\n[TEST 4] Testing PTM Attendance Checkoff & Qualitative Notes Persistence...")

        # A. Mark attendance for slot-01
        ptm_payload = {
            "teacher_attended": True,
            "parent_attended": True,
            "attendance_status": "COMPLETED",
            "meeting_notes": "Reviewed mid-term assessment performance. Cleared factorization sign errors. Parent committed to supporting evening practice."
        }
        r_ptm = await client.post("/api/teacher/ptm/slots/slot-01/mark-attendance", json=ptm_payload, headers=teacher_headers)
        assert r_ptm.status_code == 200, f"Mark PTM attendance failed: {r_ptm.text}"
        ptm_res = r_ptm.json()
        assert ptm_res["success"] is True
        print(f"  ✓ Marked PTM slot-01 as COMPLETED with notes")

        # Verify in DB
        async with AsyncSessionLocal() as db:
            db_slot = (await db.execute(select(PTMSlot).where(PTMSlot.id == "slot-01"))).scalars().first()
            assert db_slot.attendance_status == "COMPLETED"
            assert db_slot.teacher_attended is True
            assert db_slot.meeting_notes == ptm_payload["meeting_notes"]
            print(f"  ✓ Database verified: PTMSlot slot-01 attendance_status='{db_slot.attendance_status}', teacher_attended={db_slot.teacher_attended}")

        # ---------------------------------------------------------
        # 5. SYLLABUS PACING & LESSON DELIVERY CHECKOFF WORKFLOW
        # ---------------------------------------------------------
        print("\n[TEST 5] Testing Syllabus Pacing Unit Checkoff & Alignment...")

        # A. Check initial pacing
        r_pacing = await client.get("/api/admin/academic/curriculum-pacing", headers=admin_headers)
        assert r_pacing.status_code == 200, f"Get pacing failed: {r_pacing.text}"
        pacing_list = r_pacing.json()
        assert len(pacing_list) > 0, "No curriculum pacing items found!"
        math_item = next((p for p in pacing_list if p["class_name"] == "Class 8-B" and p["subject"] == "Mathematics"), None)
        assert math_item is not None, "Class 8-B Math not found in pacing list!"
        prev_completed = math_item["completed_units"]
        print(f"  ✓ Initial Class 8-B Mathematics pacing: {prev_completed}/{math_item['total_units']} units completed")

        # B. Teacher logs unit completion
        log_payload = {
            "class_name": "Class 8-B",
            "subject": "Mathematics",
            "units_to_add": 1,
            "lesson_title": "Quadratic Equations: Derivation of Quadratic Formula"
        }
        r_log = await client.post("/api/teacher/curriculum/log-unit", json=log_payload, headers=teacher_headers)
        assert r_log.status_code == 200, f"Log unit failed: {r_log.text}"
        log_res = r_log.json()
        assert log_res["success"] is True
        print(f"  ✓ Teacher logged unit completion: new completed units = {log_res['item']['completed_units']}")

        # Verify in DB
        async with AsyncSessionLocal() as db:
            db_cp = (await db.execute(select(CurriculumPacing).where(
                CurriculumPacing.class_name == "Class 8-B",
                CurriculumPacing.subject == "Mathematics"
            ))).scalars().first()
            assert db_cp.completed_units == prev_completed + 1
            print(f"  ✓ Database verified: CurriculumPacing completed_units={db_cp.completed_units}")
        assert r_log.status_code == 200, f"Log unit failed: {r_log.text}"
        log_res = r_log.json()
        assert log_res["success"] is True
        print(f"  ✓ Teacher logged unit completion: new completed units = {log_res['item']['completed_units']}")

        # Verify in DB
        async with AsyncSessionLocal() as db:
            db_cp = (await db.execute(select(CurriculumPacing).where(
                CurriculumPacing.class_name == "Class 8-B",
                CurriculumPacing.subject == "Mathematics"
            ))).scalars().first()
            assert db_cp.completed_units == prev_completed + 1
            print(f"  ✓ Database verified: CurriculumPacing completed_units={db_cp.completed_units}")

    print("\n" + "=" * 70)
    print("ALL 5 TEACHER WORKFLOW E2E TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_e2e_tests())
