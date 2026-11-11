with open('frontend/src/app/exam_coordinator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update initial state for newSchedExamMode to MODE_HYBRID_SCAN
target_mode_state = "const [newSchedExamMode, setNewSchedExamMode] = useState<'MODE_CBT' | 'MODE_HYBRID_SCAN' | 'MODE_OFFLINE'>('MODE_CBT');"
repl_mode_state = "const [newSchedExamMode, setNewSchedExamMode] = useState<'MODE_CBT' | 'MODE_HYBRID_SCAN' | 'MODE_OFFLINE'>('MODE_HYBRID_SCAN');"
if target_mode_state in text:
    text = text.replace(target_mode_state, repl_mode_state, 1)
    print("Updated newSchedExamMode initial state to MODE_HYBRID_SCAN")
else:
    print("Warning: target_mode_state not found")

# 2. Update availableTeachers to strictly filter out non-teaching staff (academic coordinator, principal, exam coordinator)
target_teachers = """  // Derived teacher names for invigilation assignment

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

        'Mr. Amitav Ghosh'

      ];"""

repl_teachers = """  // Derived teaching faculty strictly for invigilation assignment (filtering out admin/principals/coordinators)
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

if target_teachers in text:
    text = text.replace(target_teachers, repl_teachers, 1)
    print("Updated availableTeachers with strict teaching filter")
else:
    print("Warning: target_teachers not found, attempting loose newline match...")
    # Try normalized CRLF / LF match
    target_clean = "\n".join([line.strip() for line in target_teachers.splitlines() if line.strip()])
    # We will search by regex
    import re
    m = re.search(r"// Derived teacher names for invigilation assignment\s+const availableTeachers =.*?'Mr\. Amitav Ghosh'\s*\];", text, re.DOTALL)
    if m:
        text = text[:m.start()] + repl_teachers + text[m.end():]
        print("Replaced availableTeachers via regex")
    else:
        print("Could not replace availableTeachers")

with open('frontend/src/app/exam_coordinator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
