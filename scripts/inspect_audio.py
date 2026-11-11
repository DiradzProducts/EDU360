with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('audio_debug.txt', 'w', encoding='utf-8') as out:
    for i in range(300, 340):
        out.write(f'{i+1}: {lines[i]}')
    out.write('\n---\n')
    for i in range(380, 435):
        out.write(f'{i+1}: {lines[i]}')

print("Wrote audio_debug.txt")
