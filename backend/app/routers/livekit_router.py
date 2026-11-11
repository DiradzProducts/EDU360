import hmac
import hashlib
import base64
import json
import time
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import get_livekit_config
from app.core.database import get_db

router = APIRouter(prefix="/api/livekit", tags=["livekit"])

class LiveKitTokenRequest(BaseModel):
    room_name: str
    participant_name: str
    participant_identity: Optional[str] = None
    role: Optional[str] = "STUDENT"  # TEACHER, STUDENT, PARENT, EXAM_COORDINATOR
    metadata: Optional[dict] = None

class LiveKitTokenResponse(BaseModel):
    server_url: str
    token: str
    room_name: str
    participant_identity: str
    participant_name: str
    role: str
    is_cloud_active: bool

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def generate_livekit_jwt(
    api_key: str,
    api_secret: str,
    room_name: str,
    identity: str,
    name: str,
    role: str = "STUDENT",
    valid_seconds: int = 21600  # 6 hours
) -> str:
    """
    Generates a 100% RFC 7519 compliant HS256 LiveKit AccessToken JWT.
    Enforces role grants:
    - TEACHER: canPublish=True, canSubscribe=True, canPublishData=True, roomAdmin=True
    - STUDENT: canPublish=True, canSubscribe=True, canPublishData=True
    - PARENT: canPublish=True, canSubscribe=True, canPublishData=True
    """
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    
    is_teacher = role.upper() in ["TEACHER", "HOST", "ADMIN"]
    
    video_grants = {
        "room": room_name,
        "roomJoin": True,
        "canPublish": True,
        "canSubscribe": True,
        "canPublishData": True,
        "canPublishSources": ["camera", "microphone", "screen_share"]
    }
    if is_teacher:
        video_grants["roomAdmin"] = True

    payload = {
        "iss": api_key,
        "sub": identity,
        "name": name,
        "metadata": json.dumps({"role": role, "name": name, "joined_at": now}),
        "nbf": now - 5,
        "exp": now + valid_seconds,
        "video": video_grants
    }

    segments = [
        _b64url(json.dumps(header, separators=(',', ':')).encode('utf-8')),
        _b64url(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    ]
    signing_input = ".".join(segments).encode('utf-8')
    signature = hmac.new(api_secret.encode('utf-8'), signing_input, hashlib.sha256).digest()
    return f"{segments[0]}.{segments[1]}.{_b64url(signature)}"

@router.post("/token", response_model=LiveKitTokenResponse)
async def create_livekit_token(req: LiveKitTokenRequest):
    """
    Issues authenticated LiveKit WebRTC AccessToken for video conferencing.
    Supports Teachers, Students, Parents, and Invigilators.
    """
    cfg = get_livekit_config()
    role_str = (req.role or "STUDENT").lower()
    clean_name = req.participant_name.lower().replace(" ", "_").replace(".", "")
    if req.participant_identity:
        identity = req.participant_identity
    else:
        # Generates a unique session identity per device/tab: e.g. teacher_mrs_ananya_verma_9482_a1b2
        identity = f"{role_str}_{clean_name}_{int(time.time()*1000)%100000}_{uuid.uuid4().hex[:4]}"
    
    token = generate_livekit_jwt(
        api_key=cfg["api_key"],
        api_secret=cfg["api_secret"],
        room_name=req.room_name,
        identity=identity,
        name=req.participant_name,
        role=req.role or "STUDENT"
    )
    
    is_cloud = "demo.livekit.cloud" not in cfg["url"] and cfg["api_key"] != "devkey"

    return LiveKitTokenResponse(
        server_url=cfg["url"],
        token=token,
        room_name=req.room_name,
        participant_identity=identity,
        participant_name=req.participant_name,
        role=req.role or "STUDENT",
        is_cloud_active=is_cloud
    )

@router.get("/config")
async def get_livekit_status():
    cfg = get_livekit_config()
    is_cloud = "demo.livekit.cloud" not in cfg["url"] and cfg["api_key"] != "devkey"
    return {
        "status": "ready",
        "server_url": cfg["url"],
        "is_configured": is_cloud,
        "mode": "LiveKit Cloud Free Tier" if is_cloud else "Developer Local / Standalone Mode"
    }


class StartLiveRoomRequest(BaseModel):
    room_name: str
    teacher_name: str
    subject: Optional[str] = "Mathematics"
    class_name: Optional[str] = "Class 8-B"
    topic: Optional[str] = "Quadratic Equations: Factorization Method"

class EndLiveRoomRequest(BaseModel):
    room_name: str

class JoinLiveRoomRequest(BaseModel):
    room_name: str
    student_id: int
    student_name: str
    role: Optional[str] = "STUDENT"

# In-memory store for active live rooms with role coordination
ACTIVE_LIVE_ROOMS: dict = {
    "class-8b-mathematics": {
        "room_name": "class-8b-mathematics",
        "subject": "Mathematics",
        "class_name": "Class 8-B",
        "topic": "Quadratic Equations: Factorization Method",
        "period": "Period 3 (10:30 AM - 11:15 AM)",
        "teacher_name": "Mrs. Ananya Verma",
        "is_live": False,
        "started_at": None,
        "ended_at": None,
        "active_students": [],
        "waiting_students": []
    }
}

@router.get("/rooms/{room_name}/status")
async def get_live_room_status(room_name: str):
    room = ACTIVE_LIVE_ROOMS.get(room_name)
    if not room:
        room = {
            "room_name": room_name,
            "subject": "Mathematics",
            "class_name": "Class 8-B",
            "topic": "Active Lecture Session",
            "period": "Current Period",
            "teacher_name": "Faculty Instructor",
            "is_live": False,
            "started_at": None,
            "ended_at": None,
            "active_students": [],
            "waiting_students": []
        }
        room["started_epoch"] = None
        ACTIVE_LIVE_ROOMS[room_name] = room
    
    started_epoch = room.get("started_epoch")
    elapsed_minutes = max(0.0, round((time.time() - started_epoch) / 60.0, 1)) if (room.get("is_live") and started_epoch) else 0.0

    return {
        "success": True,
        "room_name": room["room_name"],
        "is_live": room["is_live"],
        "teacher_name": room["teacher_name"],
        "subject": room["subject"],
        "class_name": room["class_name"],
        "topic": room["topic"],
        "started_at": room["started_at"],
        "started_epoch": started_epoch,
        "elapsed_minutes": elapsed_minutes,
        "active_students_count": len(room.get("active_students", [])),
        "waiting_students_count": len(room.get("waiting_students", [])),
        "active_students": room.get("active_students", []),
        "waiting_students": room.get("waiting_students", [])
    }

@router.post("/rooms/start")
async def start_live_room(req: StartLiveRoomRequest):
    now_str = time.strftime("%I:%M %p")
    now_epoch = time.time()
    room = ACTIVE_LIVE_ROOMS.get(req.room_name, {})
    room.update({
        "room_name": req.room_name,
        "subject": req.subject or room.get("subject", "Mathematics"),
        "class_name": req.class_name or room.get("class_name", "Class 8-B"),
        "topic": req.topic or room.get("topic", "Quadratic Equations"),
        "teacher_name": req.teacher_name,
        "is_live": True,
        "started_at": now_str,
        "started_epoch": now_epoch,
        "ended_at": None
    })
    waiting = room.get("waiting_students", [])
    active = room.get("active_students", [])
    for ws in waiting:
        if not any(a["student_id"] == ws["student_id"] for a in active):
            active.append(ws)
    room["waiting_students"] = []
    room["active_students"] = active
    ACTIVE_LIVE_ROOMS[req.room_name] = room

    return {
        "success": True,
        "message": f"Live class session for {room['class_name']} {room['subject']} is now LIVE!",
        "room": room
    }

@router.post("/rooms/end")
async def end_live_room(req: EndLiveRoomRequest):
    room = ACTIVE_LIVE_ROOMS.get(req.room_name)
    if room:
        room["is_live"] = False
        room["ended_at"] = time.strftime("%I:%M %p")
        room["active_students"] = []
        room["waiting_students"] = []
    return {
        "success": True,
        "message": "Live class session concluded by teacher.",
        "room_name": req.room_name
    }

@router.post("/rooms/join")
async def join_live_room(req: JoinLiveRoomRequest):
    room = ACTIVE_LIVE_ROOMS.get(req.room_name)
    if not room:
        room = {
            "room_name": req.room_name,
            "subject": "Mathematics",
            "class_name": "Class 8-B",
            "topic": "Active Lecture Session",
            "teacher_name": "Mrs. Ananya Verma",
            "is_live": False,
            "started_at": None,
            "ended_at": None,
            "active_students": [],
            "waiting_students": []
        }
        ACTIVE_LIVE_ROOMS[req.room_name] = room

    st_entry = {
        "student_id": req.student_id,
        "student_name": req.student_name,
        "timestamp": time.strftime("%I:%M %p")
    }

    if room["is_live"]:
        started_epoch = room.get("started_epoch") or time.time()
        elapsed_minutes = max(0.0, round((time.time() - started_epoch) / 60.0, 1))

        # Check 20-Minute Session Lockout Policy for Students
        is_student = (req.role or "STUDENT").upper() == "STUDENT"
        if elapsed_minutes > 20.0 and is_student:
            st_entry["minutes_elapsed"] = elapsed_minutes
            st_entry["attendance_status"] = "Absent"
            st_entry["is_late"] = True
            st_entry["locked_out"] = True
            return {
                "admitted": False,
                "locked": True,
                "is_live": True,
                "minutes_elapsed": elapsed_minutes,
                "attendance_status": "Absent",
                "is_late": True,
                "rationale": f"Session Locked: Joined at +{elapsed_minutes:.1f}m (>20m threshold). Entry closed; marked Absent.",
                "lock_reason": "The class has been in progress for over 20 minutes. To protect classroom continuity, live entry is locked. You are marked Absent for the live session, but the full lecture recording and notes will be accessible immediately upon conclusion.",
                "rule_triggered": "20-Minute Session Lockout Policy",
                "message": f"Class locked (>20m elapsed). Auto-marked Absent. Recording will be available in your portal.",
                "room": room
            }

        is_late = elapsed_minutes > 10.0
        attendance_status = "Late" if is_late else "Present"
        rationale = (
            f"Joined +{elapsed_minutes:.1f}m late (>10m stipulation threshold exceeded). Flagged for Teacher review."
            if is_late
            else f"Joined on-time at +{elapsed_minutes:.1f}m (within 10-minute auto-attendance window)."
        )

        st_entry["minutes_elapsed"] = elapsed_minutes
        st_entry["attendance_status"] = attendance_status
        st_entry["is_late"] = is_late

        if not any(a["student_id"] == req.student_id for a in room["active_students"]):
            room["active_students"].append(st_entry)
        room["waiting_students"] = [w for w in room["waiting_students"] if w["student_id"] != req.student_id]
        return {
            "admitted": True,
            "locked": False,
            "is_live": True,
            "minutes_elapsed": elapsed_minutes,
            "attendance_status": attendance_status,
            "is_late": is_late,
            "rationale": rationale,
            "rule_triggered": "10-Minute Auto-Attendance Stipulation",
            "message": f"Admitted to live class with {room['teacher_name']}. Auto-attendance: {attendance_status}.",
            "room": room
        }
    else:
        if not any(w["student_id"] == req.student_id for w in room["waiting_students"]):
            room["waiting_students"].append(st_entry)
        return {
            "admitted": False,
            "is_live": False,
            "message": f"Teacher {room['teacher_name']} has not started the class yet. Placed in waiting lobby.",
            "waiting_position": len(room["waiting_students"]),
            "room": room
        }

@router.post("/rooms/leave")
async def leave_live_room(req: JoinLiveRoomRequest):
    room = ACTIVE_LIVE_ROOMS.get(req.room_name)
    if room:
        room["active_students"] = [a for a in room.get("active_students", []) if a["student_id"] != req.student_id]
        room["waiting_students"] = [w for w in room.get("waiting_students", []) if w["student_id"] != req.student_id]
    return {"success": True, "message": "Left live room."}
