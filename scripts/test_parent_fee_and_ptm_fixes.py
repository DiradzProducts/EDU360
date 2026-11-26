import sys
import os
import asyncio
import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.core.database import AsyncSessionLocal
from sqlalchemy import select, and_
from app.models.models import FeeDefaulter, PTMSlot, Notification, PaymentTransaction
from app.schemas.schemas import FeePayRequest, PTMSlotBookRequest, PTMSlotCancelRequest
from app.routers.parent import pay_fee_milestone, parent_book_ptm_slot, cancel_parent_ptm_slot

async def run_tests():
    print("=" * 60)
    print("RUNNING E2E TESTS: PARENT FEE PARTIAL PAYMENT & PTM NOTIFICATIONS")
    print("=" * 60)

    async with AsyncSessionLocal() as db:
        # ---------------------------------------------------------
        # TEST 1: FEE DEFAULTER PARTIAL PAYMENT PRESERVATION
        # ---------------------------------------------------------
        print("\n[TEST 1] Testing Fee Defaulter Partial Payment Logic...")
        # Reset student 1 defaulter to known baseline
        st1_res = await db.execute(select(FeeDefaulter).where(FeeDefaulter.student_id == 1))
        defaulter = st1_res.scalars().first()
        if not defaulter:
            defaulter = FeeDefaulter(
                student_id=1,
                student_name="Aarav Sharma",
                class_name="Class 8-B",
                parent_name="Mr. Rajesh Sharma",
                parent_phone="+91 98765 43210",
                parent_email="rajesh.sharma@example.com",
                amount_due=35000.0,
                days_overdue=45,
                status="Overdue"
            )
            db.add(defaulter)
            await db.commit()
            await db.refresh(defaulter)
        else:
            defaulter.amount_due = 35000.0
            defaulter.days_overdue = 45
            defaulter.status = "Overdue"
            await db.commit()

        print(f"  Initial State: Student 1 owes ₹{defaulter.amount_due:,.2f}, Status='{defaulter.status}'")

        # Step 1A: Pay ₹15,000 (Term 1)
        req_15k = FeePayRequest(
            milestone_id=1,
            student_id=1,
            student_name="Aarav Sharma",
            class_name="Class 8-B",
            parent_name="Mr. Rajesh Sharma",
            milestone_title="Term 1 Tuition Fee",
            amount=15000.0,
            payment_method="UPI",
            utr_number="E2E-TEST-UTR-15000"
        )
        res_15k = await pay_fee_milestone(1, req_15k, db=db)
        print("  Paid ₹15,000 Milestone via pay_fee_milestone...")

        # Reload defaulter
        await db.refresh(defaulter)
        print(f"  After ₹15,000 Payment: Student 1 owes ₹{defaulter.amount_due:,.2f}, Status='{defaulter.status}'")
        assert defaulter.amount_due == 20000.0, f"Expected amount_due 20000.0, got {defaulter.amount_due}"
        assert defaulter.status == "Partially Paid", f"Expected status 'Partially Paid', got '{defaulter.status}'"
        print("  ✓ PASS: ₹15,000 partial payment preserved ₹20,000 remaining balance without wiping ledger!")

        # Step 1B: Pay remaining ₹20,000 (Term 2)
        req_20k = FeePayRequest(
            milestone_id=2,
            student_id=1,
            student_name="Aarav Sharma",
            class_name="Class 8-B",
            parent_name="Mr. Rajesh Sharma",
            milestone_title="Term 2 Tuition Fee",
            amount=20000.0,
            payment_method="NetBanking",
            utr_number="E2E-TEST-UTR-20000"
        )
        res_20k = await pay_fee_milestone(2, req_20k, db=db)
        print("  Paid remaining ₹20,000 Milestone...")

        # Reload defaulter
        await db.refresh(defaulter)
        print(f"  After ₹20,000 Payment: Student 1 owes ₹{defaulter.amount_due:,.2f}, Status='{defaulter.status}'")
        assert defaulter.amount_due == 0.0, f"Expected amount_due 0.0, got {defaulter.amount_due}"
        assert defaulter.status == "Paid", f"Expected status 'Paid', got '{defaulter.status}'"
        assert defaulter.days_overdue == 0, f"Expected days_overdue 0, got {defaulter.days_overdue}"
        print("  ✓ PASS: Full payment accurately marks status as 'Paid' and balance as ₹0.00!")

        # ---------------------------------------------------------
        # TEST 2: PTM SLOT BOOKING & TEACHER IN-APP NOTIFICATION
        # ---------------------------------------------------------
        print("\n[TEST 2] Testing PTM Slot Booking & In-App Notification Dispatch to Teacher...")
        slot_id = "slot-05c"
        slot_res = await db.execute(select(PTMSlot).where(PTMSlot.id == slot_id))
        slot = slot_res.scalars().first()
        if not slot:
            print(f"  Slot {slot_id} not found in DB, skipping...")
            return

        # Ensure slot is available
        slot.status = "AVAILABLE"
        slot.booked_student_id = None
        slot.booked_student_name = None
        slot.booked_class = None
        slot.booked_parent_id = None
        slot.booked_parent_name = None
        slot.meeting_url = None
        slot.focus_table_agenda = "[]"
        await db.commit()

        # Parent books the slot
        book_req = PTMSlotBookRequest(
            slot_id=slot_id,
            booked_student_id=1,
            booked_student_name="Aarav Sharma",
            booked_class="Class 8-B",
            booked_parent_id="par-01",
            booked_parent_name="Mr. Rajesh Sharma",
            interaction_scope="HOMEROOM_CLASS",
            subject_name="Mathematics",
            focus_table_agenda=["Midterm Unit Test Review", "Mastery Progress"]
        )
        book_res = await parent_book_ptm_slot(book_req, db=db)
        print(f"  Booked slot {slot_id} for Aarav Sharma...")

        # Verify DB slot state
        await db.refresh(slot)
        assert slot.status == "BOOKED", f"Expected status BOOKED, got {slot.status}"
        assert slot.booked_student_name == "Aarav Sharma", f"Expected booked_student_name 'Aarav Sharma', got {slot.booked_student_name}"
        assert "Midterm Unit Test Review" in slot.focus_table_agenda, "Expected agenda in focus_table_agenda"
        print(f"  ✓ Slot persisted in PostgreSQL: Status='{slot.status}', Student='{slot.booked_student_name}'")

        # Verify teacher notification in DB
        notif_res = await db.execute(
            select(Notification).where(
                and_(
                    Notification.recipient_role == "teacher",
                    Notification.notification_type == "PTM_SLOT_BOOKED"
                )
            ).order_by(Notification.id.desc()).limit(1)
        )
        notif = notif_res.scalars().first()
        assert notif is not None, "Expected PTM_SLOT_BOOKED notification in DB!"
        assert "Aarav Sharma" in notif.title or "Aarav Sharma" in notif.message, f"Expected Aarav in notification: {notif.message}"
        print(f"  ✓ Teacher In-App Notification Verified: Title='{notif.title}', RecipientRole='{notif.recipient_role}', RecipientUID={notif.recipient_user_id}")

        # ---------------------------------------------------------
        # TEST 3: PTM SLOT CANCELLATION & TEACHER IN-APP NOTIFICATION
        # ---------------------------------------------------------
        print("\n[TEST 3] Testing PTM Slot Cancellation & In-App Notification Dispatch to Teacher...")
        cancel_req = PTMSlotCancelRequest(
            cancellation_reason="Parent-Initiated Cancellation from Parent Portal",
            cancelled_by="Mr. Rajesh Sharma",
            reopen_as_free=True
        )
        cancel_res = await cancel_parent_ptm_slot(slot_id, cancel_req, db=db)
        print(f"  Cancelled slot {slot_id}...")

        # Verify DB slot state
        await db.refresh(slot)
        assert slot.status == "AVAILABLE", f"Expected status AVAILABLE, got {slot.status}"
        assert slot.booked_student_name is None, f"Expected booked_student_name None, got {slot.booked_student_name}"
        print(f"  ✓ Slot reopened in PostgreSQL: Status='{slot.status}'")

        # Verify cancellation notification in DB
        notif_cancel_res = await db.execute(
            select(Notification).where(
                and_(
                    Notification.recipient_role == "teacher",
                    Notification.notification_type == "PTM_SLOT_CANCELLED"
                )
            ).order_by(Notification.id.desc()).limit(1)
        )
        notif_cancel = notif_cancel_res.scalars().first()
        assert notif_cancel is not None, "Expected PTM_SLOT_CANCELLED notification in DB!"
        assert "Aarav Sharma" in notif_cancel.title or "Aarav Sharma" in notif_cancel.message, f"Expected Aarav in cancellation notification: {notif_cancel.message}"
        assert "Mr. Rajesh Sharma" in notif_cancel.message, f"Expected parent name in notification: {notif_cancel.message}"
        print(f"  ✓ Teacher Cancellation Notification Verified: Title='{notif_cancel.title}', Message='{notif_cancel.message}'")

    print("\n" + "=" * 60)
    print("ALL E2E TESTS PASSED SUCCESSFULLY! (100% GREEN)")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_tests())
