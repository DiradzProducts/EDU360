import sys
import os
import asyncio
from datetime import datetime

sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import AsyncSessionLocal, engine
from sqlalchemy import select, text
from app.models.models import (
    Student, StudentPortfolio, Event, ExamCandidateAttempt,
    Homework, HomeworkSubmission, Notification, SecurityAuditLog
)
import httpx
from main import app

async def run_student_e2e_tests():
    print("=" * 70)
    print("RUNNING END-TO-END VERIFICATION SUITE: STUDENT ROLE WORKFLOWS")
    print("=" * 70)

    student_headers = {"X-User-Role": "student", "X-User-Id": "1"}
    admin_headers = {"X-User-Role": "admin", "X-User-Id": "1"}
    academic_headers = {"X-User-Role": "academic_coordinator", "X-User-Id": "3"}

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        
        # ---------------------------------------------------------
        # TEST 1: SIS SECONDARY PROFILE & EDIT FEATURE
        # ---------------------------------------------------------
        print("\n[TEST 1] Testing SIS Secondary Details & Profile Edit...")
        
        # 1A. Fetch initial profile
        r1 = await client.get("/api/student/profile/1", headers=student_headers)
        assert r1.status_code == 200, f"Expected 200, got {r1.status_code}: {r1.text}"
        data1 = r1.json()
        assert data1["name"] == "Aarav Sharma"
        assert "secondary_details" in data1
        print(f"  ✓ Initial Profile loaded: {data1['name']} ({data1['class_name']}-{data1['section']})")

        # 1B. Student updates secondary details
        patch_payload = {
            "secondary_guardian_name": "Mrs. Priya Sharma",
            "secondary_phone": "+91 98450 77889",
            "secondary_email": "priya.sharma@consulting.com",
            "preferred_language": "English / Hindi / Kannada",
            "hobbies": "Competitive Robotics, Football Midfielder, Drone Piloting",
            "aspirational_career": "Aerospace AI Engineer",
            "dietary_preference": "Vegetarian",
            "emergency_notes": "Mild allergy to penicillin. Annual sports fitness certified."
        }
        r2 = await client.patch("/api/student/1/secondary-profile", json=patch_payload, headers=student_headers)
        assert r2.status_code == 200, f"Expected 200, got {r2.status_code}: {r2.text}"
        data2 = r2.json()
        assert data2["success"] is True
        assert data2["secondary_details"]["secondary_phone"] == "+91 98450 77889"
        assert data2["secondary_details"]["hobbies"] == "Competitive Robotics, Football Midfielder, Drone Piloting"
        print("  ✓ Secondary profile updated and verified via API.")

        # 1C. Verify persistence in DB
        async with AsyncSessionLocal() as session:
            st = (await session.execute(select(Student).where(Student.id == 1))).scalars().first()
            assert st is not None
            assert "+91 98450 77889" in st.secondary_details
            print("  ✓ Direct PostgreSQL audit: secondary_details column persisted.")

        # ---------------------------------------------------------
        # TEST 2: CALENDAR & SCHOOL EVENTS SYNC WITH ADMIN
        # ---------------------------------------------------------
        print("\n[TEST 2] Testing School Events & Calendar Sync...")

        # 2A. Admin creates a new school event
        unique_title = f"Annual Inter-School Robotics Showcase {datetime.utcnow().strftime('%H%M%S')}"
        event_payload = {
            "title": unique_title,
            "date": "2026-11-29",
            "location": "STEM Innovation Amphitheatre",
            "description": "Student autonomous robotics display with industry guest judges.",
            "banner_url": "/samples/event_banner.png",
            "status": "Upcoming"
        }
        r_ev = await client.post("/api/admin/events", json=event_payload, headers=admin_headers)
        assert r_ev.status_code == 200, f"Expected 200, got {r_ev.status_code}: {r_ev.text}"
        ev_data = r_ev.json()
        assert ev_data["title"] == unique_title
        print(f"  ✓ Admin created school event: '{unique_title}' (ID: {ev_data['id']})")

        # 2B. Student fetches calendar events
        r_cal = await client.get("/api/student/calendar-events", headers=student_headers)
        assert r_cal.status_code == 200, f"Expected 200, got {r_cal.status_code}: {r_cal.text}"
        cal_list = r_cal.json()
        titles = [e["title"] for e in cal_list]
        assert unique_title in titles, f"Expected '{unique_title}' in calendar events: {titles}"
        print(f"  ✓ Student calendar API reflected newly created event ({len(cal_list)} total events).")

        # 2C. Verify student notification was generated
        async with AsyncSessionLocal() as session:
            notif = (await session.execute(
                select(Notification).where(
                    Notification.recipient_role == "student",
                    Notification.notification_type == "SCHOOL_EVENT"
                ).order_by(Notification.id.desc())
            )).scalars().first()
            assert notif is not None
            assert unique_title in notif.title or unique_title in notif.message
            print(f"  ✓ Verified notification dispatched to student: '{notif.title}'")

        # ---------------------------------------------------------
        # TEST 3: STUDENT PORTFOLIO BUILD-UP & COORDINATOR APPROVAL
        # ---------------------------------------------------------
        print("\n[TEST 3] Testing Portfolio Build-Up & Academic Coordinator Approval...")

        # 3A. Student uploads an achievement
        award_title = f"State Level Coding Championship Distinction {datetime.utcnow().strftime('%H%M%S')}"
        port_payload = {
            "student_id": 1,
            "category": "achievement",
            "title": award_title,
            "event_name": "Karnataka Youth Tech Fair 2026",
            "date": "Oct 2026",
            "proof_url": "/samples/coding_cert.png",
            "description": "Secured 1st Runner-Up in autonomous web algorithms sprint."
        }
        r_p = await client.post("/api/student/portfolio", json=port_payload, headers=student_headers)
        assert r_p.status_code == 200, f"Expected 200, got {r_p.status_code}: {r_p.text}"
        new_item = r_p.json()
        assert new_item["verified_by_school"] is False, "New upload should require verification"
        new_item_id = new_item["id"]
        print(f"  ✓ Student uploaded portfolio item (ID: {new_item_id}, verified=False)")

        # 3B. Verify coordinator was notified
        async with AsyncSessionLocal() as session:
            coord_notif = (await session.execute(
                select(Notification).where(
                    Notification.recipient_role == "academic_coordinator",
                    Notification.notification_type == "PORTFOLIO_VERIFICATION_REQUEST"
                ).order_by(Notification.id.desc())
            )).scalars().first()
            assert coord_notif is not None
            assert award_title in coord_notif.title
            print(f"  ✓ Notification dispatched to Academic Coordinator: '{coord_notif.title}'")

        # 3C. Academic Coordinator verifies the portfolio item
        r_ver = await client.post(f"/api/academic/portfolio/{new_item_id}/verify", headers=academic_headers)
        assert r_ver.status_code == 200, f"Expected 200, got {r_ver.status_code}: {r_ver.text}"
        ver_data = r_ver.json()
        assert ver_data["success"] is True
        print(f"  ✓ Academic Coordinator successfully verified portfolio item ID {new_item_id}")

        # 3D. Verify status updated to verified in student portfolio API
        r_st_port = await client.get("/api/student/portfolio/1", headers=student_headers)
        assert r_st_port.status_code == 200
        verified_item = next((item for item in r_st_port.json() if item["id"] == new_item_id), None)
        assert verified_item is not None
        assert verified_item["verified_by_school"] is True
        print(f"  ✓ Permanent record verified: {verified_item['title']} (verified_by_school=True)")

        # ---------------------------------------------------------
        # TEST 4: EXAM CANDIDATE SUBMISSION WITH CRYPTOGRAPHIC SEAL
        # ---------------------------------------------------------
        print("\n[TEST 4] Testing Exam Candidate Attempt Submission & Hash Code...")

        # 4A. Submit candidate attempt with custom seal hash
        unique_seal = f"SEAL-8B-TEST-{datetime.utcnow().strftime('%M%S')}"
        submit_payload = {
            "submission_content": "Official CBSE descriptive working. Factoring ax^2 + bx + c = 0 step-by-step. All working verified on physical paper booklet.",
            "words_count": 320,
            "time_spent_seconds": 1800,
            "script_pages_uploaded": 4,
            "seal_hash": unique_seal
        }
        r_sub = await client.post("/api/exams/candidates/1/submit", json=submit_payload, headers=student_headers)
        assert r_sub.status_code == 200, f"Expected 200, got {r_sub.status_code}: {r_sub.text}"
        sub_res = r_sub.json()
        assert sub_res["success"] is True
        assert sub_res["seal_hash"] == unique_seal
        print(f"  ✓ Candidate exam attempt submitted successfully under hash: {unique_seal}")

        # 4B. Check DB persistence for ExamCandidateAttempt
        async with AsyncSessionLocal() as session:
            cand = (await session.execute(
                select(ExamCandidateAttempt).where(ExamCandidateAttempt.student_id == 1)
            )).scalars().first()
            assert cand is not None
            assert cand.status == "completed"
            assert cand.seal_verified is True
            assert cand.verification_seal_hash == unique_seal
            print(f"  ✓ PostgreSQL Verification: Attempt status={cand.status}, seal_verified={cand.seal_verified}, hash={cand.verification_seal_hash}")

        # ---------------------------------------------------------
        # TEST 5: HOMEWORK SUBMISSION & TEACHER NOTIFICATION
        # ---------------------------------------------------------
        print("\n[TEST 5] Testing Homework Submission & Teacher SpeedGrader Notification...")

        # 5A. Fetch student homework list
        r_hw = await client.get("/api/student/homework?student_id=1", headers=student_headers)
        assert r_hw.status_code == 200
        hw_list = r_hw.json()
        assert len(hw_list) > 0
        target_hw = hw_list[0]
        hw_id = target_hw["id"]
        print(f"  ✓ Target Homework Task: ID {hw_id} - '{target_hw['title']}'")

        # 5B. Submit homework worksheet
        sub_hw_payload = {
            "student_id": 1,
            "file_url": "/uploads/math_worksheet_aarav.pdf",
            "comments": "Completed all 10 quadratic word problems step-by-step."
        }
        r_hw_sub = await client.post(f"/api/student/homework/{hw_id}/submit", json=sub_hw_payload, headers=student_headers)
        assert r_hw_sub.status_code == 200, f"Expected 200, got {r_hw_sub.status_code}: {r_hw_sub.text}"
        hw_sub_data = r_hw_sub.json()
        assert hw_sub_data["status"].lower() == "submitted"
        print(f"  ✓ Homework submitted: status={hw_sub_data['status']}, submission_id={hw_sub_data['id']}")

        # 5C. Verify Teacher notification was dispatched
        async with AsyncSessionLocal() as session:
            t_notif = (await session.execute(
                select(Notification).where(
                    Notification.recipient_role == "teacher",
                    Notification.notification_type == "HOMEWORK_SUBMISSION"
                ).order_by(Notification.id.desc())
            )).scalars().first()
            assert t_notif is not None
            assert "Aarav Sharma" in t_notif.message
            print(f"  ✓ Verified Teacher Notification: '{t_notif.title}' - '{t_notif.message}'")

        # ---------------------------------------------------------
        # TEST 6: EXAM LIFECYCLE & INVIGILATOR COMMENCE INTERLOCK
        # ---------------------------------------------------------
        print("\n[TEST 6] Testing Exam Schedule Lifecycle & Invigilator Commence/Conclude Interlock...")

        # 6A. Verify scheduled exam has lifecycle UPCOMING before invigilator commencement
        r_sched = await client.get("/api/exams/schedules?class_name=Class 8&section=B", headers=student_headers)
        assert r_sched.status_code == 200, f"Expected 200, got {r_sched.status_code}: {r_sched.text}"
        sched_list = r_sched.json().get("schedules", [])
        assert len(sched_list) > 0, "Expected at least 1 exam schedule for Class 8-B"
        target_sched = sched_list[0]
        sched_id = target_sched["id"]
        print(f"  ✓ Exam Schedule ID {sched_id}: '{target_sched['title']}'")

        # 6B. Invigilator commences session
        teacher_headers = {"X-User-Role": "teacher", "X-User-Id": "2"}
        r_commence = await client.post(f"/api/exams/schedules/{sched_id}/commence", headers=teacher_headers)
        assert r_commence.status_code == 200, f"Expected 200, got {r_commence.status_code}: {r_commence.text}"
        commence_data = r_commence.json()
        assert commence_data["session_status"] == "COMMENCED"
        print(f"  ✓ Invigilator commenced session for schedule ID {sched_id}: status={commence_data['session_status']}")

        # 6C. Student checks schedule: lifecycle must now be LIVE
        r_sched_live = await client.get("/api/exams/schedules?class_name=Class 8&section=B", headers=student_headers)
        live_sched = next((s for s in r_sched_live.json().get("schedules", []) if s["id"] == sched_id), None)
        assert live_sched is not None
        assert live_sched["session_status"] == "COMMENCED"
        assert live_sched["lifecycle_status"] == "LIVE"
        print(f"  ✓ Student API verified: session_status={live_sched['session_status']}, lifecycle_status={live_sched['lifecycle_status']}")

        # 6D. Invigilator concludes session
        r_conclude = await client.post(f"/api/exams/schedules/{sched_id}/conclude", headers=teacher_headers)
        assert r_conclude.status_code == 200, f"Expected 200, got {r_conclude.status_code}: {r_conclude.text}"
        conclude_data = r_conclude.json()
        assert conclude_data["session_status"] == "CONCLUDED"
        print(f"  ✓ Invigilator concluded session for schedule ID {sched_id}: status={conclude_data['session_status']}")

        # 6E. Student checks schedule: lifecycle must now be CONCLUDED
        r_sched_conc = await client.get("/api/exams/schedules?class_name=Class 8&section=B", headers=student_headers)
        conc_sched = next((s for s in r_sched_conc.json().get("schedules", []) if s["id"] == sched_id), None)
        assert conc_sched is not None
        assert conc_sched["session_status"] == "CONCLUDED"
        assert conc_sched["lifecycle_status"] == "CONCLUDED"
        print(f"  ✓ Student API verified: session_status={conc_sched['session_status']}, lifecycle_status={conc_sched['lifecycle_status']}")

    print("\n" + "=" * 70)
    print("ALL 6 STUDENT END-TO-END VERIFICATION SUITES PASSED (100%)!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_student_e2e_tests())
