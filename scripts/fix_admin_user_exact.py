with open('frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'received_by: user?.name' in l:
        lines[i] = "        received_by: 'Principal Office / Admin Desk',\n"
    elif 'approved_by: user?.name' in l:
        lines[i] = "        approved_by: 'Dr. Sunita Kapoor (Principal)',\n"

with open('frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Updated admin/page.tsx successfully.")
