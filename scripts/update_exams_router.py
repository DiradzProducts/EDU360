with open("backend/app/routers/exams.py", "r", encoding="utf-8") as f:
    content = f.read()

target = """            "is_published": rc.is_published,
            "published_at": rc.published_at.isoformat() if rc.published_at else None
        })"""

replacement = """            "is_published": rc.is_published,
            "published_at": rc.published_at.isoformat() if rc.published_at else None,
            "parent_signed_at": rc.parent_signed_at.isoformat() if rc.parent_signed_at else None,
            "parent_signer_name": rc.parent_signer_name,
            "parent_signature_hash": rc.parent_signature_hash,
            "parent_remarks": rc.parent_remarks
        })"""

if target in content:
    content = content.replace(target, replacement)
    print("exams.py updated (LF)")
elif target.replace("\n", "\r\n") in content:
    content = content.replace(target.replace("\n", "\r\n"), replacement.replace("\n", "\r\n"))
    print("exams.py updated (CRLF)")
else:
    print("exams.py target not found!")

with open("backend/app/routers/exams.py", "w", encoding="utf-8") as f:
    f.write(content)
