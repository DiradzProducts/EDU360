import os
import re
import sys
import inspect
from typing import Set

sys.path.insert(0, os.path.abspath('backend'))

from main import app
from starlette.routing import Route

# Collect all backend routes
backend_routes = []
for r in app.routes:
    if hasattr(r, 'original_router'):
        for sub_r in r.original_router.routes:
            p = getattr(sub_r, 'path', '')
            methods = getattr(sub_r, 'methods', ['GET'])
            backend_routes.append({
                'path': p,
                'methods': list(methods),
                'endpoint': getattr(sub_r, 'endpoint', None)
            })
    elif hasattr(r, 'path'):
        backend_routes.append({
            'path': r.path,
            'methods': getattr(r, 'methods', ['GET']),
            'endpoint': getattr(r, 'endpoint', None)
        })

print(f"Total backend routes catalogued: {len(backend_routes)}")

# Read frontend/src/lib/api.ts
with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    api_ts = f.read()

# Read all frontend pages
frontend_files = []
for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            frontend_files.append(os.path.join(root, file))

print(f"Total frontend TS/TSX files: {len(frontend_files)}")

# Extract all API URLs from frontend
api_pattern = re.compile(r'(/api/[a-zA-Z0-9_\-\/]+)')
called_endpoints: Set[str] = set()

for fpath in frontend_files:
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            txt = f.read()
            for match in api_pattern.findall(txt):
                # Clean up trailing slashes or dynamic segments
                cleaned = match.rstrip('/')
                called_endpoints.add(cleaned)
    except Exception:
        pass

print(f"Total unique /api/... endpoints referenced across frontend: {len(called_endpoints)}")

# Convert backend route patterns to regex for matching
route_regexes = []
for br in backend_routes:
    # Convert {param} to [^/]+
    pattern = re.sub(r'\{[a-zA-Z0-9_]+\}', r'[^/]+', br['path'])
    # Optional trailing slash
    pattern = f"^{pattern}/?$"
    try:
        route_regexes.append((re.compile(pattern), br))
    except Exception as e:
        print(f"Regex error for {br['path']}: {e}")

# Check which called endpoints don't match any backend route
unmatched = []
for endpoint in sorted(called_endpoints):
    matched = False
    for rgx, br in route_regexes:
        if rgx.match(endpoint):
            matched = True
            break
    if not matched:
        unmatched.append(endpoint)

print(f"\nUnmatched endpoints in frontend ({len(unmatched)}):")
for u in unmatched:
    print(f"  - {u}")
