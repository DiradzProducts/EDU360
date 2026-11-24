import urllib.request
import json

def test():
    url = 'http://localhost:8000/api/notifications?user_id=2&role=teacher'
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"Status: {resp.status}")
            print(f"Total: {len(data.get('notifications', []))}")
            for n in data.get('notifications', [])[:5]:
                print(f"[{n.get('notification_type')}] created_at: {n.get('created_at')} -> Title: {n.get('title')}")
    except Exception as e:
        print("Error fetching notifications:", e)

if __name__ == "__main__":
    test()
