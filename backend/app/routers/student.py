import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import (
    LiveClass, ClassRecording, Homework, HomeworkSubmission,
    StudentPortfolio, OfficialDocument
)
from app.schemas.schemas import (
    LiveClassResponse, ClassRecordingResponse,
    HomeworkResponse, HomeworkSubmissionResponse,
    StudentPortfolioResponse, StudentPortfolioCreate,
    OfficialDocumentResponse
)

router = APIRouter(prefix="/api/student", tags=["student"])

# --- 1. Live Classroom & Recordings Library ---
@router.get("/classes", response_model=list[LiveClassResponse])
async def get_student_live_classes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LiveClass).order_by(LiveClass.scheduled_time.asc()))
    return result.scalars().all()

@router.get("/recordings", response_model=list[ClassRecordingResponse])
async def list_recordings(subject: str = None, chapter: str = None, db: AsyncSession = Depends(get_db)):
    query = select(ClassRecording)
    if subject and subject != "All":
        query = query.where(ClassRecording.subject == subject)
    if chapter and chapter != "All":
        query = query.where(ClassRecording.chapter == chapter)
    result = await db.execute(query.order_by(ClassRecording.id.desc()))
    return result.scalars().all()

# --- 2. Homework & Annotations ---
@router.get("/homework", response_model=list[HomeworkResponse])
async def list_student_homework(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Homework).order_by(Homework.id.desc()))
    return result.scalars().all()

@router.get("/submissions/{student_id}", response_model=list[HomeworkSubmissionResponse])
async def get_student_submissions(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomeworkSubmission).where(HomeworkSubmission.student_id == student_id))
    return result.scalars().all()

@router.post("/homework/{homework_id}/submit", response_model=HomeworkSubmissionResponse)
async def submit_homework(homework_id: int, student_id: int, original_file_url: str = "/samples/math_worksheet.png", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomeworkSubmission).where(
        HomeworkSubmission.homework_id == homework_id,
        HomeworkSubmission.student_id == student_id
    ))
    existing = result.scalars().first()
    if existing:
        existing.original_file_url = original_file_url
        existing.status = "submitted"
        existing.submitted_at = datetime.datetime.utcnow()
        await db.commit()
        await db.refresh(existing)
        return existing
    
    new_sub = HomeworkSubmission(
        homework_id=homework_id,
        student_id=student_id,
        student_name="Aarav Sharma",
        original_file_url=original_file_url,
        status="submitted",
        submitted_at=datetime.datetime.utcnow()
    )
    db.add(new_sub)
    await db.commit()
    await db.refresh(new_sub)
    return new_sub

# --- 3. Side-by-Side Portfolio ---
@router.get("/portfolio/{student_id}", response_model=list[StudentPortfolioResponse])
async def get_student_portfolio(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StudentPortfolio).where(StudentPortfolio.student_id == student_id))
    return result.scalars().all()

@router.post("/portfolio", response_model=StudentPortfolioResponse)
async def upload_student_achievement(req: StudentPortfolioCreate, db: AsyncSession = Depends(get_db)):
    new_entry = StudentPortfolio(
        student_id=req.student_id,
        category=req.category,
        title=req.title,
        event_name=req.event_name,
        date=req.date,
        proof_url=req.proof_url or "/samples/certificate_preview.png",
        verified_by_school=False,  # Needs school verification
        description=req.description
    )
    db.add(new_entry)
    await db.commit()
    await db.refresh(new_entry)
    return new_entry

# --- 4. Official Document Vault (View-Only for Student) ---
@router.get("/documents/{student_id}", response_model=list[OfficialDocumentResponse])
async def get_student_vault_documents(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(OfficialDocument).where(OfficialDocument.student_id == student_id))
    return result.scalars().all()
