import datetime
import json
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, or_, and_
from app.core.database import get_db
from app.models.models import Notification

logger = logging.getLogger("edu360.notifications")

router = APIRouter(prefix="/api/notifications", tags=["notifications"])

class SendNotificationRequest(BaseModel):
    recipient_user_id: Optional[int] = None
    recipient_role: Optional[str] = None
    sender_name: str
    sender_role: str
    title: str
    message: str
    notification_type: str = "SYSTEM"
    priority: str = "NORMAL"
    action_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class MarkAllReadRequest(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

async def create_system_notification(
    db: AsyncSession,
    sender_name: str,
    sender_role: str,
    title: str,
    message: str,
    notification_type: str,
    priority: str = "NORMAL",
    recipient_user_id: Optional[int] = None,
    recipient_role: Optional[str] = None,
    action_url: Optional[str] = None,
    metadata_dict: Optional[Dict[str, Any]] = None
) -> Notification:
    """
    Internal helper to create and commit a persistent notification.
    """
    notif = Notification(
        recipient_user_id=recipient_user_id,
        recipient_role=recipient_role,
        sender_name=sender_name,
        sender_role=sender_role,
        title=title,
        message=message,
        notification_type=notification_type,
        priority=priority,
        action_url=action_url,
        metadata_json=json.dumps(metadata_dict or {}),
        is_read=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif

@router.get("")
async def get_notifications(
    user_id: Optional[int] = None,
    role: Optional[str] = None,
    unread_only: bool = False,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch notifications for a specific user ID or role with unread count.
    """
    query = select(Notification)
    conditions = []
    
    if user_id is not None and role:
        # Match user ID specifically or match role-wide notification
        conditions.append(or_(
            Notification.recipient_user_id == user_id,
            and_(Notification.recipient_role == role, Notification.recipient_user_id.is_(None))
        ))
    elif user_id is not None:
        conditions.append(Notification.recipient_user_id == user_id)
    elif role:
        conditions.append(Notification.recipient_role == role)

    if unread_only:
        conditions.append(Notification.is_read == False)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(Notification.id.desc()).limit(limit)
    res = await db.execute(query)
    notifications = res.scalars().all()

    # Calculate unread count
    unread_query = select(Notification).where(Notification.is_read == False)
    if conditions:
        # replace unread_only filter if any
        base_conds = [c for c in conditions if getattr(c, 'left', None) is not Notification.is_read]
        if base_conds:
            unread_query = unread_query.where(and_(*base_conds))
    
    unread_res = await db.execute(unread_query)
    unread_count = len(unread_res.scalars().all())

    items = []
    for n in notifications:
        meta = {}
        if n.metadata_json:
            try:
                meta = json.loads(n.metadata_json)
            except Exception:
                meta = {}
        items.append({
            "id": n.id,
            "recipient_user_id": n.recipient_user_id,
            "recipient_role": n.recipient_role,
            "sender_name": n.sender_name,
            "sender_role": n.sender_role,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "priority": n.priority,
            "action_url": n.action_url,
            "metadata": meta,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
            "read_at": n.read_at.isoformat() if n.read_at else None
        })

    return {
        "success": True,
        "unread_count": unread_count,
        "notifications": items
    }

@router.patch("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark a single notification as read.
    """
    res = await db.execute(select(Notification).where(Notification.id == notification_id))
    notif = res.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    notif.read_at = datetime.datetime.utcnow()
    await db.commit()

    return {"success": True, "id": notification_id, "is_read": True}

@router.post("/mark-all-read")
async def mark_all_notifications_read(
    req: MarkAllReadRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark all notifications matching user_id or role as read.
    """
    conditions = [Notification.is_read == False]
    if req.user_id is not None and req.role:
        conditions.append(or_(
            Notification.recipient_user_id == req.user_id,
            and_(Notification.recipient_role == req.role, Notification.recipient_user_id.is_(None))
        ))
    elif req.user_id is not None:
        conditions.append(Notification.recipient_user_id == req.user_id)
    elif req.role:
        conditions.append(Notification.recipient_role == req.role)

    await db.execute(
        update(Notification)
        .where(and_(*conditions))
        .values(is_read=True, read_at=datetime.datetime.utcnow())
    )
    await db.commit()

    return {"success": True, "message": "Marked all notifications as read"}

@router.post("/send")
async def send_notification(
    req: SendNotificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a notification manually or via internal microservice call.
    """
    notif = await create_system_notification(
        db=db,
        recipient_user_id=req.recipient_user_id,
        recipient_role=req.recipient_role,
        sender_name=req.sender_name,
        sender_role=req.sender_role,
        title=req.title,
        message=req.message,
        notification_type=req.notification_type,
        priority=req.priority,
        action_url=req.action_url,
        metadata_dict=req.metadata
    )
    return {"success": True, "notification_id": notif.id}
