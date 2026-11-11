import os

# 1. Fix student/page.tsx
student_path = os.path.join("frontend", "src", "app", "student", "page.tsx")
with open(student_path, "r", encoding="utf-8") as f:
    s_code = f.read()

s_code = s_code.replace("api.simulateJoinClass(1, {", "api.simulateJoin(1, {")
with open(student_path, "w", encoding="utf-8") as f:
    f.write(s_code)
print("SUCCESS: Fixed student/page.tsx")

# 2. Fix teacher/page.tsx
teacher_path = os.path.join("frontend", "src", "app", "teacher", "page.tsx")
with open(teacher_path, "r", encoding="utf-8") as f:
    t_code = f.read()

target = "const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');"
repl = "const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');\n  const [isLiveConferenceOpen, setIsLiveConferenceOpen] = useState(false);"

if target in t_code and "isLiveConferenceOpen" not in t_code:
    t_code = t_code.replace(target, repl, 1)
    with open(teacher_path, "w", encoding="utf-8") as f:
        f.write(t_code)
    print("SUCCESS: Fixed teacher/page.tsx")
else:
    print("Notice: check target in teacher.tsx")
