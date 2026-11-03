with open("frontend/src/app/parent/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

target1 = """const SHARMA_CHILDREN: ParentChildProfile[] = [
  {
    id: 6,
    name: 'Aarav Sharma',"""

replace1 = """const SHARMA_CHILDREN: ParentChildProfile[] = [
  {
    id: 1,
    name: 'Aarav Sharma',"""

target2 = "const [activeKidId, setActiveKidId] = useState<number>(6);"
replace2 = "const [activeKidId, setActiveKidId] = useState<number>(1);"

if target1 in code and target2 in code:
    code = code.replace(target1, replace1).replace(target2, replace2)
    with open("frontend/src/app/parent/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("Aarav Sharma ID fixed to 1 in parent/page.tsx!")
else:
    print("Targets not found in parent/page.tsx")
