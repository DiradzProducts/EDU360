with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Inspect around line 135-155
lines = text.splitlines()
for i in range(130, min(160, len(lines))):
    print(f"{i+1}: {repr(lines[i])}")
