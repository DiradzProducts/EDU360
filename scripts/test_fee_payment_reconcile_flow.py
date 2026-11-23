import asyncio
import os
import sys
import datetime
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from main import app
from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.models import PaymentTransaction, Notification, SecurityAuditLog

async def run_full_test():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("\n--- STEP 1: Simulate Parent Paying Fee for Student 12 (John Fernandes) ---")
        pay_payload = {
            "payment_method": "UPI (Google Pay)",
            "amount": 22000.0,
            "title": "Milestone 2: Term 2 Tuition & Science Lab",
            "student_id": 12,
            "student_name": "John Fernandes",
            "class_name": "Class 10-A",
            "parent_name": "Mrs. Maria Fernandes"
        }
        resp = await client.post(
            "/api/parent/fees/202/pay",
            json=pay_payload,
            headers={"X-User-Role": "parent", "X-User-Id": "1"}
        )
        print(f"Pay response status: {resp.status_code}")
        data = resp.json()
        print(f"Receipt generated: {data.get('receipt_no')}, Paid at: {data.get('paid_at')}, Status: {data.get('status')}")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"

        print("\n--- STEP 2: Verify PaymentTransaction in DB ---")
        async with async_session() as db:
            res = await db.execute(
                select(PaymentTransaction)
                .where(PaymentTransaction.student_name == "John Fernandes")
                .order_by(PaymentTransaction.id.desc())
            )
            tx = res.scalars().first()
            assert tx is not None, "PaymentTransaction not found for John Fernandes"
            print(f"Found Transaction #{tx.id}:")
            print(f"  - Student: {tx.student_name} (Class: {tx.class_name})")
            print(f"  - Parent: {tx.parent_name}")
            print(f"  - Amount: ₹{tx.amount}")
            print(f"  - Milestone: {tx.milestone_title}")
            print(f"  - UTR: {tx.utr_number}")
            print(f"  - Reconciled: {tx.reconciled}")
            print(f"  - Transaction Date: {tx.transaction_date}")

            assert tx.student_name == "John Fernandes"
            assert tx.parent_name == "Mrs. Maria Fernandes"
            assert float(tx.amount) == 22000.0
            assert tx.reconciled is False

            tx_id = tx.id

        print("\n--- STEP 3: Verify Notifications for Accounts Coordinator and Admin ---")
        async with async_session() as db:
            res_ac = await db.execute(
                select(Notification)
                .where(
                    Notification.recipient_role == "accounts_coordinator",
                    Notification.notification_type == "ONLINE_PAYMENT"
                )
                .order_by(Notification.id.desc())
            )
            ac_notif = res_ac.scalars().first()
            assert ac_notif is not None, "Notification for accounts_coordinator missing!"
            print(f"Accounts Coordinator Notification:")
            print(f"  - Title: {ac_notif.title}")
            print(f"  - Message: {ac_notif.message}")
            print(f"  - Action URL: {ac_notif.action_url}")
            assert "Mrs. Maria Fernandes" in ac_notif.message
            assert "John Fernandes" in ac_notif.message
            assert "22,000" in ac_notif.message

            res_admin = await db.execute(
                select(Notification)
                .where(
                    Notification.recipient_role == "admin",
                    Notification.notification_type == "ONLINE_PAYMENT"
                )
                .order_by(Notification.id.desc())
            )
            admin_notif = res_admin.scalars().first()
            assert admin_notif is not None, "Notification for admin missing!"
            print(f"Admin Notification:")
            print(f"  - Title: {admin_notif.title}")
            print(f"  - Message: {admin_notif.message}")
            print(f"  - Action URL: {admin_notif.action_url}")
            assert "Mrs. Maria Fernandes" in admin_notif.message
            assert "John Fernandes" in admin_notif.message
            assert "22,000" in admin_notif.message

        print("\n--- STEP 4: Accounts Coordinator Reconciles Transaction #{tx_id} ---")
        reconcile_resp = await client.post(
            f"/api/finance/transactions/{tx_id}/reconcile?reconciled_by=Mr.+Arvind+Krishnan",
            headers={"X-User-Role": "accounts_coordinator", "X-User-Id": "1"}
        )
        print(f"Reconcile response status: {reconcile_resp.status_code}")
        assert reconcile_resp.status_code == 200, f"Expected 200, got {reconcile_resp.status_code}"
        rec_data = reconcile_resp.json()
        print(f"Reconciled transaction response: id={rec_data.get('id')}, reconciled={rec_data.get('reconciled')}, by={rec_data.get('reconciled_by')}, at={rec_data.get('reconciled_at')}")
        assert rec_data.get("reconciled") is True
        assert rec_data.get("reconciled_by") == "Mr. Arvind Krishnan"

        print("\n--- STEP 5: Verify DB State & Security Audit Log ---")
        async with async_session() as db:
            res = await db.execute(select(PaymentTransaction).where(PaymentTransaction.id == tx_id))
            updated_tx = res.scalars().first()
            assert updated_tx.reconciled is True
            assert updated_tx.reconciled_by == "Mr. Arvind Krishnan"
            print(f"Verified DB PaymentTransaction #{tx_id} is reconciled: {updated_tx.reconciled} at {updated_tx.reconciled_at}")

            # Check audit log
            res_audit = await db.execute(
                select(SecurityAuditLog)
                .where(SecurityAuditLog.action_type == "TRANSACTION_RECONCILE")
                .order_by(SecurityAuditLog.id.desc())
            )
            audit = res_audit.scalars().first()
            if audit:
                print(f"Found Security Audit Log: {audit.action_type} - {audit.details}")

    await engine.dispose()
    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_full_test())
