with open('frontend/src/app/student/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- Lines 635-655 ---")
for i in range(635, min(655, len(lines))):
    print(f"{i+1}: {lines[i].strip().encode('ascii', errors='replace').decode('ascii')}")

print("\n--- Lines 2790-2840 ---")
for i in range(2790, min(2840, len(lines))):
    print(f"{i+1}: {lines[i].strip().encode('ascii', errors='replace').decode('ascii')}")
