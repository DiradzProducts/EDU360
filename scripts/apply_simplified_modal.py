with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update availableTeachers logic to strictly filter out admin/coordinators
old_teachers_block = """  // Derived teacher names for invigilation assignment

  const availableTeachers = facultyRoster.length > 0 

    ? facultyRoster.map(f => f.name) 

    : [

        'Mrs. Ananya Verma',

        'Dr. Suresh Babu',

        'Mr. Arvind Saxena',

        'Mrs. Sunitha Rao',

        'Mrs. Neha Roy',

        'Mr. Rajesh Kumar',

        'Ms. Priya Sharma',

        'Mr. K. Venkatesh'

      ];"""

new_teachers_block = """  // Derived teaching faculty strictly for invigilation duty (filtering out admin/principals/academic coordinators)
  const teachingFaculty = (facultyRoster || []).filter(f => {
    const role = ((f as any).role || (f as any).designation || (f as any).department || '').toLowerCase();
    const name = (f.name || '').toLowerCase();
    const isExcluded = 
      role.includes('coordinator') || 
      role.includes('principal') || 
      role.includes('admin') || 
      role.includes('account') || 
      role.includes('transport') ||
      name.includes('rajeshwari') || 
      name.includes('sundaram') || 
      name.includes('shweta');
    return !isExcluded;
  });

  const availableTeachers = teachingFaculty.length > 0 
    ? teachingFaculty.map(f => f.name) 
    : [
        'Mrs. Ananya Verma',
        'Dr. Suresh Babu',
        'Mr. Arvind Saxena',
        'Mrs. Sunitha Rao',
        'Mrs. Neha Roy',
        'Mr. Rajesh Kumar',
        'Ms. Priya Sharma'
      ];"""

if old_teachers_block in text:
    text = text.replace(old_teachers_block, new_teachers_block, 1)
    print("Replaced teachers block directly")
else:
    # Match with regex
    import re
    text = re.sub(
        r"// Derived teacher names for invigilation assignment\s+const availableTeachers =.*?'Mr\. K\. Venkatesh'\s*\];",
        new_teachers_block,
        text,
        flags=re.DOTALL
    )
    print("Replaced teachers block via regex")

# 2. Replace the modal form body
old_form_marker = '<form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">'
end_form_marker = '</form>'

form_start_idx = text.find(old_form_marker)
form_end_idx = text.find(end_form_marker, form_start_idx)

if form_start_idx != -1 and form_end_idx != -1:
    new_form_content = """<form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              {/* EXAM DELIVERY MODE: SINGLE TOGGLE (Hybrid Active vs CBT On Hold) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                    <Monitor className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    <span>Examination Delivery Mode</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Hybrid Mode Active</span>
                  </span>
                </div>

                {/* Clean Segmented Toggle Bar */}
                <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setNewSchedExamMode('MODE_HYBRID_SCAN')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      newSchedExamMode === 'MODE_HYBRID_SCAN'
                        ? 'bg-white dark:bg-slate-900 text-violet-700 dark:text-violet-300 shadow-sm border border-slate-200 dark:border-slate-700'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <span>📝 Hybrid Exam</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-extrabold">Paper + AI Proctor</span>
                  </button>

                  <button
                    type="button"
                    disabled
                    title="CBT Online is currently on hold. Focus is strictly on Hybrid Examinations."
                    className="py-2 px-3 rounded-xl font-medium text-xs opacity-50 cursor-not-allowed flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500"
                  >
                    <span>💻 CBT Online</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">On Hold</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  Students write answers on physical sheets under live webcam/YOLO proctoring and digital audio intercom. Final scripts are verified with dynamic submission tokens.
                </p>
              </div>

              {/* Class & Section Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <GraduationCap className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    <span>Class Cohort</span>
                  </label>
                  <select
                    value={newSchedClass}
                    onChange={e => {
                      setNewSchedClass(e.target.value);
                      setNewSchedExamName(`${e.target.value} ${newSchedSubject} Examination`);
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                  >
                    {['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    <span>Section Roster</span>
                  </label>
                  <select
                    value={newSchedSection}
                    onChange={e => setNewSchedSection(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                    <option value="All">All Sections (Combined Cohort)</option>
                  </select>
                </div>
              </div>

              {/* Subject Selection (Clean Select with Custom Input Option) */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <BookOpen className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Subject</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={['Mathematics', 'English Literature', 'General Science', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Hindi', 'Telugu'].includes(newSchedSubject) ? newSchedSubject : 'custom'}
                    onChange={e => {
                      if (e.target.value !== 'custom') {
                        setNewSchedSubject(e.target.value);
                        setNewSchedExamName(`${newSchedClass} ${e.target.value} Examination`);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                  >
                    <option value="Mathematics">📐 Mathematics</option>
                    <option value="English Literature">📖 English Literature</option>
                    <option value="General Science">🔬 General Science</option>
                    <option value="Social Studies">🌍 Social Studies</option>
                    <option value="Physics">⚡ Physics</option>
                    <option value="Chemistry">🧪 Chemistry</option>
                    <option value="Biology">🌱 Biology</option>
                    <option value="Computer Science">💻 Computer Science</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                    <option value="Telugu">🗣️ Telugu</option>
                    <option value="custom">✏️ Other / Custom Subject</option>
                  </select>

                  <input 
                    type="text" 
                    required
                    value={newSchedSubject} 
                    onChange={e => {
                      setNewSchedSubject(e.target.value);
                      setNewSchedExamName(`${newSchedClass} ${e.target.value} Examination`);
                    }} 
                    placeholder="Enter subject name..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                  />
                </div>
              </div>

              {/* Exam Title */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                  <Award className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <span>Exam Title</span>
                </label>
                <input 
                  type="text" 
                  required
                  value={newSchedExamName} 
                  onChange={e => setNewSchedExamName(e.target.value)} 
                  placeholder="e.g. Class 8 Mathematics Term 1 Descriptive Final"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                />
              </div>

              {/* Examination Date & Timing */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    <span>Examination Date &amp; Timing Schedule</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                    3.0 Hours Session
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Exam Date
                    </label>
                    <input 
                      type="date" 
                      required
                      value={newSchedDate} 
                      onChange={e => setNewSchedDate(e.target.value)} 
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-xs [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Start Time
                    </label>
                    <input 
                      type="time" 
                      required
                      value={toTime24(newSchedStartTime)} 
                      onChange={e => setNewSchedStartTime(toTime12(e.target.value))} 
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-xs [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      End Time
                    </label>
                    <input 
                      type="time" 
                      required
                      value={toTime24(newSchedEndTime)} 
                      onChange={e => setNewSchedEndTime(toTime12(e.target.value))} 
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium text-xs [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              {/* Chief Invigilator Assignment (Filtered Subject Teaching Faculty Only) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                    <span>Chief Invigilator (Teaching Faculty Only)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Excludes Academic/Admin Coordinators</span>
                </div>
                <select
                  value={newSchedInvigilator}
                  onChange={e => setNewSchedInvigilator(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-medium"
                >
                  {availableTeachers.map((t: string) => (
                    <option key={t} value={t}>
                      {t} (Faculty Invigilator)
                    </option>
                  ))}
                </select>
              </div>

              {/* Automated Fan-Out Notification Notice */}
              <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-900 dark:text-violet-200 text-[11px] flex items-start gap-2">
                <span className="text-sm">🔔</span>
                <span>
                  Once submitted, the system automatically dispatches notifications to <b>Students</b>, <b>Parents</b>, and deploys an active duty assignment to <b>{newSchedInvigilator}</b>.
                </span>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3.5 font-bold text-xs shadow-md shadow-violet-500/20 hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Submit &amp; Dispatch Duty Orders (Student • Teacher • Parent)</span>
              </button>
            </form>"""

    text = text[:form_start_idx] + new_form_content + text[form_end_idx + len(end_form_marker):]
    print("Successfully replaced form content!")
else:
    print(f"Form markers not found: start={form_start_idx}, end={form_end_idx}")

with open('frontend/src/app/exam_coordinator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated coordinator page!")
