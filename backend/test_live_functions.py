import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.routers.livekit_router import (
    get_live_room_status, start_live_room, end_live_room, join_live_room,
    StartLiveRoomRequest, EndLiveRoomRequest, JoinLiveRoomRequest
)

async def test_direct():
    # 1. Initial state
    st1 = await get_live_room_status("class-8b-mathematics")
    print("1. Initial is_live:", st1["is_live"])
    assert st1["is_live"] is False
    
    # 2. Student joins when not live
    j1 = await join_live_room(JoinLiveRoomRequest(
        room_name="class-8b-mathematics",
        student_id=1,
        student_name="Aarav Sharma"
    ))
    print("2. Student admitted before teacher:", j1["admitted"])
    assert j1["admitted"] is False
    
    # 3. Teacher starts live class
    s1 = await start_live_room(StartLiveRoomRequest(
        room_name="class-8b-mathematics",
        teacher_name="Mrs. Ananya Verma",
        subject="Mathematics",
        class_name="Class 8-B",
        topic="Quadratic Equations: Factorization Method"
    ))
    print("3. Teacher started is_live:", s1["room"]["is_live"])
    assert s1["room"]["is_live"] is True
    assert len(s1["room"]["active_students"]) == 1
    
    # 4. End room
    e1 = await end_live_room(EndLiveRoomRequest(room_name="class-8b-mathematics"))
    print("4. Teacher ended room:", e1["success"])
    st2 = await get_live_room_status("class-8b-mathematics")
    assert st2["is_live"] is False
    print("✅ All Live Room Functions Verified Successfully!")

if __name__ == "__main__":
    asyncio.run(test_direct())
