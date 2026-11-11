with open('frontend/src/app/teacher/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
inserted = False

for line in lines:
    if 'TAB CONTENT 1: MARKS LEDGER' in line and not inserted:
        new_lines.append('              {/* TAB CONTENT: LIVE AI PROCTOR COCKPIT */}\n')
        new_lines.append("              {examSubTab === 'live_cockpit' && (\n")
        new_lines.append('                <div className="space-y-6">\n')
        new_lines.append('                  <LiveInvigilatorCockpit />\n')
        new_lines.append('                </div>\n')
        new_lines.append('              )}\n\n')
        inserted = True
    new_lines.append(line)

if inserted:
    with open('frontend/src/app/teacher/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print("Successfully inserted LiveInvigilatorCockpit render into teacher/page.tsx")
else:
    print("Could not find TAB CONTENT 1: MARKS LEDGER")
