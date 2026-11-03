with open("frontend/src/app/parent/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add medical leave checkbox in the form
target_checkbox_spot = '                    <div>\n                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">\n                        Doctor&apos;s Prescription / Medical Certificate (Optional for Medical Leave)\n                      </label>'

replace_checkbox = """                    <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <input
                        type="checkbox"
                        id="is-medical-leave-checkbox"
                        checked={isMedicalLeave}
                        onChange={(e) => setIsMedicalLeave(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="is-medical-leave-checkbox" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer select-none">
                        Mandated Medical / Hospitalization Leave (Requires Doctor&apos;s Note)
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Doctor&apos;s Prescription / Medical Certificate (Required for Medical Leave)
                      </label>"""

if target_checkbox_spot in content:
    content = content.replace(target_checkbox_spot, replace_checkbox)

# Update tbody with dynamic leaveHistory
target_tbody = """                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              12 Oct 2026 – 15 Oct 2026 <span className="text-[10px] font-normal text-slate-400 block">4 Days (Hospital Rest)</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                              Acute Viral Pyrexia (High Fever 103°F)
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium">
                              Mrs. Ananya Verma (Homeroom Faculty)
                            </td>
                            <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 text-[11px]">
                              Dr_Patel_Hospital_Clearance.pdf ✓
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                                Approved ✓
                              </span>
                            </td>
                          </tr>"""

replace_tbody = """                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                          {leaveHistory.map((lr) => (
                            <tr key={lr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                              <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                                {lr.from_date} – {lr.to_date}
                                {lr.is_medical && (
                                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block mt-0.5">
                                    [Medical Leave]
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                                {lr.reason}
                              </td>
                              <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium">
                                <div className="space-y-0.5">
                                  <span>{activeKid.homeroomFaculty}</span>
                                  <span className="text-[10px] text-slate-400 block">Stage: {lr.approval_stage || (lr.status === 'Approved' ? 'Attendance Adjusted' : 'Under Review')}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 text-[11px]">
                                {lr.attachment_name ? `${lr.attachment_name} ✓` : 'Standard Parent Note'}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                                  lr.status === 'Approved'
                                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                    : lr.status === 'Rejected'
                                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                }`}>
                                  {lr.status === 'Approved' ? 'Approved ✓' : lr.status === 'Rejected' ? 'Rejected ✗' : 'Pending Review'}
                                </span>
                              </td>
                            </tr>
                          ))}"""

if target_tbody in content:
    content = content.replace(target_tbody, replace_tbody)

with open("frontend/src/app/parent/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("parent/page.tsx leave section updated successfully.")
