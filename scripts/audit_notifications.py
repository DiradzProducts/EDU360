import glob
import re

print("=== AUDIT OF ALL NOTIFICATION CALLS IN BACKEND ===")
for f in sorted(glob.glob("backend/app/routers/*.py")):
    with open(f, "r", encoding="utf-8") as fp:
        content = fp.read()
    
    matches = list(re.finditer(r"create_system_notification\s*\((.*?)\)", content, re.DOTALL))
    if matches:
        print(f"\n--- {f} ({len(matches)} calls) ---")
        for m in matches:
            block = m.group(1)
            line = content[:m.start()].count("\n") + 1
            rec_role = re.search(r"recipient_role\s*=\s*[\"']([^\"']+)[\"']", block)
            rec_uid = re.search(r"recipient_user_id\s*=\s*([^,\n]+)", block)
            n_type = re.search(r"notification_type\s*=\s*[\"']([^\"']+)[\"']", block)
            title = re.search(r"title\s*=\s*f?[\"']([^\"']+)[\"']", block)
            
            r_role = rec_role.group(1) if rec_role else "None"
            r_uid = rec_uid.group(1).strip() if rec_uid else "None"
            nt = n_type.group(1) if n_type else "None"
            t = title.group(1).strip() if title else "Dynamic"
            
            print(f"  L{line:<5} | role={r_role:<22} | uid={r_uid:<15} | type={nt:<28} | title={t[:45]}")
