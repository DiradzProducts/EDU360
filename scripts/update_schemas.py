with open("backend/app/schemas/schemas.py", "r", encoding="utf-8") as f:
    content = f.read()

target = """class LeaveRequestCreate(BaseModel):
    student_id: int
    student_name: str
    parent_name: str
    from_date: str
    to_date: str
    reason: str

class LeaveRequestReview(BaseModel):
    status: str  # Approved or Rejected
    teacher_notes: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    parent_name: str
    from_date: str
    to_date: str
    reason: str
    status: str
    teacher_notes: Optional[str] = None
    applied_at: datetime.datetime
    class Config:
        from_attributes = True"""

replacement = """class LeaveRequestCreate(BaseModel):
    student_id: int
    student_name: str
    parent_name: str
    from_date: str
    to_date: str
    reason: str
    is_medical: Optional[bool] = False
    attachment_name: Optional[str] = None
    attachment_url: Optional[str] = None

class LeaveRequestReview(BaseModel):
    status: str  # Approved or Rejected
    teacher_notes: Optional[str] = None

class LeaveRequestResponse(BaseModel):
    id: int
    student_id: int
    student_name: str
    parent_name: str
    from_date: str
    to_date: str
    reason: str
    status: str
    teacher_notes: Optional[str] = None
    is_medical: Optional[bool] = False
    attachment_name: Optional[str] = None
    attachment_url: Optional[str] = None
    approval_stage: Optional[str] = "Submitted"
    applied_at: datetime.datetime
    class Config:
        from_attributes = True

# --- Parent-Teacher Direct Messaging Schemas ---
class ParentTeacherChatMessageCreate(BaseModel):
    student_id: int
    sender_role: str = "PARENT"  # PARENT or TEACHER
    sender_name: str
    receiver_role: str = "TEACHER"
    receiver_name: str
    message_text: str
    attachment_name: Optional[str] = None
    attachment_url: Optional[str] = None

class ParentTeacherChatMessageResponse(BaseModel):
    id: int
    student_id: int
    student_name: Optional[str] = None
    sender_role: str
    sender_name: str
    receiver_role: str
    receiver_name: str
    message_text: str
    attachment_name: Optional[str] = None
    attachment_url: Optional[str] = None
    is_read: bool
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class ReportCardSignRequest(BaseModel):
    signer_name: str
    remarks: Optional[str] = "Acknowledged and reviewed term performance."
"""

if target in content:
    content = content.replace(target, replacement)
elif target.replace("\n", "\r\n") in content:
    content = content.replace(target.replace("\n", "\r\n"), replacement.replace("\n", "\r\n"))
else:
    print("Target not found in schemas.py!")

with open("backend/app/schemas/schemas.py", "w", encoding="utf-8") as f:
    f.write(content)

print("schemas.py updated successfully.")
