import sqlite3
import urllib.request
import json

print("=== CHECKING DATABASE INTEGRITY FOR KAVYA (ID: 14) ===")
for db in ['backend/edu360.db', 'edu360.db']:
    conn = sqlite3.connect(db)
    cur = conn.cursor()
    
    cur.execute("SELECT id, name, class_name, section, roll_no, admission_no, status, user_id FROM students WHERE id = 14")
    st = cur.fetchone()
    print(f"[{db}] Student:", st)
    
    cur.execute("SELECT id, username, role, phone FROM users WHERE id IN (25, 26) OR username LIKE '%kavya%' OR username LIKE '%niranjan%'")
    users = cur.fetchall()
    print(f"[{db}] Users:", users)
    
    cur.execute("SELECT id, title, doc_type, status FROM official_documents WHERE student_id = 14")
    docs = cur.fetchall()
    print(f"[{db}] Documents count:", len(docs), docs[:2])
    
    cur.execute("SELECT id, amount, status, milestone_title FROM payment_transactions WHERE student_name = 'Kavya'")
    txs = cur.fetchall()
    print(f"[{db}] Transactions:", txs)
    
    conn.close()

print("\n=== TESTING BACKEND API ENDPOINTS ===")
try:
    req = urllib.request.urlopen("http://localhost:8000/api/admin/crm/enquiries/5/credentials")
    data = json.loads(req.read().decode())
    print("GET /api/admin/crm/enquiries/5/credentials:", data)
except Exception as e:
    print("Error calling credentials endpoint:", e)

try:
    req = urllib.request.urlopen("http://localhost:8000/api/parent/children?username=parent_niranjan_14")
    data = json.loads(req.read().decode())
    print("GET /api/parent/children?username=parent_niranjan_14:", data)
except Exception as e:
    print("Error calling children endpoint:", e)
