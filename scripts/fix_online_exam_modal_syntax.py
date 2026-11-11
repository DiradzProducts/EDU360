with open('frontend/src/components/online-exam-modal.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_next = False
for i in range(len(lines)):
    if skip_next:
        skip_next = False
        continue
    if "rulesStage === 'rules' ? (" in lines[i] and i+1 < len(lines) and "rulesStage === 'rules' ? (" in lines[i+1]:
        print(f"Removing duplicated line at {i+1}")
        new_lines.append(lines[i])
        skip_next = True
    else:
        new_lines.append(lines[i])

with open('frontend/src/components/online-exam-modal.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Finished fixing duplicate lines.")
