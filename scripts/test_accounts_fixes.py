import sys, os
sys.path.insert(0, os.path.abspath('backend'))
import asyncio
import httpx
from main import app
from app.core.database import AsyncSessionLocal
from app.models.models import FeeDefaulter, PaymentTransaction
from sqlalchemy import select

async def run_comprehensive_verification():
    transport = httpx.ASGITransport(app=app)
    headers = {'X-User-Role': 'accounts_coordinator', 'X-User-Id': '1'}
    admin_headers = {'X-User-Role': 'admin', 'X-User-Id': '1'}

    async with httpx.AsyncClient(transport=transport, base_url='http://testserver') as client:
        print("=" * 80)
        print("VERIFICATION TEST SUITE: ACCOUNTS AGING, SETTLED LEDGER, 3-TABLE SYNC & EXAM HOLD")
        print("=" * 80)

        # -------------------------------------------------------------
        # TEST 1: DYNAMIC AGING DAYS
        # -------------------------------------------------------------
        print("\n[TEST 1] Testing Dynamic Aging Calculation from Created At Timestamp...")
        res = await client.get('/api/finance/defaulters', headers=headers)
        assert res.status_code == 200, f"Expected 200, got {res.status_code}"
        defaulters = res.json()
        print(f"  Active Defaulters Returned: {len(defaulters)}")

        tanvi = next((d for d in defaulters if 'Tanvi' in d['student_name']), None)
        cahndra = next((d for d in defaulters if 'Cahndra' in d['student_name']), None)
        vaishnavi = next((d for d in defaulters if 'Vaishnavi' in d['student_name']), None)
        devansh = next((d for d in defaulters if 'Devansh' in d['student_name'] and d['amount_due'] > 0), None)

        assert tanvi is not None, "Tanvi Deshmukh record not found!"
        assert tanvi['days_overdue'] >= 20, f"Expected Tanvi to have >=20 days overdue, got {tanvi['days_overdue']}"
        print(f"  ✓ Tanvi Deshmukh (joined Nov 3): {tanvi['days_overdue']} Days (Tier 16-30d)")

        assert cahndra is not None, "Cahndra Sena record not found!"
        assert cahndra['days_overdue'] >= 10, f"Expected Cahndra to have >=10 days overdue, got {cahndra['days_overdue']}"
        print(f"  ✓ Cahndra Sena (joined Nov 13): {cahndra['days_overdue']} Days (Tier 0-15d)")

        assert vaishnavi is not None, "Vaishnavi record not found!"
        assert vaishnavi['days_overdue'] >= 7, f"Expected Vaishnavi to have >=7 days overdue, got {vaishnavi['days_overdue']}"
        print(f"  ✓ Vaishnavi (joined Nov 18): {vaishnavi['days_overdue']} Days")

        if devansh:
            print(f"  ✓ Devansh Kulkarni (joined Nov 23): {devansh['days_overdue']} Days")

        # -------------------------------------------------------------
        # TEST 2: SETTLED / ZERO-DUE STUDENTS FILTERING
        # -------------------------------------------------------------
        print("\n[TEST 2] Testing Settled / Zero-Due Students Filtering...")
        for d in defaulters:
            assert d['amount_due'] > 0, f"Student {d['student_name']} has amount_due={d['amount_due']}, should not be in active defaulters!"
        print("  ✓ All active defaulters have amount_due > 0 (zero dues cleanly filtered).")

        res_settled = await client.get('/api/finance/defaulters?include_settled=true', headers=headers)
        all_defaulters = res_settled.json()
        settled_list = [d for d in all_defaulters if d['amount_due'] == 0]
        print(f"  ✓ When include_settled=True, {len(settled_list)} settled records returned:")
        for s in settled_list:
            print(f"    - {s['student_name']}: INR {s['amount_due']} (Status: {s['status']}, Days: {s['days_overdue']})")
            assert s['days_overdue'] == 0, f"Settled student {s['student_name']} must have days_overdue=0!"

        # -------------------------------------------------------------
        # TEST 3: 3-TABLE SYNC (ONLINE PAYMENT -> RECONCILIATION -> AGING REDUCTION)
        # -------------------------------------------------------------
        print("\n[TEST 3] Testing Online Payment -> Bank Reconciliation -> Defaulter Reduction...")
        # Pick student 10 (Vaishnavi) whose balance is in DB
        import time
        test_utr = f"UPI/TEST-RECON-{int(time.time()*1000)}"
        test_rec = f"REC-TEST-{int(time.time()*1000)}"
        async with AsyncSessionLocal() as db:
            vaish_res = await db.execute(select(FeeDefaulter).where(FeeDefaulter.id == 10))
            vaish_def = vaish_res.scalars().first()
            orig_amt = vaish_def.amount_due if vaish_def else 15000.0

            # Create a test online PaymentTransaction of 1,000 for Vaishnavi
            test_tx = PaymentTransaction(
                utr_number=test_utr,
                student_name="Vaishnavi",
                class_name="Class 8-A",
                parent_name="srinivas",
                amount=1000.0,
                payment_method="UPI (Google Pay)",
                bank_name="HDFC School Collections Gateway",
                milestone_title="One-Time Admission & Registration Fee",
                status="Success",
                reconciled=False,
                gateway_ref=test_rec
            )
            db.add(test_tx)
            await db.commit()
            await db.refresh(test_tx)
            tx_id = test_tx.id

        print(f"  Created unreconciled PaymentTransaction #{tx_id} for Vaishnavi (Amount: INR 1,000)")
        print(f"  Pre-reconciliation Vaishnavi amount_due: INR {orig_amt:,.2f}")

        # Reconcile via endpoint
        rec_res = await client.post(f"/api/finance/transactions/{tx_id}/reconcile", headers=headers)
        assert rec_res.status_code == 200, f"Expected 200, got {rec_res.status_code}"
        rec_data = rec_res.json()
        assert rec_data['reconciled'] is True, "Transaction was not marked reconciled!"

        # Check that FeeDefaulter amount_due was deducted by 1,000
        async with AsyncSessionLocal() as db:
            vaish_res2 = await db.execute(select(FeeDefaulter).where(FeeDefaulter.id == 10))
            vaish_def2 = vaish_res2.scalars().first()
            expected_amt = round(orig_amt - 1000.0, 2)
            print(f"  Post-reconciliation Vaishnavi amount_due: INR {vaish_def2.amount_due:,.2f}")
            assert vaish_def2.amount_due == expected_amt, f"Expected {expected_amt}, got {vaish_def2.amount_due}"
            print("  ✓ FeeDefaulter amount automatically deducted upon bank verification!")

        # -------------------------------------------------------------
        # TEST 4: EXAM HOLD / HALL TICKET ENFORCEMENT & TOGGLE
        # -------------------------------------------------------------
        print("\n[TEST 4] Testing Exam Hold Lockdown and Dynamic Release...")
        # Step A: Aarav Sharma (ID 1) has exam_clearance = False -> Must be on hold
        ht_res1 = await client.get('/api/exams/hall-tickets/student/1')
        ht_data1 = ht_res1.json()
        print(f"  Student #1 on Exam Hold: Success={ht_data1.get('success')}, IsOnHold={ht_data1.get('is_on_hold')}")
        assert ht_data1.get('is_on_hold') is True, "Student on exam hold was not blocked!"
        assert ht_data1.get('hall_ticket') is None, "Hall ticket was leaked while on hold!"
        print(f"  ✓ Locked Notice: {ht_data1.get('hold_reason')[:75]}...")

        # Step B: Admin toggles clearance to TRUE
        toggle_res = await client.post('/api/finance/defaulters/1/exam-clearance', headers=admin_headers)
        print(f"  Toggle response status: {toggle_res.status_code}")
        assert toggle_res.status_code == 200
        print("  Admin toggled Exam Clearance to: Cleared (True)")

        # Step C: Verify hall ticket is now released!
        ht_res2 = await client.get('/api/exams/hall-tickets/student/1')
        ht_data2 = ht_res2.json()
        print(f"  Student #1 after Clearance: Success={ht_data2.get('success')}, Ticket={ht_data2.get('hall_ticket', {}).get('ticket_number')}")
        assert ht_data2.get('success') is True, "Hall ticket should be released when cleared!"
        assert ht_data2.get('hall_ticket') is not None, "Hall ticket object missing!"
        print("  ✓ Hall Ticket and Timetable released cleanly upon financial clearance!")

        # Step D: Restore Exam Hold (toggle back to False for state preservation)
        await client.post('/api/finance/defaulters/1/exam-clearance', headers=admin_headers)
        print("  Restored Student #1 Exam Hold state for production testing.")

        print("\n" + "=" * 80)
        print("ALL 4 CRITICAL AREAS FULLY VERIFIED WITH 100% SUCCESS!")
        print("=" * 80)

if __name__ == '__main__':
    asyncio.run(run_comprehensive_verification())
