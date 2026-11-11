with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(12420, min(12460, len(lines))):
    print(f"{i+1}: {lines[i].strip()[:100].encode('ascii', errors='replace').decode('ascii')}")
