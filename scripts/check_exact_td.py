with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- TH lines ---")
for i in range(3260, 3270):
    print(f"{i+1}: {repr(lines[i])}")

print("\n--- TD lines ---")
for i in range(3370, 3385):
    print(f"{i+1}: {repr(lines[i])}")
