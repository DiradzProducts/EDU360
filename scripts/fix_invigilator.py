path = "frontend/src/components/proctor/live-invigilator-cockpit.tsx"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if "triggerToast(Formal strike issued to" in l:
        lines[i] = "    triggerToast(`Formal strike issued to ${name}. Telemetry synced with Principal exam record.`);\n"
    if "invigilator_notes: YOLO Telemetry" in l:
        lines[i] = "      invigilator_notes: `YOLO Telemetry: Anomaly ${cand?.anomalyType || 'Multiple Faces'} detected. Strike #${nextStrikes} issued.`\n"

with open(path, "w", encoding="utf-8") as f:
    f.writelines(lines)
print("SUCCESSFULLY REPLACED LINES IN LIVE INVIGILATOR COCKPIT")
