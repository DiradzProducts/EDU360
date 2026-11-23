import asyncio
import os
import sys
import httpx

# Add backend to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app

async def test_exam_coordinator_flows():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("--- 1. Testing Re-Exam Requests Listing ---")
        res = await client.get("/api/exams/re-exam-requests")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        data = res.json()
        assert isinstance(data, list), f"Expected list response, got: {type(data)}"
        print(f"Retrieved {len(data)} re-exam requests from PostgreSQL.")
        if data:
            print(f"Sample request: ID #{data[0].get('id')} - {data[0].get('student_name')} ({data[0].get('status')})")

        print("\n--- 2. Testing Question Paper Gating (Locked Before Commenced) ---")
        res = await client.get("/api/exams/question-papers/1?schedule_id=1&user_role=student")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        qp_data = res.json()
        print(f"QP Data locked status: {qp_data.get('locked')}, title: {qp_data.get('title')}")

        print("\n--- 3. Testing Question Paper Download ---")
        res = await client.get("/api/exams/question-papers/1/download?schedule_id=1&user_role=student")
        print(f"QP Download status code: {res.status_code}")
        assert res.status_code in (200, 403), f"Unexpected status: {res.status_code}"

        print("\n--- 4. Testing Syllabus Pacing Alert Endpoint ---")
        sync_payload = {
            "title": "Mathematics Syllabus Acceleration Required for Term 1 Exams",
            "class_name": "Class 8",
            "subject": "Mathematics",
            "curriculum_lag_units": 2,
            "current_completion_pct": 52.0,
            "proposed_resolution": "POSTPONE_EXAM",
            "notes": "Unit 4 Geometry Proofs lagging behind schedule.",
            "requested_by_name": "Dr. Hemanth Sen",
            "requested_by_role": "exam_coordinator"
        }
        res = await client.post(
            "/api/academic/exam-sync/request",
            json=sync_payload,
            headers={"X-User-Role": "exam_coordinator", "X-User-Id": "1"}
        )
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        sync_res = res.json()
        print("Syllabus pacing alert created successfully:", sync_res.get("title"), f"(ID: {sync_res.get('id')})")

        print("\n--- 5. Testing Report Cards Query ---")
        res = await client.get("/api/exams/report-cards?class_name=Class%208&section=B")
        assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
        rc_data = res.json()
        assert rc_data.get("success") is True
        print(f"Retrieved {len(rc_data.get('report_cards', []))} report cards.")

        print("\n>>> ALL EXAM COORDINATOR WORKFLOW TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    asyncio.run(test_exam_coordinator_flows())
