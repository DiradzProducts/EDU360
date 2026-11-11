with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

lines[415] = "                    details: 'Microphone noise level spiked to ' + realDb + ' dB'\n"

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Line 416 updated successfully")
