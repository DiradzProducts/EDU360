import os
import re
import sys

# 1. Parse all endpoints in frontend/src/lib/api.ts
api_ts_path = 'frontend/src/lib/api.ts'
with open(api_ts_path, 'r', encoding='utf-8') as f:
    content = f.read()

endpoints_called = set(re.findall(r"fetchWithFallback(?:<[^>]+>)?\(\s*[`'\"]([^`'\"]+)[`'\"]", content))
print(f"Total frontend endpoints referenced in api.ts: {len(endpoints_called)}")

# 2. Extract routes from FastAPI backend
sys.path.append(os.path.abspath('backend'))
from main import app
from starlette.routing import Route
from fastapi.routing import APIRoute

all_backend_routes = []
for r in app.router.routes:
    if isinstance(r, APIRoute) or isinstance(r, Route):
        all_backend_routes.append((r.path, getattr(r, 'methods', ['GET'])))
    elif hasattr(r, 'original_router'):
        prefix = getattr(r.include_context, 'prefix', '') or ''
        for sub_r in r.original_router.routes:
            full_path = (prefix + sub_r.path).replace('//', '/')
            all_backend_routes.append((full_path, getattr(sub_r, 'methods', ['GET'])))

print(f"Total backend FastAPI registered routes: {len(all_backend_routes)}")

# 3. Match endpoints
matched = []
missing = []

for ep in sorted(endpoints_called):
    clean_ep = ep.split('?')[0]
    
    found = False
    for br_path, methods in all_backend_routes:
        # Regex match FastAPI route {param}
        br_pattern = "^" + re.sub(r"\{[^}]+\}", "[^/]+", br_path) + "$"
        # Test clean_ep directly
        if re.match(br_pattern, clean_ep) or br_path == clean_ep:
            found = True
            break
        
        # Test dynamic template expressions like ${id}
        norm_ep = re.sub(r"\$\{[^}]+\}", "[^/]+", clean_ep)
        norm_ep_pattern = "^" + norm_ep + "$"
        if re.match(norm_ep_pattern, br_path):
            found = True
            break
            
        if br_path.rstrip('/') == clean_ep.rstrip('/'):
            found = True
            break
    
    if found:
        matched.append((ep, clean_ep))
    else:
        missing.append((ep, clean_ep))

print(f"\n==================================================")
print(f"REAL BACKEND IMPLEMENTED ENDPOINTS : {len(matched)}")
print(f"MISSING IN BACKEND (MOCK FALLBACK) : {len(missing)}")
print(f"==================================================\n")

if missing:
    print(f"--- LIST OF {len(missing)} GAPS (FRONTEND CALLS WITH NO BACKEND ROUTE) ---")
    for m in missing:
        print(f"  [GAP / NO BACKEND] {m[0]}")
