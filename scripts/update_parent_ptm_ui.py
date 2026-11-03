with open('frontend/src/components/parent-ptm-view.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Update hardcoded student details in top banner
old_banner_text = '''          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-800">
              <Users className="h-3.5 w-3.5" />
              Parent-Teacher Meeting (PTM) Portal
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Student: Aarav Sharma &bull; Class 8-B
            </span>
          </div>'''

new_banner_text = '''          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-bold border border-purple-200 dark:border-purple-800">
              <Users className="h-3.5 w-3.5" />
              Parent-Teacher Meeting (PTM) Portal
            </span>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              Student: {studentName} &bull; {className || (isPrimaryKid ? 'Class 3-A' : 'Class 8-B')}
            </span>
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Isolated Child Schedule
            </span>
          </div>'''

if old_banner_text in code:
    code = code.replace(old_banner_text, new_banner_text, 1)
    print("SUCCESS: Updated student in top banner")
else:
    print("WARNING: old_banner_text not found")

# 2. Add isolated child profile banner right above faculty directory
old_fac_dir = '''      {/* ===================================================================== */}
      {/* 1. DUAL-CATEGORY FACULTY DIRECTORY                                    */}
      {/* ===================================================================== */}'''

new_fac_dir = '''      {/* ISOLATED STUDENT PTM PROFILE BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 p-4 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-600/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                Active Child Conference Stream
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                {studentName} ({className || (isPrimaryKid ? 'Class 3-A' : 'Class 8-B')})
              </span>
            </div>
            <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
              Conferences and faculty slots are strictly isolated for this student. No cross-sibling overlap or faculty schedule confusion.
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 shadow-2xs">
          Assigned Homeroom: <strong>{homeroomTeacher.name}</strong>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. DUAL-CATEGORY FACULTY DIRECTORY                                    */}
      {/* ===================================================================== */}'''

if old_fac_dir in code:
    code = code.replace(old_fac_dir, new_fac_dir, 1)
    print("SUCCESS: Added isolated child profile banner")
else:
    print("WARNING: old_fac_dir not found")

# 3. Update handleSendNote to use dynamic student props
old_send_note_student = '''        student_id: 1,
        student_name: 'Aarav Sharma',
        student_class: '8-B','''

new_send_note_student = '''        student_id: studentId,
        student_name: studentName,
        student_class: className || (studentId === 7 ? 'Class 3-A' : 'Class 8-B'),'''

if old_send_note_student in code:
    code = code.replace(old_send_note_student, new_send_note_student, 1)
    print("SUCCESS: Updated student in handleSendNote")
else:
    print("WARNING: old_send_note_student not found")

# 4. Update homeroomTeacher avatar & label
old_av_box = '''                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-500/20">
                  AV
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {homeroomTeacher.name}
                    </h4>
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                      Class 8-B Homeroom In-Charge
                    </span>'''

new_av_box = '''                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-500/20">
                  {homeroomTeacher.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {homeroomTeacher.name}
                    </h4>
                    <span className="rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                      {className || (isPrimaryKid ? 'Class 3-A' : 'Class 8-B')} Homeroom In-Charge
                    </span>'''

if old_av_box in code:
    code = code.replace(old_av_box, new_av_box, 1)
    print("SUCCESS: Updated homeroom avatar and label")
else:
    print("WARNING: old_av_box not found")

with open('frontend/src/components/parent-ptm-view.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
