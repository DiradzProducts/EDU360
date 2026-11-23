import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from sqlalchemy import select, or_, and_
from app.core.database import AsyncSessionLocal
from app.models.models import Notification

async def main():
    async with AsyncSessionLocal() as db:
        stmt = (
            select(Notification)
            .where(
                or_(
                    Notification.recipient_user_id == 2,
                    and_(
                        Notification.recipient_role == "teacher",
                        Notification.recipient_user_id.is_(None)
                    )
                )
            )
            .order_by(Notification.id.desc())
        )
        res = await db.execute(stmt)
        notifs = res.scalars().all()
        print(f"Total notifications for Teacher (UID 2 or role=teacher): {len(notifs)}")
        types_count = {}
        for n in notifs:
            types_count[n.notification_type] = types_count.get(n.notification_type, 0) + 1
        
        print("\nNotification breakdown by type:")
        for t, cnt in sorted(types_count.items()):
            print(f"  - {t}: {cnt}")
            
        print("\nSample of most recent 12 notifications:")
        for n in notifs[:12]:
            print(f"  [ID {n.id}] [{n.notification_type}] Priority: {n.priority} | Recipient: UID={n.recipient_user_id}, Role={n.recipient_role}")
            print(f"    Title: {n.title}")
            print(f"    Message: {n.message[:80]}...")
            print(f"    Action: {n.action_url}")
            print(f"    Sender: {n.sender_name} ({n.sender_role})")
            print()

if __name__ == "__main__":
    asyncio.run(main())
