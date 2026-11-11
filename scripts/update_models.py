with open('backend/app/models/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = """    class_name = Column(String(50), nullable=False)

    exam_date = Column(String(30), nullable=False)"""

replacement = """    class_name = Column(String(50), nullable=False)

    section = Column(String(20), default="B")

    exam_mode = Column(String(50), default="MODE_CBT")

    exam_date = Column(String(30), nullable=False)"""

if target in content:
    content = content.replace(target, replacement, 1)
    with open('backend/app/models/models.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Updated models.py successfully!')
else:
    print('Target not found!')
