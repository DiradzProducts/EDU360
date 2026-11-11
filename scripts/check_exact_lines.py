with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(12455, min(12475, len(lines))):
    print(f"{i+1}: {repr(lines[i])}")
