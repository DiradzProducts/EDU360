# 1. Update frontend/src/lib/types.ts
with open('frontend/src/lib/types.ts', 'r', encoding='utf-8') as f:
    types_code = f.read()

types_code = types_code.replace(
    "status: 'Present' | 'Late' | 'Absent' | 'Leave';",
    "status: 'Present' | 'Late' | 'Absent' | 'Leave' | 'Excused Leave';"
)
with open('frontend/src/lib/types.ts', 'w', encoding='utf-8') as f:
    f.write(types_code)
print("1. Updated types.ts")

# 2. Update frontend/src/lib/api.ts to provide applyStudentLeave alias
with open('frontend/src/lib/api.ts', 'r', encoding='utf-8') as f:
    api_code = f.read()

if 'applyStudentLeave:' not in api_code:
    api_code = api_code.replace(
        "  applyParentLeave: async (data: {",
        "  applyStudentLeave: async (data: any) => { return await api.applyParentLeave(data); },\n  applyParentLeave: async (data: {"
    )
    with open('frontend/src/lib/api.ts', 'w', encoding='utf-8') as f:
        f.write(api_code)
    print("2. Added applyStudentLeave alias in api.ts")
else:
    print("2. applyStudentLeave already exists in api.ts")

# 3. Update frontend/src/app/parent/page.tsx
with open('frontend/src/app/parent/page.tsx', 'r', encoding='utf-8') as f:
    parent_code = f.read()

parent_code = parent_code.replace(
    "  pendingHomeworkCount: number;\n}",
    "  pendingHomeworkCount: number;\n  guardianName?: string;\n}"
)
parent_code = parent_code.replace(
    "await api.applyStudentLeave({",
    "await api.applyParentLeave({"
)
with open('frontend/src/app/parent/page.tsx', 'w', encoding='utf-8') as f:
    f.write(parent_code)
print("3. Updated parent/page.tsx")

# 4. Update frontend/src/components/attendance-simulator.tsx
with open('frontend/src/components/attendance-simulator.tsx', 'r', encoding='utf-8') as f:
    sim_code = f.read()

sim_code = sim_code.replace(
    "const leaveCount = records.filter(r => r.status === 'Leave' || r.status === 'Excused Leave').length;",
    "const leaveCount = records.filter(r => (r.status as string) === 'Leave' || (r.status as string) === 'Excused Leave').length;"
)
sim_code = sim_code.replace(
    "const absentCount = records.filter(r => r.status === 'Absent' && r.status !== 'Leave' && r.status !== 'Excused Leave').length;",
    "const absentCount = records.filter(r => r.status === 'Absent').length;"
)
sim_code = sim_code.replace(
    "const isLeave = rec.status === 'Leave' || rec.status === 'Excused Leave';",
    "const isLeave = (rec.status as string) === 'Leave' || (rec.status as string) === 'Excused Leave';"
)
with open('frontend/src/components/attendance-simulator.tsx', 'w', encoding='utf-8') as f:
    f.write(sim_code)
print("4. Updated attendance-simulator.tsx")
