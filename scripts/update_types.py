with open('frontend/src/lib/types.ts', 'r', encoding='utf-8') as f:
    text = f.read()

target = "academic_clearance_notes?: string;\n}"
replacement = "academic_clearance_notes?: string;\n  exam_mode?: string;\n}"

if target in text:
    text = text.replace(target, replacement, 1)
    with open('frontend/src/lib/types.ts', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Updated types.ts!")
else:
    target_crlf = "academic_clearance_notes?: string;\r\n}"
    replacement_crlf = "academic_clearance_notes?: string;\r\n  exam_mode?: string;\r\n}"
    if target_crlf in text:
        text = text.replace(target_crlf, replacement_crlf, 1)
        with open('frontend/src/lib/types.ts', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Updated types.ts (CRLF)!")
    else:
        print("Target not found in types.ts")
