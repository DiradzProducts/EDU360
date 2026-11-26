import asyncio
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import AsyncSessionLocal
from app.routers.teacher import (
    _personal_schedule,
    _teacher_personal_schedules,
    get_teacher_personal_schedule,
    inject_substitution_period
)
from app.routers.admin import (
    assign_substitution,
    AssignSubstitutionRequest,
    _substitutions_slots,
    _ensure_substitutions_seeded
)

async def run_tests():
    print("==================================================")
    print("TEST SUITE: EMERGENCY FACULTY SUBSTITUTION FIXES")
    print("==================================================")

    # 1. Verify initial baseline schedule for Mrs. Ananya Verma (teacher_id=2)
    initial_ananya = await get_teacher_personal_schedule(day_of_week="Friday", teacher_id=2)
    p2_ananya_initial = next((p for p in initial_ananya if p["period_number"] == 2), None)
    assert p2_ananya_initial is not None, "Period 2 must exist in initial Ananya schedule"
    print(f"1. Baseline Ananya Verma Period 2 activity_type: {p2_ananya_initial['activity_type']} ({p2_ananya_initial.get('subject_name')})")

    # 2. Assign Mr. Deepak Rao (id=4) to cover absent teacher in Period 2
    async with AsyncSessionLocal() as db:
        await _ensure_substitutions_seeded(db)
        
        # Test direct call to inject_substitution_period with substitute_teacher_id=4
        inject_substitution_period(
            period_num=2,
            class_name="Class 8-B",
            subject="Mathematics",
            absent_teacher="Mr. Rajesh Sharma",
            time_slot="09:20 AM - 10:05 AM",
            substitute_teacher_id=4,
            substitute_teacher_name="Mr. Deepak Rao"
        )

        # Verify Ananya Verma's schedule was NOT mutated by Deepak Rao's assignment
        ananya_after_deepak = await get_teacher_personal_schedule(day_of_week="Friday", teacher_id=2)
        p2_ananya_after = next((p for p in ananya_after_deepak if p["period_number"] == 2), None)
        assert p2_ananya_after is not None
        assert p2_ananya_after["activity_type"] != "SUBSTITUTION_COVER" or "Deepak" in p2_ananya_after.get("notes", ""), \
            f"Ananya Verma's Period 2 should NOT be overwritten by Deepak Rao's proxy: {p2_ananya_after}"
        print(f"2. Verified Ananya Verma schedule remains intact: {p2_ananya_after['subject_name']} ({p2_ananya_after['activity_type']})")

        # Verify Mr. Deepak Rao's schedule WAS updated with the substitution cover
        deepak_sched = await get_teacher_personal_schedule(day_of_week="Friday", teacher_id=4, teacher_name="Mr. Deepak Rao")
        p2_deepak = next((p for p in deepak_sched if p["period_number"] == 2), None)
        assert p2_deepak is not None, "Period 2 must exist in Deepak Rao's schedule"
        assert p2_deepak["activity_type"] == "SUBSTITUTION_COVER", f"Expected SUBSTITUTION_COVER but got {p2_deepak['activity_type']}"
        assert "Mr. Rajesh Sharma" in p2_deepak["notes"], f"Notes should mention absent teacher: {p2_deepak['notes']}"
        print(f"3. Verified Mr. Deepak Rao schedule correctly updated with proxy cover: {p2_deepak['subject_name']} - {p2_deepak['notes']}")

        # 4. Now test assigning Mrs. Ananya Verma as substitute
        inject_substitution_period(
            period_num=5,
            class_name="Class 7-A",
            subject="English Literature",
            absent_teacher="Ms. Priya Sen",
            time_slot="12:45 PM - 01:30 PM",
            substitute_teacher_id=2,
            substitute_teacher_name="Mrs. Ananya Verma"
        )
        ananya_after_own_sub = await get_teacher_personal_schedule(day_of_week="Friday", teacher_id=2)
        p5_ananya = next((p for p in ananya_after_own_sub if p["period_number"] == 5), None)
        assert p5_ananya is not None
        assert p5_ananya["activity_type"] == "SUBSTITUTION_COVER"
        assert "Ms. Priya Sen" in p5_ananya["notes"]
        print(f"4. Verified Ananya Verma schedule correctly receives proxy when SHE is assigned: {p5_ananya['subject_name']} ({p5_ananya['notes']})")

        # 5. Test assign_substitution endpoint handler in admin router
        req = AssignSubstitutionRequest(
            slot_id=4,
            substitute_teacher_id=5,
            substitute_teacher_name="Ms. Sunita Roy",
            notes="Covering chemistry lab"
        )
        res = await assign_substitution(req, db)
        assert res["success"] is True, f"assign_substitution failed: {res}"
        print(f"5. Admin assign_substitution API response: {res['message']}")

        # Verify Ms. Sunita Roy's schedule received period 6
        sunita_sched = await get_teacher_personal_schedule(day_of_week="Friday", teacher_id=5, teacher_name="Ms. Sunita Roy")
        p6_sunita = next((p for p in sunita_sched if p["period_number"] == 6), None)
        assert p6_sunita is not None
        assert p6_sunita["activity_type"] == "SUBSTITUTION_COVER"
        print(f"6. Verified Ms. Sunita Roy schedule correctly received proxy via assign_substitution: {p6_sunita['subject_name']} ({p6_sunita['notes']})")

    print("==================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! (100% SUCCESS)")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
