import asyncio
import asyncpg

async def check():
    conn = await asyncpg.connect("postgresql://postgres:123456789@localhost:5432/edu360")
    rows = await conn.fetch("""
        SELECT id, notification_type, priority, recipient_user_id, recipient_role, title, action_url 
        FROM notifications 
        WHERE recipient_user_id = 2 OR (recipient_role = 'teacher' AND recipient_user_id IS NULL)
        ORDER BY id DESC LIMIT 15;
    """)
    print(f"Found {len(rows)} recent notifications for Teacher:")
    for r in rows:
        print(f"[{r['id']}] [{r['notification_type']}] Priority: {r['priority']} | UID={r['recipient_user_id']} | Role={r['recipient_role']}")
        print(f"    Title: {r['title']}")
        print(f"    Action: {r['action_url']}")
    
    count_by_type = await conn.fetch("""
        SELECT notification_type, count(*) as count 
        FROM notifications 
        WHERE recipient_user_id = 2 OR (recipient_role = 'teacher' AND recipient_user_id IS NULL)
        GROUP BY notification_type ORDER BY count DESC;
    """)
    print("\nCounts by notification_type:")
    for c in count_by_type:
        print(f"  {c['notification_type']}: {c['count']}")

    await conn.close()

if __name__ == '__main__':
    asyncio.run(check())
