"""
Automated Test Suite for Student Medical Leave Receipt & Attachment Verification
Tests:
  1. Parent submittal of Medical Leave with receipt attachment (filename + data url / upload url).
  2. Teacher endpoint receipt retrieval and field presence (is_medical, attachment_name, attachment_url).
  3. Static file mount verification for /uploads/.
  4. Teacher review and approval maintaining receipt persistence.
"""
import sys
import os
import asyncio
import httpx

sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import AsyncSessionLocal
from app.models.models import LeaveRequest
from sqlalchemy import select
from main import app

async def run_leave_receipt_tests():
    print("=" * 70)
    print("TESTING LEAVE RECEIPT & MEDICAL ATTACHMENT ACCESS")
    print("=" * 70)

    # 1. Direct DB check on existing row ID 10
    print("\n[Step 1] Verifying existing medical leave (Row #10 from user report)...")
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(LeaveRequest).where(LeaveRequest.id == 10))
        lr_10 = res.scalars().first()
        assert lr_10 is not None, "Leave request #10 must exist in DB"
        assert lr_10.is_medical is True, "Leave #10 must be marked medical"
        assert lr_10.attachment_name == "PMInternships.png", f"Expected PMInternships.png, got {lr_10.attachment_name}"
        assert lr_10.attachment_url == "/uploads/PMInternships.png", f"Expected /uploads/PMInternships.png, got {lr_10.attachment_url}"
        print(f"  ✓ Row #10 verified: Student '{lr_10.student_name}', Attachment: '{lr_10.attachment_name}', Status: '{lr_10.status}'")

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        teacher_headers = {"X-User-Role": "teacher", "X-User-Id": "2"}
        parent_headers = {"X-User-Role": "parent", "X-User-Id": "3"}

        # 2. Testing Teacher API payload
        print("\n[Step 2] Testing Teacher /api/teacher/leave-requests endpoint payload...")
        response = await client.get("/api/teacher/leave-requests", headers=teacher_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        leaves = response.json()
        assert isinstance(leaves, list), "Expected list of leave requests"
        
        target_leave = next((l for l in leaves if l["id"] == 10), None)
        assert target_leave is not None, "Leave request #10 must be in teacher response"
        assert target_leave.get("is_medical") is True
        assert target_leave.get("attachment_name") == "PMInternships.png"
        assert target_leave.get("attachment_url") == "/uploads/PMInternships.png"
        print(f"  ✓ Teacher API delivers receipt payload: {target_leave['attachment_name']} ({target_leave['attachment_url']})")

        # 3. Test Parent Submitting a new Medical Leave with Base64 Data URL Receipt
        print("\n[Step 3] Submitting fresh Parent Medical Leave with Base64 Receipt...")
        payload = {
            "student_id": 1,
            "student_name": "Aarav Sharma",
            "parent_name": "Mr. Rajesh Sharma",
            "from_date": "2026-12-01",
            "to_date": "2026-12-02",
            "reason": "Severe allergic rhinitis; doctor requested 2 days complete rest",
            "is_medical": True,
            "attachment_name": "apollo_clinic_rx_aarav.pdf",
            "attachment_url": "data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCgoxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+CmVuZG9iago="
        }
        create_res = await client.post("/api/parent/leave-requests", json=payload, headers=parent_headers)
        assert create_res.status_code == 200, f"Expected 200, got {create_res.status_code}: {create_res.text}"
        new_data = create_res.json()
        assert new_data["is_medical"] is True
        assert new_data["attachment_name"] == "apollo_clinic_rx_aarav.pdf"
        assert new_data["attachment_url"].startswith("data:application/pdf")
        print(f"  ✓ Fresh medical leave #{new_data['id']} created with embedded base64 receipt.")

        # 4. Teacher reviews fresh medical leave
        print("\n[Step 4] Teacher reviews and approves medical leave...")
        review_res = await client.post(f"/api/teacher/leave-requests/{new_data['id']}/review", json={
            "status": "Approved",
            "teacher_notes": "Prescription verified with Apollo Clinic registration."
        }, headers=teacher_headers)
        assert review_res.status_code == 200, f"Expected 200, got {review_res.status_code}"
        reviewed = review_res.json()
        assert reviewed["status"] == "Approved"
        assert reviewed["attachment_name"] == "apollo_clinic_rx_aarav.pdf"
        assert reviewed["attachment_url"].startswith("data:application/pdf")
        print(f"  ✓ Approved leave retains full receipt data.")

        # 5. Check Static /uploads/ mount
        print("\n[Step 5] Testing static /uploads mount endpoint...")
        uploads_dir = os.path.join(os.path.abspath("backend"), "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        sample_file = os.path.join(uploads_dir, "test_receipt.txt")
        with open(sample_file, "w") as f:
            f.write("OFFICIAL MEDICAL CLINIC RECEIPT VERIFIED")

        static_res = await client.get("/uploads/test_receipt.txt")
        assert static_res.status_code == 200, f"Expected 200 from static mount, got {static_res.status_code}"
        assert "OFFICIAL MEDICAL CLINIC RECEIPT" in static_res.text
        print(f"  ✓ Static /uploads/ mount verified and serving uploaded assets.")

    print("\n" + "=" * 70)
    print("ALL LEAVE RECEIPT & ATTACHMENT TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_leave_receipt_tests())
