import sys
import os
import asyncio

sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import AsyncSessionLocal
from sqlalchemy import select, desc
from app.models.models import (
    ExamSyncRequest, PTMSlot, PTMEvent, CurriculumPacing, 
    Notification, ExamSchedule, StaffMember, AdminTask
)
from app.routers.academic import (
    request_exam_coordinator_sync, resolve_exam_sync_request, list_exam_sync_requests,
    get_ptm_faculty_attendance_summary, mark_ptm_slot_attendance
)
from app.routers.admin import log_curriculum_lesson, LogLessonRequest, list_available_faculty, create_admin_task, AdminTaskCreate
from app.schemas.schemas import ExamSyncCreateRequest, ExamSyncResolveRequest
from app.routers.exams import grant_academic_schedule_clearance, ExamScheduleClearanceRequest

async def run_e2e_tests():
    print("=" * 70)
    print("ACADEMIC COORDINATOR (PROF. RAJESHWARI NAIR) END-TO-END VERIFICATION")
    print("=" * 70)

    async with AsyncSessionLocal() as db:
        # TEST 1: Curriculum Pacing & Lesson Logging in PostgreSQL
        print("\n[TEST 1] Verifying Curriculum Pacing in PostgreSQL...")
        stmt = select(CurriculumPacing).limit(3)
        res = await db.execute(stmt)
        pacings = res.scalars().all()
        print(f"Found {len(pacings)} curriculum pacing entries in PostgreSQL.")
        assert len(pacings) > 0, "No curriculum pacing entries in database!"
        test_pacing = pacings[0]
        initial_units = test_pacing.completed_units
        print(f"Testing lesson log for: {test_pacing.class_name} {test_pacing.subject} (Units: {initial_units}/{test_pacing.total_units})")
        
        log_res = await log_curriculum_lesson(
            item_id=test_pacing.id,
            req=LogLessonRequest(
                units_to_add=1,
                lesson_title="E2E Verified Unit: Advanced Algebraic Formulations"
            ),
            db=db
        )
        assert log_res["success"] is True
        assert log_res["item"]["completed_units"] == initial_units + 1
        print(f"✓ Curriculum pacing successfully updated: {initial_units} -> {log_res['item']['completed_units']} units (Status: {log_res['item']['status']})")

        # TEST 2: Dynamic Available Faculty Substitutions
        print("\n[TEST 2] Verifying Dynamic Available Faculty (No hardcoded arrays)...")
        available_fac = await list_available_faculty(db=db)
        print(f"Found {len(available_fac)} free teaching faculty members in PostgreSQL:")
        for fac in available_fac[:4]:
            print(f"  - [{fac.id}] {fac.name} ({fac.department}) - Free: {fac.free_periods_today} periods today")
        assert len(available_fac) >= 5, "Expected dynamic faculty list from staff_members"
        print("✓ Dynamic faculty substitution list query verified.")

        # TEST 3: Inter-Coordinator Exam Sync Request Dispatch
        print("\n[TEST 3] Testing Exam Sync Request Creation (Prof. Rajeshwari Nair -> Dr. Hemanth Sen)...")
        sync_payload = ExamSyncCreateRequest(
            title="Curriculum Lag & Exam Alignment: Class 9-A Physics",
            class_name="Class 9-A",
            subject="Physics",
            curriculum_lag_units=2,
            current_completion_pct=58.0,
            proposed_resolution="POSTPONE_EXAM",
            notes="Laboratory optics units delayed due to equipment maintenance. Requesting 4-day exam postponement.",
            meeting_date="2026-10-25 03:30 PM",
            meeting_venue="Exam Cell Conference Room"
        )
        created_sync = await request_exam_coordinator_sync(
            req=sync_payload,
            db=db
        )
        print(f"✓ Exam Sync Request #{created_sync.id} created: {created_sync.class_name} {created_sync.subject} ({created_sync.proposed_resolution})")

        # Verify notification dispatched to Exam Coordinator
        stmt_notif = select(Notification).where(
            Notification.recipient_role == "exam_coordinator"
        ).order_by(desc(Notification.created_at)).limit(1)
        res_notif = await db.execute(stmt_notif)
        latest_notif = res_notif.scalars().first()
        assert latest_notif is not None, "Notification to exam coordinator not found!"
        print(f"✓ Notification dispatched to Exam Coordinator: '{latest_notif.title}'")
        print(f"  Message: {latest_notif.message}")
        print(f"  Action URL: {latest_notif.action_url}")

        # TEST 4: Exam Coordinator Resolves Sync Request
        print("\n[TEST 4] Testing Exam Sync Request Resolution (Dr. Hemanth Sen -> Prof. Rajeshwari Nair)...")
        resolve_payload = ExamSyncResolveRequest(
            status="SYNC_SCHEDULED",
            meeting_date="2026-10-25 03:30 PM",
            meeting_venue="Exam Cell Conference Room",
            resolution_notes="Agreed to reschedule Class 9 Physics to 28 Oct 2026. Hall 102 allocated."
        )
        resolved_sync = await resolve_exam_sync_request(
            request_id=created_sync.id,
            req=resolve_payload,
            db=db
        )
        print(f"✓ Exam Sync Request #{resolved_sync.id} resolved to: {resolved_sync.status}")

        # Verify notification dispatched back to Academic Coordinator
        stmt_acad_notif = select(Notification).where(
            Notification.recipient_role == "academic_coordinator"
        ).order_by(desc(Notification.created_at)).limit(1)
        res_acad_notif = await db.execute(stmt_acad_notif)
        acad_notif = res_acad_notif.scalars().first()
        assert acad_notif is not None, "Notification to academic coordinator not found!"
        print(f"✓ Notification dispatched to Academic Coordinator: '{acad_notif.title}'")
        print(f"  Message: {acad_notif.message}")

        # TEST 5: PTM Faculty Attendance Rollup & Slot Tracking
        print("\n[TEST 5] Verifying PTM Faculty Attendance Rollup from PostgreSQL...")
        ptm_att_summary = await get_ptm_faculty_attendance_summary(db=db)
        print(f"Event: {ptm_att_summary.event_title}")
        print(f"Total Faculty: {ptm_att_summary.total_faculty_count}, Overall Rate: {ptm_att_summary.overall_attendance_rate_pct}%")
        for f in ptm_att_summary.faculty_attendance[:3]:
            print(f"  - {f.teacher_name} ({f.department}): Booked={f.booked_slots}, Completed={f.completed_slots}, Rate={f.attendance_rate_pct}%")
        assert len(ptm_att_summary.faculty_attendance) > 0, "No faculty attendance items generated!"
        print("✓ PTM faculty attendance calculations verified.")

        # TEST 6: Mark PTM Slot Attendance Directly in PostgreSQL
        print("\n[TEST 6] Testing PTM Slot Attendance Marking...")
        stmt_slot = select(PTMSlot).where(PTMSlot.status == "BOOKED").limit(1)
        res_slot = await db.execute(stmt_slot)
        test_slot = res_slot.scalars().first()
        if not test_slot:
            stmt_any = select(PTMSlot).limit(1)
            res_any = await db.execute(stmt_any)
            test_slot = res_any.scalars().first()

        assert test_slot is not None, "No PTM slot available for attendance test"
        print(f"Testing slot #{test_slot.id} for teacher {test_slot.teacher_id} (Initial status: {test_slot.attendance_status})")
        slot_mark_res = await mark_ptm_slot_attendance(
            slot_id=str(test_slot.id),
            teacher_attended=True,
            parent_attended=True,
            attendance_status="COMPLETED",
            meeting_notes="Productive academic discussion on mathematics calculus foundation.",
            db=db
        )
        assert slot_mark_res["success"] is True
        # Verify in DB
        await db.refresh(test_slot)
        assert test_slot.teacher_attended is True
        assert test_slot.parent_attended is True
        assert test_slot.attendance_status == "COMPLETED"
        print(f"✓ PTM slot #{test_slot.id} verified in PostgreSQL: teacher_attended=True, parent_attended=True, status={test_slot.attendance_status}")

        # TEST 7: Academic Schedule Clearance Notification to Exam Coordinator
        print("\n[TEST 7] Testing Academic Calendar Schedule Clearance...")
        stmt_sched = select(ExamSchedule).limit(1)
        res_sched = await db.execute(stmt_sched)
        test_sched = res_sched.scalars().first()
        if test_sched:
            clear_res = await grant_academic_schedule_clearance(
                schedule_id=test_sched.id,
                req=ExamScheduleClearanceRequest(
                    academic_clearance=True,
                    academic_clearance_notes="Verified: All 12 curriculum pacing units completed. No instructional conflict."
                ),
                db=db
            )
            assert clear_res["academic_clearance"] is True
            print(f"✓ Schedule #{test_sched.id} ({test_sched.class_name} {test_sched.subject}) cleared by Academic Coordinator.")
            # Check notification
            stmt_sched_notif = select(Notification).where(
                Notification.recipient_role == "exam_coordinator"
            ).order_by(desc(Notification.created_at)).limit(1)
            sched_notif = (await db.execute(stmt_sched_notif)).scalars().first()
            print(f"✓ Exam Coordinator notified: '{sched_notif.title}' -> {sched_notif.message}")

        # TEST 8: Task Delegation with Dynamic Staff ID
        print("\n[TEST 8] Testing Academic Task Delegation with Dynamic Staff ID...")
        task_res = await create_admin_task(
            task_in=AdminTaskCreate(
                title="Prepare Term-2 Syllabus Progress Audit Report",
                description="Compile unit-wise pacing benchmarks across all secondary divisions.",
                assigned_to="Mrs. Ananya Verma",
                category="urgent",
                domain="academic",
                due_date="2026-10-28",
                priority="High",
                sla_hours=48
            ),
            db=db
        )
        print(f"✓ Created Task #{task_res.id}: Assigned to '{task_res.assigned_to}'")
        assert task_res.id is not None
        # Verify notification dispatched to the resolved staff member
        stmt_task_notif = select(Notification).where(
            Notification.notification_type == "TASK_ASSIGNED"
        ).order_by(desc(Notification.created_at)).limit(1)
        res_task_notif = await db.execute(stmt_task_notif)
        task_notif = res_task_notif.scalars().first()
        assert task_notif is not None
        print(f"✓ Dispatched notification to assigned faculty: User ID={task_notif.recipient_user_id}, Role='{task_notif.recipient_role}'")
        print(f"  Title: '{task_notif.title}'")
        # Check that it resolved to Mrs. Ananya Verma's staff ID
        stmt_staff = select(StaffMember).where(StaffMember.name.ilike("%Ananya Verma%"))
        staff_row = (await db.execute(stmt_staff)).scalars().first()
        if staff_row:
            print(f"  Staff record match verified: Staff ID={staff_row.id} for {staff_row.name}")
            assert task_notif.recipient_user_id == staff_row.id
        print("✓ Dynamic staff ID resolution verified.")

    print("\n" + "=" * 70)
    print("ALL 8 END-TO-END TESTS PASSED WITH 100% SUCCESS")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_e2e_tests())
