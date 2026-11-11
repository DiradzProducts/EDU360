with open('frontend/src/app/admin/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

target1 = "received_by: user?.name ? `${user.name} (Admin Desk)` : 'Principal Office / Admin Desk'"
replacement1 = "received_by: 'Principal Office / Admin Desk'"

target2 = "approved_by: user?.name ? `${user.name} (Principal)` : 'Principal Office'"
replacement2 = "approved_by: 'Principal Office'"

if target1 in text and target2 in text:
    text = text.replace(target1, replacement1).replace(target2, replacement2)
    with open('frontend/src/app/admin/page.tsx', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Fixed user reference in admin/page.tsx")
else:
    print("Targets not matched in admin/page.tsx")
