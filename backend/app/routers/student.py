import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.models import (
    LiveClass, ClassRecording, Homework, HomeworkSubmission,
    StudentPortfolio, OfficialDocument, Student, BusRoute,
    StudentGamification, DailyQuest, MagicBoosterChest,
    BacklogEvent, FocusTable
)
from app.schemas.schemas import (
    LiveClassResponse, ClassRecordingResponse,
    HomeworkResponse, HomeworkSubmissionResponse, HomeworkCreate,
    StudentPortfolioResponse, StudentPortfolioCreate,
    OfficialDocumentResponse,
    GamificationProfileResponse, DailyQuestResponse,
    DailyQuestCompleteRequest, DailyQuestCompleteResponse,
    MagicBoosterChestResponse, ChestUnlockRequest, ChestUnlockResponse,
    CelebrationPayload, SoundToggleRequest, AdventureTimetableItem,
    JuniorBusRadarResponse, BusCoords, JuniorDashboardOverviewResponse,
    BacklogEventResponse, AcademicComplianceResponse
)
from app.services.backlog_engine import BacklogEngine, parse_deadline_datetime

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
async def list_student_homework(
    task_type: Optional[str] = None,
    status: Optional[str] = None,
    date: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Homework)
    if task_type:
        stmt = stmt.where(Homework.task_type == task_type)
    if status:
        stmt = stmt.where(Homework.status == status)
    if date:
        stmt = stmt.where(Homework.due_date == date)
    stmt = stmt.order_by(Homework.id.desc())
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/homework", response_model=HomeworkResponse)
async def create_student_homework(req: HomeworkCreate, db: AsyncSession = Depends(get_db)):
    new_hw = Homework(
        title=req.title,
        subject=req.subject,
        class_name=req.class_name,
        description=req.description,
        task_type=req.task_type,
        due_date=req.due_date,
        due_time=req.due_time,
        status="PENDING",
        assigned_date=datetime.date.today().isoformat(),
        teacher_id=req.teacher_id,
        teacher_name=req.teacher_name,
        max_marks=req.max_marks,
        resource_url=req.resource_url,
        weightage=req.weightage,
        progress_pct=req.progress_pct or 0.0
    )
    db.add(new_hw)
    await db.commit()
    await db.refresh(new_hw)
    return new_hw

@router.get("/submissions/{student_id}", response_model=list[HomeworkSubmissionResponse])
async def get_student_submissions(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomeworkSubmission).where(HomeworkSubmission.student_id == student_id))
    return result.scalars().all()

@router.post("/homework/{homework_id}/submit", response_model=HomeworkSubmissionResponse)
async def submit_homework(
    homework_id: int,
    student_id: int,
    original_file_url: str = "/samples/math_worksheet.png",
    db: AsyncSession = Depends(get_db)
):
    hw_res = await db.execute(select(Homework).where(Homework.id == homework_id))
    hw = hw_res.scalars().first()

    current_time = datetime.datetime(2026, 10, 17, 21, 57, 0)
    is_late = False
    if hw:
        deadline = parse_deadline_datetime(hw.due_date, hw.due_time)
        if deadline and current_time > deadline:
            is_late = True

    result = await db.execute(select(HomeworkSubmission).where(
        HomeworkSubmission.homework_id == homework_id,
        HomeworkSubmission.student_id == student_id
    ))
    existing = result.scalars().first()
    if existing:
        existing.original_file_url = original_file_url
        existing.status = "submitted"
        existing.submitted_at = current_time
        existing.late_submission = is_late
        existing.is_backlog = False
        target_sub = existing
    else:
        st_res = await db.execute(select(Student).where(Student.id == student_id))
        st = st_res.scalars().first()
        student_name = st.name if st else "Student"

        new_sub = HomeworkSubmission(
            homework_id=homework_id,
            student_id=student_id,
            student_name=student_name,
            original_file_url=original_file_url,
            status="submitted",
            submitted_at=current_time,
            late_submission=is_late,
            is_backlog=False
        )
        db.add(new_sub)
        target_sub = new_sub

    # If this task was in BacklogEvent, update status to LATE_SUBMITTED (retaining audit history)
    ev_res = await db.execute(select(BacklogEvent).where(
        BacklogEvent.homework_id == homework_id,
        BacklogEvent.student_id == student_id
    ))
    ev = ev_res.scalars().first()
    if ev:
        ev.status = "LATE_SUBMITTED"
        ev.resolved_at = current_time
        ev.late_submission = True
        ev.notes = f"Late submission uploaded on {current_time.strftime('%d %b %Y, %I:%M %p')}. Retained in backlog history for parent/teacher review."

    await db.commit()
    await db.refresh(target_sub)

    try:
        await BacklogEngine.evaluate_backlogs(db)
    except Exception as e:
        print(f"Compliance refresh info: {e}")

    return target_sub

@router.get("/compliance/{student_id}", response_model=AcademicComplianceResponse)
async def get_student_academic_compliance(student_id: int, db: AsyncSession = Depends(get_db)):
    return await BacklogEngine.get_compliance_dossier(db, student_id)

@router.get("/backlog-events/{student_id}", response_model=list[BacklogEventResponse])
async def get_student_backlog_events(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BacklogEvent).where(BacklogEvent.student_id == student_id).order_by(BacklogEvent.id.desc()))
    return result.scalars().all()

@router.post("/check-backlogs")
async def run_manual_backlog_check(db: AsyncSession = Depends(get_db)):
    return await BacklogEngine.evaluate_backlogs(db)

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


# --- 5. K-5 Junior Gamification Engine Endpoints ---

LEVEL_TITLES = {
    1: "Junior Explorer",
    2: "Curious Adventurer",
    3: "Star Voyager",
    4: "Galaxy Champion",
    5: "Legendary Explorer"
}

@router.get("/{student_id}/gamification/overview", response_model=JuniorDashboardOverviewResponse)
async def get_student_gamification_overview(student_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch full Junior Explorer dashboard state: Profile, Streak, Quests, Magic Chests."""
    # 1. Fetch Student
    s_res = await db.execute(select(Student).where(Student.id == student_id))
    student = s_res.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # 2. Fetch or create Gamification record
    g_res = await db.execute(select(StudentGamification).where(StudentGamification.student_id == student_id))
    gamification = g_res.scalars().first()
    if not gamification:
        gamification = StudentGamification(
            student_id=student.id,
            level=1,
            level_title="Junior Explorer",
            xp_points=50,
            total_stars=20,
            attendance_streak_days=1,
            sound_effects_enabled=True
        )
        db.add(gamification)
        await db.commit()
        await db.refresh(gamification)

    # 3. Fetch Daily Quests
    q_res = await db.execute(
        select(DailyQuest).where(DailyQuest.student_id == student_id).order_by(DailyQuest.id.asc())
    )
    quests = q_res.scalars().all()

    # 4. Fetch Magic Booster Chests
    c_res = await db.execute(
        select(MagicBoosterChest).where(MagicBoosterChest.student_id == student_id).order_by(MagicBoosterChest.day_number.asc())
    )
    chests = c_res.scalars().all()

    return JuniorDashboardOverviewResponse(
        student_id=student.id,
        student_name=student.name,
        class_name=student.class_name,
        grade_tier=student.grade_tier or "k5",
        avatar_character_url=student.avatar_character_url or "https://api.dicebear.com/7.x/bottts/svg?seed=JuniorAarav",
        profile=gamification,
        active_quests=quests,
        magic_booster_chests=chests,
        attendance_streak_days=gamification.attendance_streak_days,
        attendance_pct=student.attendance_pct,
        bus_route_id=student.bus_route_id
    )


@router.post("/{student_id}/gamification/chests/{chest_id}/unlock", response_model=ChestUnlockResponse)
async def unlock_magic_booster_chest(student_id: int, chest_id: int, req: ChestUnlockRequest = None, db: AsyncSession = Depends(get_db)):
    """Unlock and claim rewards for a Magic Booster 4-Day Focus Table chest."""
    c_res = await db.execute(
        select(MagicBoosterChest).where(
            MagicBoosterChest.id == chest_id,
            MagicBoosterChest.student_id == student_id
        )
    )
    chest = c_res.scalars().first()
    if not chest:
        raise HTTPException(status_code=404, detail="Magic chest not found for this student")

    if chest.status == "completed_claimed":
        raise HTTPException(status_code=400, detail="This chest has already been claimed! Check back on your next quest.")

    if chest.status == "locked":
        raise HTTPException(status_code=400, detail="This chest is currently locked. Complete earlier days to unlock!")

    # Transition chest to completed_claimed
    chest.status = "completed_claimed"
    awarded_stars = chest.chest_stars or 30
    awarded_xp = 50

    # Update Student Gamification
    g_res = await db.execute(select(StudentGamification).where(StudentGamification.student_id == student_id))
    gamification = g_res.scalars().first()
    if not gamification:
        gamification = StudentGamification(
            student_id=student_id,
            level=1,
            level_title="Junior Explorer",
            xp_points=0,
            total_stars=0,
            attendance_streak_days=1,
            sound_effects_enabled=True
        )
        db.add(gamification)

    gamification.total_stars += awarded_stars
    gamification.xp_points += awarded_xp

    # Check for level up progression (every 150 XP increases level)
    level_up = False
    new_level = max(1, (gamification.xp_points // 150) + 1)
    if new_level > gamification.level:
        gamification.level = new_level
        gamification.level_title = LEVEL_TITLES.get(new_level, f"Star Voyager Level {new_level}")
        level_up = True

    # Automatically unlock the next day's chest if present and currently locked
    next_day = chest.day_number + 1
    next_chest_res = await db.execute(
        select(MagicBoosterChest).where(
            MagicBoosterChest.student_id == student_id,
            MagicBoosterChest.day_number == next_day
        )
    )
    next_chest = next_chest_res.scalars().first()
    if next_chest and next_chest.status == "locked":
        next_chest.status = "ready_to_open"

    await db.commit()
    await db.refresh(chest)
    await db.refresh(gamification)

    return ChestUnlockResponse(
        success=True,
        message=f"Hooray! Day {chest.day_number} chest opened! You collected {awarded_stars} Stars and {awarded_xp} XP! ⭐",
        chest_id=chest.id,
        status=chest.status,
        awarded_stars=awarded_stars,
        awarded_xp=awarded_xp,
        total_stars=gamification.total_stars,
        xp_points=gamification.xp_points,
        level=gamification.level,
        level_title=gamification.level_title,
        level_up=level_up,
        celebration=CelebrationPayload(
            trigger="sparkles_and_confetti",
            badge=f"Day {chest.day_number} Focus Champion 🏆",
            sound_effect="treasure_fanfare.mp3",
            animation="golden_glow_burst",
            dialog_title="Chest Unlocked! 🎉",
            dialog_message=f"Outstanding work! +{awarded_stars} Stars and +{awarded_xp} XP added to your treasure bag!"
        )
    )


@router.post("/{student_id}/gamification/sound-toggle", response_model=GamificationProfileResponse)
async def toggle_sound_effects(student_id: int, req: SoundToggleRequest, db: AsyncSession = Depends(get_db)):
    """Toggle audio preferences / sound effects for the Junior Explorer experience."""
    g_res = await db.execute(select(StudentGamification).where(StudentGamification.student_id == student_id))
    gamification = g_res.scalars().first()
    if not gamification:
        gamification = StudentGamification(
            student_id=student_id,
            level=1,
            level_title="Junior Explorer",
            xp_points=0,
            total_stars=0,
            attendance_streak_days=1,
            sound_effects_enabled=req.sound_effects_enabled
        )
        db.add(gamification)
    else:
        gamification.sound_effects_enabled = req.sound_effects_enabled

    await db.commit()
    await db.refresh(gamification)
    return gamification


@router.get("/{student_id}/adventure-timetable", response_model=list[AdventureTimetableItem])
async def get_adventure_timetable(student_id: int, db: AsyncSession = Depends(get_db)):
    """Get visual island adventure roadmap nodes for the child's daily schedule."""
    # Return structured cartoon nodes mapped to theme islands
    schedule = [
        AdventureTimetableItem(
            id=1,
            time="08:30 AM - 09:15 AM",
            title="Alphabet Safari & Phonics Fun",
            subject="English Phonics",
            island_theme="Phonics Island",
            mascot_at_node=False,
            icon="🦁",
            duration_mins=45,
            teacher_name="Ms. Priya Rao",
            room="Safari Treehouse A",
            completed=True
        ),
        AdventureTimetableItem(
            id=2,
            time="09:30 AM - 10:15 AM",
            title="Magical Numbers & Star Shape Castle",
            subject="Mathematics",
            island_theme="Number Castle",
            mascot_at_node=True,  # Mascot is currently at this live node
            icon="🏰",
            duration_mins=45,
            teacher_name="Mrs. Ananya Verma",
            room="Number Tower 2",
            completed=False
        ),
        AdventureTimetableItem(
            id=3,
            time="10:30 AM - 11:00 AM",
            title="Fruit Feast & Jungle Juice Break",
            subject="Snack & Nutrition",
            island_theme="Snack Oasis",
            mascot_at_node=False,
            icon="🍉",
            duration_mins=30,
            teacher_name="Coach Ramesh",
            room="Oasis Garden Lawn",
            completed=False
        ),
        AdventureTimetableItem(
            id=4,
            time="11:15 AM - 12:00 PM",
            title="Rainbow Finger Painting & Clay Animals",
            subject="Creative Arts",
            island_theme="Art Treehouse",
            mascot_at_node=False,
            icon="🎨",
            duration_mins=45,
            teacher_name="Ms. Neha Kapoor",
            room="Studio Color Splash",
            completed=False
        )
    ]
    return schedule


@router.get("/{student_id}/bus-radar", response_model=JuniorBusRadarResponse)
async def get_junior_bus_radar(student_id: int, db: AsyncSession = Depends(get_db)):
    """Live cartoon bus tracking state, stops away, ETA, and Uncle Ramesh's contact."""
    # Look up student's assigned bus route if available
    s_res = await db.execute(select(Student).where(Student.id == student_id))
    student = s_res.scalars().first()

    driver_name = "Uncle Ramesh"
    driver_phone = "+91 98450 12345"
    route_no = "Route #4"
    vehicle_no = "KA-01-EB-4412"
    eta_mins = 3
    stops_away = 2

    if student and student.bus_route_id:
        b_res = await db.execute(select(BusRoute).where(BusRoute.id == student.bus_route_id))
        bus = b_res.scalars().first()
        if bus:
            route_no = bus.route_number if "#" in bus.route_number else f"Route #{bus.route_number.replace('Route', '').strip()}"
            driver_name = bus.driver_name if "Uncle" in bus.driver_name else f"Uncle {bus.driver_name.split()[0]}"
            driver_phone = bus.driver_phone
            vehicle_no = bus.vehicle_no
            eta_mins = min(bus.eta_mins, 5) if bus.eta_mins else 3

    return JuniorBusRadarResponse(
        route_no=route_no,
        driver_name=driver_name,
        driver_phone=driver_phone,
        eta_mins=eta_mins,
        stops_away=stops_away,
        current_coords=BusCoords(lat=12.9352, lng=77.6944),
        is_moving=True,
        vehicle_no=vehicle_no,
        current_stop_name="Bellandur EcoSpace Gate 2",
        next_stop_name="Sector 15 Crossroad (Child's Stop)",
        bus_mascot_icon="🚌✨",
        status_badge="On Safe Track"
    )


@router.post("/{student_id}/gamification/quests/{quest_id}/complete", response_model=DailyQuestCompleteResponse)
async def complete_daily_quest(student_id: int, quest_id: int, req: DailyQuestCompleteRequest = None, db: AsyncSession = Depends(get_db)):
    """Complete a daily homework quest and credit stars and XP to the student."""
    q_res = await db.execute(select(DailyQuest).where(DailyQuest.id == quest_id, DailyQuest.student_id == student_id))
    quest = q_res.scalars().first()
    if not quest:
        raise HTTPException(status_code=404, detail="Daily quest not found")

    if quest.status == "completed":
        raise HTTPException(status_code=400, detail="Quest already completed!")

    quest.status = "completed"
    if req and req.proof_image_url:
        quest.proof_image_url = req.proof_image_url

    g_res = await db.execute(select(StudentGamification).where(StudentGamification.student_id == student_id))
    gamification = g_res.scalars().first()
    if not gamification:
        gamification = StudentGamification(
            student_id=student_id,
            level=1,
            level_title="Junior Explorer",
            xp_points=0,
            total_stars=0,
            attendance_streak_days=1,
            sound_effects_enabled=True
        )
        db.add(gamification)

    gamification.total_stars += quest.stars_reward
    gamification.xp_points += quest.xp_reward

    new_level = max(1, (gamification.xp_points // 150) + 1)
    if new_level > gamification.level:
        gamification.level = new_level
        gamification.level_title = LEVEL_TITLES.get(new_level, f"Star Voyager Level {new_level}")

    await db.commit()
    await db.refresh(quest)
    await db.refresh(gamification)

    return DailyQuestCompleteResponse(
        success=True,
        message=f"Well done! You completed '{quest.title}' and earned {quest.stars_reward} Stars & {quest.xp_reward} XP! ⭐",
        quest_id=quest.id,
        status=quest.status,
        awarded_stars=quest.stars_reward,
        awarded_xp=quest.xp_reward,
        total_stars=gamification.total_stars,
        xp_points=gamification.xp_points,
        level=gamification.level
    )
