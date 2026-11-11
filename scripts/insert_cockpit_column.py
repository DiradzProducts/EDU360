with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if '<th className="p-3.5">Digital Admit Pass Status</th>' in line:
        new_lines.append('                      <th className="p-3.5 text-right">Invigilation Cockpit</th>\n')
    elif '<span>Admit Card Active</span>' in line:
        pass
    elif '</td>' in line and len(new_lines) > 2 and 'Admit Card Active' in ''.join(new_lines[-10:]):
        new_lines.append('                        <td className="p-3.5 text-right">\n')
        new_lines.append('                          <button\n')
        new_lines.append('                            type="button"\n')
        new_lines.append("                            onClick={() => {\n")
        new_lines.append("                              setActiveTab('cockpit');\n")
        new_lines.append("                              triggerToast(`Entering Live Proctor Cockpit for ${row.subject} (${row.class_name})...`);\n")
        new_lines.append("                            }}\n")
        new_lines.append('                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[11px] font-bold shadow-sm cursor-pointer transition-all active:scale-95"\n')
        new_lines.append('                          >\n')
        new_lines.append('                            <Video className="h-3 w-3 text-rose-300 animate-pulse" />\n')
        new_lines.append('                            <span>Enter Cockpit</span>\n')
        new_lines.append('                          </button>\n')
        new_lines.append('                        </td>\n')

with open('frontend/src/app/exam_coordinator/page.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Successfully inserted Invigilation Cockpit column into exam_coordinator/page.tsx")
