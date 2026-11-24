import asyncio
import os
import sys
import httpx

# Add backend to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import app

async def test_enrolment_lifecycle():
    transport = httpx.ASGITransport(app=app)
    admin_headers = {"X-User-Role": "admissions_coordinator", "X-User-Id": "1"}
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("=== 1. Create a Test Admission Enquiry ===")
        create_payload = {
            "student_name": "Devansh Kulkarni",
            "parent_name": "Mr. Suresh Kulkarni",
            "email": "suresh.kulkarni@example.com",
            "phone": "+91 98888 77771",
            "target_grade": "Class 8",
            "lead_temperature": "hot",
            "source": "Campus Walk-in",
            "notes": "Admissions candidate seeking entry into Class 8."
        }
        res = await client.post("/api/admin/crm/enquiries", json=create_payload, headers=admin_headers)
        assert res.status_code == 200, f"Create enquiry failed: {res.text}"
        enquiry = res.json()
        enq_id = enquiry["id"]
        print(f"Created Enquiry #{enq_id} for {enquiry['student_name']}")

        print("\n=== 2. Convert Enquiry to Enrolled SIS Student (Fee: Pending) ===")
        convert_payload = {
            "section": "B",
            "admission_fee": 25000.0,
            "fee_status": "Pending",
            "payment_method": "UPI Transfer"
        }
        res = await client.post(f"/api/admin/crm/enquiries/{enq_id}/convert", json=convert_payload, headers=admin_headers)
        assert res.status_code == 200, f"Convert enquiry failed: {res.text}"
        conv_res = res.json()
        assert conv_res.get("success") is True
        student_data = conv_res["student"]
        student_id = student_data["id"]
        parent_uname = conv_res["credentials"]["parent_username"]
        student_uname = conv_res["credentials"]["student_username"]
        print(f"Enrolled Student #{student_id}: {student_data['name']} (Class {student_data['class_name']}-{student_data['section']})")
        print(f"Credentials -> Student: {student_uname}, Parent: {parent_uname}")

        parent_headers = {
            "X-User-Role": "parent",
            "X-User-Id": str(conv_res["credentials"].get("parent_user_id", "3"))
        }

        print("\n=== 3. Verify Relational Parent Query (/api/parent/children) ===")
        res = await client.get(f"/api/parent/children?username={parent_uname}", headers=parent_headers)
        assert res.status_code == 200, f"Get children failed: {res.text}"
        children = res.json()
        assert len(children) >= 1, f"Expected at least 1 child for {parent_uname}, got: {children}"
        child = children[0]
        assert child["name"] == "Devansh Kulkarni", f"Child name mismatch: {child['name']}"
        assert "Class 8-B" in child["className"], f"Class name mismatch: {child['className']}"
        print(f"Parent successfully retrieved child: {child['name']} ({child['className']}) via relational link.")

        print("\n=== 4. Verify Class Fee Milestones (/api/parent/fees/{student_id}) ===")
        res = await client.get(f"/api/parent/fees/{student_id}", headers=parent_headers)
        assert res.status_code == 200, f"Get fees failed: {res.text}"
        fees = res.json()
        assert len(fees) >= 5, f"Expected 5 milestones from FeeStructure, got: {len(fees)}"
        print(f"Student #{student_id} fee milestones generated: {len(fees)} installments.")
        for f in fees[:3]:
            print(f"  - {f['title']}: ₹{f['amount']:,.0f} (Status: {f['status']})")

        print("\n=== 5. Verify Admission Fee Aging in Finance Defaulters ===")
        res = await client.get("/api/finance/defaulters?is_admission_fee=true", headers={"X-User-Role": "accounts_coordinator", "X-User-Id": "1"})
        assert res.status_code == 200, f"Get defaulters failed: {res.text}"
        defaulters = res.json()
        devansh_defaulter = next((d for d in defaulters if d["student_id"] == student_id), None)
        assert devansh_defaulter is not None, f"Devansh not found in fee defaulters: {defaulters}"
        assert devansh_defaulter["amount_due"] == 25000.0
        assert devansh_defaulter["days_overdue"] == 0
        assert devansh_defaulter["status"] == "Overdue"
        print(f"Admission fee defaulter verified in Accounts desk: ₹{devansh_defaulter['amount_due']:,.0f} (Days overdue: {devansh_defaulter['days_overdue']})")

        print("\n=== 6. Verify Digital Hall Ticket & Timetable Access ===")
        res = await client.get(f"/api/exams/hall-tickets/student/{student_id}")
        assert res.status_code == 200, f"Get hall ticket failed: {res.text}"
        ht_res = res.json()
        assert ht_res.get("success") is True
        print(f"Hall ticket issued: {ht_res['hall_ticket']['ticket_number']} for {ht_res['hall_ticket']['series_name']}")
        print(f"Scheduled exams on admit card: {len(ht_res.get('exam_timetable', []))} slots.")

        print("\n=== 7. Verify Teacher Roster Inclusion ===")
        res = await client.get("/api/teacher/students", headers={"X-User-Role": "teacher", "X-User-Id": "1"})
        assert res.status_code == 200, f"Get teacher students failed: {res.text}"
        roster = res.json()
        devansh_in_roster = next((s for s in roster if s["name"] == "Devansh Kulkarni"), None)
        assert devansh_in_roster is not None, f"Devansh not found in teacher roster"
        print(f"Student verified in Teacher Roster: {devansh_in_roster['name']} ({devansh_in_roster['class_name']})")

        print("\n=== 8. Verify Class Fee Structures Endpoint (/api/finance/fee-structures) ===")
        res = await client.get("/api/finance/fee-structures", headers={"X-User-Role": "accounts_coordinator", "X-User-Id": "1"})
        assert res.status_code == 200, f"Get fee structures failed: {res.text}"
        structures = res.json()
        assert len(structures) >= 4, f"Expected fee structures, got: {len(structures)}"
        print(f"Accounts Coordinator retrieved {len(structures)} class fee structure blueprints.")

        print("\n=== 9. Verify Paid Admission Fee Enrolment Branch ===")
        create_payload_paid = {
            "student_name": "Riya Deshmukh",
            "parent_name": "Dr. Amit Deshmukh",
            "email": "amit.deshmukh@example.com",
            "phone": "+91 97777 66661",
            "target_grade": "Class 8",
            "lead_temperature": "hot",
            "source": "Alumni Referral",
            "notes": "Paid admission fees on spot."
        }
        res = await client.post("/api/admin/crm/enquiries", json=create_payload_paid, headers=admin_headers)
        assert res.status_code == 200
        enq_paid_id = res.json()["id"]

        convert_payload_paid = {
            "section": "B",
            "admission_fee": 30000.0,
            "fee_status": "Paid",
            "payment_method": "Net Banking"
        }
        res = await client.post(f"/api/admin/crm/enquiries/{enq_paid_id}/convert", json=convert_payload_paid, headers=admin_headers)
        assert res.status_code == 200
        riya_student_id = res.json()["student"]["id"]

        # Check transactions
        res = await client.get("/api/finance/transactions", headers={"X-User-Role": "accounts_coordinator", "X-User-Id": "1"})
        assert res.status_code == 200
        txs = res.json()
        riya_tx = next((t for t in txs if t["student_name"] == "Riya Deshmukh"), None)
        assert riya_tx is not None, f"PaymentTransaction not found for Riya"
        assert riya_tx["amount"] == 30000.0
        assert riya_tx["status"] == "Success"
        print(f"Verified immediate Paid transaction for Riya: ₹{riya_tx['amount']:,.0f} ({riya_tx['status']})")

        # Verify Riya is NOT in defaulters
        res = await client.get("/api/finance/defaulters?is_admission_fee=true", headers={"X-User-Role": "accounts_coordinator", "X-User-Id": "1"})
        assert res.status_code == 200
        riya_defaulter = next((d for d in res.json() if d["student_id"] == riya_student_id), None)
        assert riya_defaulter is None, f"Riya should not be in fee defaulters!"
        print("Verified Riya is cleanly omitted from fee defaulters aging table.")

        print("\n>>> ALL 9 ENROLMENT, AGING, TRANSACTION, EXAM, AND RELATIONAL CHECKS PASSED PERFECTLY! <<<")

if __name__ == "__main__":
    asyncio.run(test_enrolment_lifecycle())
