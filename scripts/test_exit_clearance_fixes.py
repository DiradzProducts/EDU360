import asyncio
import os
import sys

sys.path.insert(0, os.path.abspath('backend'))
import httpx
from main import app
from app.core.database import AsyncSessionLocal
from app.models.models import Student, ExitClearance
from sqlalchemy import select

async def test_exit_clearance_fixes():
    print("=" * 70)
    print("TESTING EXIT CLEARANCE COMPLETION & STUDENT WITHDRAWAL STATUS")
    print("=" * 70)

    transport = httpx.ASGITransport(app=app)
    # Reset student 4 and clearances so test is idempotent
    async with AsyncSessionLocal() as db:
        st_res = await db.execute(select(Student).where(Student.id == 4))
        st4 = st_res.scalars().first()
        if st4:
            st4.status = "Active"
        cl_res = await db.execute(select(ExitClearance).where(ExitClearance.student_id == 4))
        for cl in cl_res.scalars().all():
            await db.delete(cl)
        await db.commit()

    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        admin_headers = {"X-User-Role": "admin", "X-User-Id": "1"}
        parent_headers = {"X-User-Role": "parent", "X-User-Id": "3"}
        teacher_headers = {"X-User-Role": "teacher", "X-User-Id": "2"}

        # 1. Initiate exit clearance for a student (e.g. Student 4)
        print("\n[Step 1] Initiating Exit Clearance for Student #4...")
        init_res = await client.post(
            "/api/admin/exit-clearances/initiate",
            json={"student_id": 4},
            headers=admin_headers
        )
        assert init_res.status_code == 200, f"Initiate failed: {init_res.text}"
        clearance_id = init_res.json()["clearance"]["id"]
        print(f"  ✓ Exit clearance #{clearance_id} initiated.")

        # 2. Parent digitally signs
        print("\n[Step 2] Parent digitally signs TC clearance...")
        sign_res = await client.post(
            f"/api/parent/exit-clearance/4/digital-sign",
            json={"parent_confirmation": True},
            headers=parent_headers
        )
        assert sign_res.status_code == 200, f"Digital sign failed: {sign_res.text}"
        sign_data = sign_res.json()["clearance"]
        print(f"  ✓ Parent digital sign stamped. Status: {sign_data['status']}")
        assert sign_data["digital_parent_approved"] is True

        # Check student status prior to physical verify (should still be Active)
        st_prior = await client.get("/api/admin/students", headers=admin_headers)
        st_4_prior = next((s for s in st_prior.json() if s["id"] == 4), None)
        assert st_4_prior is not None
        assert st_4_prior["status"] in ("Active", "Exit / TC Processing"), f"Expected Active or Processing before dual verify, got {st_4_prior['status']}"
        print(f"  ✓ Pre-verification: Student #4 status is '{st_4_prior['status']}'")

        # 3. Admin verifies physical scan (completing dual custody)
        print("\n[Step 3] Admin verifies physical register scan...")
        verify_res = await client.post(
            f"/api/admin/exit-clearances/{clearance_id}/verify-physical",
            json={"physical_scan_url": "/assets/scans/tc_4_signed.pdf"},
            headers=admin_headers
        )
        assert verify_res.status_code == 200, f"Physical verify failed: {verify_res.text}"
        verify_data = verify_res.json()["clearance"]
        print(f"  ✓ Physical scan verified. Status: {verify_data['status']}")
        assert verify_data["status"] == "Completed & Permanently Archived"

        # 4. Verify Student Status is now 'Withdrawn' (Bug 1 Fix)
        print("\n[Step 4] Checking Student record status in database...")
        st_after = await client.get("/api/admin/students", headers=admin_headers)
        st_4_after = next((s for s in st_after.json() if s["id"] == 4), None)
        assert st_4_after is not None
        print(f"  ✓ Post-dual-verification: Student #4 status in DB is '{st_4_after['status']}'")
        assert st_4_after["status"] == "Withdrawn", f"Expected 'Withdrawn', got '{st_4_after['status']}'"

        # 5. Verify Teacher Roster filters out Withdrawn Student from active attendance roster
        print("\n[Step 5] Checking Teacher Classroom Roster...")
        teacher_roster_res = await client.get("/api/teacher/students", headers=teacher_headers)
        assert teacher_roster_res.status_code == 200
        active_roster = teacher_roster_res.json()
        st_4_in_active = next((s for s in active_roster if s["id"] == 4), None)
        assert st_4_in_active is None, "Withdrawn student #4 should NOT appear in active teacher roster!"
        print("  ✓ Withdrawn student #4 is properly excluded from active daily attendance roster.")

        # If include_withdrawn=True is requested, student appears with status Withdrawn
        all_roster_res = await client.get("/api/teacher/students?include_withdrawn=true", headers=teacher_headers)
        assert all_roster_res.status_code == 200
        all_roster = all_roster_res.json()
        st_4_in_all = next((s for s in all_roster if s["id"] == 4), None)
        assert st_4_in_all is not None
        assert st_4_in_all["status"] == "Withdrawn"
        print(f"  ✓ Withdrawn student #4 tagged with status='{st_4_in_all['status']}' when archive query requested.")

    print("\n" + "=" * 70)
    print("ALL EXIT CLEARANCE TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_exit_clearance_fixes())
