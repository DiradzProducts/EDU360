import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:123456789@localhost:5432/edu360')
    rows = await conn.fetch("SELECT id, username, email, role FROM users WHERE role IN ('parent', 'student') ORDER BY id")
    for r in rows:
        print(dict(r))
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
