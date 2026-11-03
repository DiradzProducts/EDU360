import sys

with open("backend/app/models/models.py", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update LeaveRequest
target_leave = "    teacher_notes = Column(Text, nullable=True)\n    applied_at = Column(DateTime, default=datetime.datetime.utcnow)"
replacement_leave = """    teacher_notes = Column(Text, nullable=True)
    is_medical = Column(Boolean, default=False)
    attachment_url = Column(Text, nullable=True)
    attachment_name = Column(String(255), nullable=True)
    approval_stage = Column(String(50), default="Submitted")
    applied_at = Column(DateTime, default=datetime.datetime.utcnow)"""

if target_leave in content:
    content = content.replace(target_leave, replacement_leave)
    print("LeaveRequest updated")
elif target_leave.replace("\n", "\r\n") in content:
    content = content.replace(target_leave.replace("\n", "\r\n"), replacement_leave.replace("\n", "\r\n"))
    print("LeaveRequest updated (CRLF)")
else:
    print("LeaveRequest target not found!")

# 2. Update ReportCard
target_rc = "    ai_teacher_narrative = Column(Text, nullable=True)  # Gemini pedagogical growth feedback\n    is_moderated = Column(Boolean, default=True)"
replacement_rc = """    ai_teacher_narrative = Column(Text, nullable=True)  # Gemini pedagogical growth feedback
    is_moderated = Column(Boolean, default=True)
    parent_signed_at = Column(DateTime, nullable=True)
    parent_signer_name = Column(String(100), nullable=True)
    parent_signature_hash = Column(String(64), nullable=True)
    parent_remarks = Column(Text, nullable=True)"""

if target_rc in content:
    content = content.replace(target_rc, replacement_rc)
    print("ReportCard updated")
elif target_rc.replace("\n", "\r\n") in content:
    content = content.replace(target_rc.replace("\n", "\r\n"), replacement_rc.replace("\n", "\r\n"))
    print("ReportCard updated (CRLF)")
else:
    print("ReportCard target not found!")

# 3. Add ParentTeacherMessage model
ptm_model = """

# =========================================================================
# PARENT - TEACHER DIRECT MESSAGING & COMMUNICATIONS
# =========================================================================

class ParentTeacherMessage(Base):
    __tablename__ = "parent_teacher_messages"
    __table_args__ = (
        Index("ix_pt_msg_student_created", "student_id", "created_at"),
        Index("ix_pt_msg_unread", "receiver_role", "is_read"),
    )
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    student_name = Column(String(100), nullable=True)
    sender_role = Column(String(20), nullable=False)  # 'PARENT' or 'TEACHER'
    sender_name = Column(String(100), nullable=False)
    receiver_role = Column(String(20), nullable=False)  # 'PARENT' or 'TEACHER'
    receiver_name = Column(String(100), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    message_text = Column(Text, nullable=False)
    attachment_name = Column(String(255), nullable=True)
    attachment_url = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
"""

if "class ParentTeacherMessage(Base):" not in content:
    content = content + ptm_model
    print("ParentTeacherMessage appended")

with open("backend/app/models/models.py", "w", encoding="utf-8") as f:
    f.write(content)
print("Saved backend/app/models/models.py successfully.")
