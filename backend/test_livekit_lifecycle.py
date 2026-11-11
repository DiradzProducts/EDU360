import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import httpx
from main import app

async def test_live_lifecycle():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Check initial room status (should be not live)
        r1 = await client.get("/api/livekit/rooms/class-8b-mathematics/status")
        print("1. Initial Status:", r1.json())
        assert r1.json()["is_live"] is False
        
        # 2. Student joins before teacher starts (should be waiting)
        r2 = await client.post("/api/livekit/rooms/join", json={
            "room_name": "class-8b-mathematics",
            "student_id": 1,
            "student_name": "Aarav Sharma"
        })
        print("2. Student Join (Before Teacher):", r2.json())
        assert r2.json()["admitted"] is False
        
        # 3. Teacher starts live class
        r3 = await client.post("/api/livekit/rooms/start", json={
            "room_name": "class-8b-mathematics",
            "teacher_name": "Mrs. Ananya Verma",
            "subject": "Mathematics",
            "class_name": "Class 8-B",
            "topic": "Quadratic Equations: Factorization Method"
        })
        print("3. Teacher Starts Live:", r3.json())
        assert r3.json()["room"]["is_live"] is True
        # Waiting student should have been auto-moved to active
        assert len(r3.json()["room"]["active_students"]) == 1
        
        # 4. Student checks room status (now live)
        r4 = await client.get("/api/livekit/rooms/class-8b-mathematics/status")
        print("4. Status when Live:", r4.json())
        assert r4.json()["is_live"] is True
        
        # 5. Teacher ends live class
        r5 = await client.post("/api/livekit/rooms/end", json={"room_name": "class-8b-mathematics"})
        print("5. Teacher Ends Live:", r5.json())
        
        r6 = await client.get("/api/livekit/rooms/class-8b-mathematics/status")
        print("6. Status after End:", r6.json())
        assert r6.json()["is_live"] is False

    print("\n✅ LIVE CLASS LIFECYCLE & COORDINATION FULLY VERIFIED!")

if __name__ == "__main__":
    asyncio.run(test_live_lifecycle())
