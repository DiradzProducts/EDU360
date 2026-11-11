with open('frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(825, 870):
    if 'received_by' in lines[i] or 'approved_by' in lines[i]:
        print(f"Line {i+1}: {repr(lines[i])}")
