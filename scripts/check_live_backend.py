import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:8000/api/admin/exit-clearances") as res:
        data = json.loads(res.read().decode())
        print("Exit clearances on localhost:8000:", data)
except Exception as e:
    print("Error calling localhost:8000:", e)
