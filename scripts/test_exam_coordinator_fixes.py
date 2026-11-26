import asyncio
import sys
import os
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.core.database import AsyncSessionLocal
from app.models.models import Student, ReportCard, FeeDefaulter, Notification
from app.routers.exams import (
    publish_batch_report_cards,
    publish_single_report_card,
    list_report_cards,
    get_surveillance_room,
    GenerateBatchReportCardsRequest
)
from sqlalchemy import select, and_, delete

async def test_exam_coordinator_fixes():
    print("==================================================")
    print("🧪 RUNNING EXAM COORDINATOR FIXES VERIFICATION")
    print("==================================================")

    async with AsyncSessionLocal() as db:
        # Setup test data: Ensure Class 8-B has at least 2 students
        # Student 1: Aarav Sharma (student_id = 1, on active Fee Hold: amount_due=15000, exam_clearance=False)
        # Student 2: Cleared Student (e.g. Diya Patel, student_id = 2, amount_due=0, exam_clearance=True)
        
        # 1. Verify or create FeeDefaulter for Aarav Sharma
        aarav_def = (await db.execute(select(FeeDefaulter).where(FeeDefaulter.student_id == 1))).scalars().first()
        if not aarav_def:
            aarav_def = FeeDefaulter(
                student_id=1,
                student_name="Aarav Sharma",
                class_name="Class 8-B",
                roll_no="14",
                parent_name="Mr. Rajesh Sharma",
                parent_phone="+91 98111 00003",
                milestone_title="Term 2 Tuition Fee",
                amount_due=15000.0,
                exam_clearance=False,
                status="Overdue"
            )
            db.add(aarav_def)
        else:
            aarav_def.amount_due = 15000.0
            aarav_def.exam_clearance = False
            aarav_def.status = "Overdue"

        # Ensure cleared defaulter (or remove hold) for student 2
        cleared_def = (await db.execute(select(FeeDefaulter).where(FeeDefaulter.student_id == 2))).scalars().first()
        if cleared_def:
            cleared_def.amount_due = 0.0
            cleared_def.exam_clearance = True
            cleared_def.status = "Cleared"

        # Setup Report Cards for Aarav and Cleared Student
        # Clean up existing test cards
        await db.execute(delete(ReportCard).where(ReportCard.class_name == "Class 8", ReportCard.section == "B", ReportCard.term == "Term 1 Test"))
        await db.commit()

        rc_aarav = ReportCard(
            student_id=1,
            student_name="Aarav Sharma",
            roll_no="14",
            class_name="Class 8",
            section="B",
            term="Term 1 Test",
            academic_year="2025-2026",
            grades_grid_json='{"Mathematics": {"marks": 45, "max": 50, "grade": "A1"}}',
            total_marks_obtained=45.0,
            max_total_marks=50.0,
            overall_percentage=90.0,
            overall_grade="A1",
            attendance_pct=95.0,
            is_published=False
        )
        rc_cleared = ReportCard(
            student_id=2,
            student_name="Diya Patel",
            roll_no="01",
            class_name="Class 8",
            section="B",
            term="Term 1 Test",
            grades_grid_json='{"Mathematics": {"marks": 48, "max": 50, "grade": "A1+"}}',
            total_marks_obtained=48.0,
            max_total_marks=50.0,
            overall_percentage=96.0,
            overall_grade="A1+",
            attendance_pct=98.0,
            is_published=False
        )
        db.add(rc_aarav)
        db.add(rc_cleared)
        await db.commit()
        await db.refresh(rc_aarav)
        await db.refresh(rc_cleared)

        print(f"✅ Test setup: Aarav Sharma RC id={rc_aarav.id} (ON HOLD), Diya Patel RC id={rc_cleared.id} (CLEARED)")

        # -------------------------------------------------------------
        # TEST 1: Single Report Card Publish Gate (Accounts Fee Hold Check)
        # -------------------------------------------------------------
        print("\n--- TEST 1: Single Report Card Publish Gate ---")
        single_res_aarav = await publish_single_report_card(rc_aarav.id, db=db)
        assert single_res_aarav["success"] is False, "Aarav's report card should NOT publish due to active fee hold"
        assert single_res_aarav.get("is_on_hold") is True
        print(f"✅ Single publish correctly blocked for student on fee hold: {single_res_aarav['message']}")

        single_res_cleared = await publish_single_report_card(rc_cleared.id, db=db)
        assert single_res_cleared["success"] is True, "Cleared student's report card should publish successfully"
        print(f"✅ Single publish succeeded for cleared student: {single_res_cleared['message']}")

        # -------------------------------------------------------------
        # TEST 2: Batch Report Card Release & Fee Hold Enforcement
        # -------------------------------------------------------------
        print("\n--- TEST 2: Batch Report Card Release Gate ---")
        # Reset publish state for testing batch
        rc_cleared.is_published = False
        await db.commit()

        batch_req = GenerateBatchReportCardsRequest(class_name="Class 8", section="B", term="Term 1 Test")
        batch_res = await publish_batch_report_cards(batch_req, db=db)
        
        assert batch_res["success"] is True
        assert batch_res["published_count"] == 1, f"Expected 1 published, got {batch_res['published_count']}"
        assert batch_res["withheld_count"] == 1, f"Expected 1 withheld, got {batch_res['withheld_count']}"
        assert "Aarav Sharma" in batch_res["withheld_names"]
        print(f"✅ Batch release executed: {batch_res['message']}")
        print(f"   Published: {batch_res['published_count']}, Withheld: {batch_res['withheld_count']} ({batch_res['withheld_names']})")

        # -------------------------------------------------------------
        # TEST 3: Report Card Query Redaction for Held vs Cleared
        # -------------------------------------------------------------
        print("\n--- TEST 3: Report Card Query Redaction ---")
        query_aarav = await list_report_cards(student_id=1, term="Term 1 Test", db=db)
        aarav_cards = query_aarav["report_cards"]
        assert len(aarav_cards) > 0, "Aarav card should be retrieved with hold status"
        aarav_card = aarav_cards[0]
        assert aarav_card["is_on_hold"] is True, "Aarav must have is_on_hold == True"
        assert aarav_card["overall_grade"] == "WITHHELD", "Aarav grade must be WITHHELD"
        assert aarav_card["grades_grid"] == {}, "Aarav sensitive marks memo must be empty dict"
        print(f"✅ Held student grades successfully withheld and redacted over API.")

        query_cleared = await list_report_cards(student_id=2, term="Term 1 Test", db=db)
        cleared_cards = query_cleared["report_cards"]
        assert len(cleared_cards) > 0
        cleared_card = cleared_cards[0]
        assert cleared_card["is_on_hold"] is False
        assert cleared_card["overall_grade"] == "A1+"
        assert "Mathematics" in cleared_card["grades_grid"]
        print(f"✅ Cleared student grades memo delivered in full with grades grid.")

        # -------------------------------------------------------------
        # TEST 4: In-App Notification Verification
        # -------------------------------------------------------------
        print("\n--- TEST 4: In-App Notification Verification ---")
        # Check that parent and student notifications were generated
        notifs_res = await db.execute(
            select(Notification).where(
                Notification.notification_type.in_(["REPORT_CARD_PUBLISHED", "REPORT_CARD_PUBLISHED_PARENT"])
            ).order_by(Notification.id.desc()).limit(10)
        )
        notifs = notifs_res.scalars().all()
        assert len(notifs) > 0, "Report card notifications should exist"
        
        # Verify title contains 'exam' or 'marks' for parent filter routing
        parent_notif = next((n for n in notifs if n.recipient_role == "parent"), None)
        assert parent_notif is not None, "Parent notification must be created"
        title_lower = parent_notif.title.lower()
        assert "exam" in title_lower or "marks" in title_lower or "report card" in title_lower
        print(f"✅ Parent notification dispatched: Title='{parent_notif.title}', Priority={parent_notif.priority}")

        student_notif = next((n for n in notifs if n.recipient_role == "student"), None)
        assert student_notif is not None, "Student notification must be created"
        print(f"✅ Student notification dispatched: Title='{student_notif.title}', ActionURL={student_notif.action_url}")

        # -------------------------------------------------------------
        # TEST 5: Dynamic Room Channel Segregation
        # -------------------------------------------------------------
        print("\n--- TEST 5: Surveillance Room Channel Segregation ---")
        room_8b = get_surveillance_room("Class 8", "B")
        room_9a = get_surveillance_room("Class 9", "A")
        room_custom = get_surveillance_room(room_name="exam-hall-auditorium-1")
        room_fallback = get_surveillance_room()

        assert room_8b == "exam-room-class8-b", f"Expected exam-room-class8-b, got {room_8b}"
        assert room_9a == "exam-room-class9-a", f"Expected exam-room-class9-a, got {room_9a}"
        assert room_custom == "exam-hall-auditorium-1", f"Expected exam-hall-auditorium-1, got {room_custom}"
        assert room_fallback == "exam-room-class8b", f"Expected exam-room-class8b, got {room_fallback}"
        print(f"✅ Dynamic room resolution verified: Class 8-B -> '{room_8b}', Class 9-A -> '{room_9a}', Hall -> '{room_custom}'")

        # Clean up test report cards
        await db.execute(delete(ReportCard).where(ReportCard.class_name == "Class 8", ReportCard.section == "B", ReportCard.term == "Term 1 Test"))
        await db.commit()
        print("\n🎉 ALL 5 EXAM COORDINATOR SUITE TESTS PASSED 100%!")
        print("==================================================")
    from app.core.database import engine
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_exam_coordinator_fixes())
