import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from main import app
import httpx

async def test():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        r1 = await client.get("/api/admin/crm/enquiries/5/credentials")
        print("GET /api/admin/crm/enquiries/5/credentials:", r1.status_code, r1.json())
        
        r2 = await client.get("/api/parent/children?username=parent_niranjan_14")
        print("GET /api/parent/children?username=parent_niranjan_14:", r2.status_code, r2.json())

if __name__ == "__main__":
    asyncio.run(test())
