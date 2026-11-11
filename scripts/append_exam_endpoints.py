import re

code_to_append = '''

# =========================================================================
# LIVE PROCTOR COCKPIT & CBT EXAMINATION CONDUCTION API
# =========================================================================

class ProctorActionRequest(BaseModel):
    candidate_id: int
    action: str  # PAUSE, RESUME, STRIKE, EVICT, NUDGE, INTERCOM
    reason: Optional[str] = None
    invigilator_id: Optional[int] = 2
    invigilator_name: Optional[str] = "Mrs. Ananya Verma"

class ProctorTelemetryRequest(BaseModel):
    candidate_id: int
    anomaly_type: str  # PHONE_DETECTED, MULTIPLE_FACES, ABSENCE, OFF_SCREEN_GAZE, AUDIO_ANOMALY, TAB_SWITCH
    confidence: Optional[float] = 0.90
    details: Optional[str] = None

class CandidateExamSubmitRequest(BaseModel):
    words_count: Optional[int] = 0
    time_spent_seconds: Optional[int] = 0
    submission_content: str
    script_pages_uploaded: Optional[int] = 0

class CandidateEvaluateRequest(BaseModel):
    evaluated_marks: float
    evaluator_remarks: Optional[str] = None
    teacher_id: Optional[int] = 2

class AuthorExamPaperRequest(BaseModel):
    title: str
    subject: str
    class_name: str
    section: Optional[str] = "B"
    exam_date: str
    start_time: Optional[str] = "09:00 AM"
    duration_minutes: Optional[int] = 60
    total_marks: Optional[float] = 100.0
    exam_mode: Optional[str] = "MODE_CBT"
    strictness_profile: Optional[str] = "STANDARD"
    question_paper_url: Optional[str] = None
    question_paper_title: Optional[str] = None
    teacher_id: Optional[int] = 2

@router.get("/candidates")
async def get_exam_candidates(
    room_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get live list of examination candidates sorted by suspicion score & proctor status.
    """
    from app.models.models import ExamCandidateAttempt
    query = select(ExamCandidateAttempt)
    if room_id:
        query = query.where(ExamCandidateAttempt.livekit_room_id == room_id)
    result = await db.execute(query.order_by(ExamCandidateAttempt.suspicion_score.desc(), ExamCandidateAttempt.strikes.desc()))
    candidates = result.scalars().all()
    
    return {
        "success": True,
        "count": len(candidates),
        "candidates": [
            {
                "id": c.id,
                "studentId": c.student_id,
                "name": c.student_name,
                "rollNo": c.roll_no,
                "grade": c.class_name,
                "section": c.section,
                "subject": c.subject,
                "avatar": c.avatar or "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
                "status": c.status,
                "examMode": c.exam_mode,
                "suspicionScore": c.suspicion_score,
                "strikes": c.strikes,
                "tabSwitches": c.tab_switches,
                "anomalyType": c.anomaly_type,
                "cameraActive": c.camera_active,
                "isPaused": c.is_paused,
                "isDisqualified": c.is_disqualified,
                "isNudged": c.is_nudged,
                "nudgeMessage": c.nudge_message,
                "timeRemainingSeconds": c.time_remaining_seconds,
                "livekitRoomId": c.livekit_room_id,
                "scriptPagesUploaded": c.script_pages_uploaded,
                "sealVerified": c.seal_verified,
                "lastAnomalyTime": c.last_anomaly_time,
                "submissionContent": c.submission_content,
                "evaluatedMarks": c.evaluated_marks,
                "evaluatorRemarks": c.evaluator_remarks,
                "submittedAt": c.submitted_at.isoformat() if c.submitted_at else None
            }
            for c in candidates
        ]
    }

@router.post("/candidates/proctor-action")
async def execute_proctor_action(
    req: ProctorActionRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Executes live invigilator control action on candidate tile:
    - PAUSE: freezes candidate canvas and timer
    - RESUME: unfreezes candidate canvas
    - STRIKE: increments strikes, updates suspicion score, logs audit event
    - EVICT: disqualifies candidate for blatant malpractice
    - NUDGE: pushes HUD alert to candidate screen
    - INTERCOM: logs 1-on-1 private voice session
    """
    from app.models.models import ExamCandidateAttempt, ProctorAuditEvent, TriageAlert
    res = await db.execute(select(ExamCandidateAttempt).where(ExamCandidateAttempt.id == req.candidate_id))
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate attempt not found")
        
    action_upper = req.action.upper()
    audit_event = ProctorAuditEvent(
        candidate_id=cand.id,
        candidate_name=cand.student_name,
        roll_no=cand.roll_no,
        room_id=cand.livekit_room_id or "VIRTUAL-EXAM-HALL-A",
        event_type=action_upper,
        invigilator_notes=req.reason or f"Action {action_upper} initiated by invigilator {req.invigilator_name}"
    )
    db.add(audit_event)

    msg = ""
    if action_upper == "PAUSE":
        cand.is_paused = True
        cand.status = "paused"
        msg = f"Examination canvas paused for {cand.student_name}. Timer locked."
    elif action_upper == "RESUME":
        cand.is_paused = False
        cand.status = "critical" if cand.strikes >= 2 else "warning" if cand.strikes == 1 else "normal"
        msg = f"Examination canvas resumed for {cand.student_name}."
    elif action_upper == "STRIKE":
        cand.strikes = min(3, cand.strikes + 1)
        cand.suspicion_score = min(100.0, cand.suspicion_score + 25.0)
        cand.status = "critical" if cand.strikes >= 2 else "warning"
        audit_event.strike_assigned = True
        audit_event.suspicion_increment = 25.0
        
        # If reached 3 strikes, auto-pause candidate
        if cand.strikes >= 3:
            cand.is_paused = True
            cand.status = "critical"
            # Dispatch urgent TriageAlert to Principal
            alert = TriageAlert(
                title=f"Critical Exam Malpractice (3 Strikes): {cand.student_name}",
                description=f"Candidate accumulated 3 strikes. Screen locked. YOLO Suspicion: {cand.suspicion_score}%. Notes: {req.reason or 'Accumulated 3 strikes'}",
                severity="CRITICAL",
                category="ACADEMIC",
                is_actionable=True,
                action_label="Review Exam Camera Feed",
                status="active"
            )
            db.add(alert)
        msg = f"Strike #{cand.strikes}/3 recorded for {cand.student_name}. Telemetry synchronized."
    elif action_upper == "EVICT":
        cand.is_disqualified = True
        cand.is_paused = True
        cand.status = "disqualified"
        alert = TriageAlert(
            title=f"Exam Disqualification (Evicted): {cand.student_name}",
            description=f"Invigilator evicted student for blatant malpractice. Reason: {req.reason or 'Malpractice confirmed'}",
            severity="CRITICAL",
            category="ACADEMIC",
            is_actionable=True,
            action_label="View Malpractice Audit Dossier",
            status="active"
        )
        db.add(alert)
        msg = f"Candidate {cand.student_name} disqualified and evicted from examination session."
    elif action_upper == "NUDGE":
        cand.is_nudged = True
        cand.nudge_message = req.reason or "Invigilator requests desk focus."
        msg = f"HUD warning nudge sent to {cand.student_name}."
    elif action_upper == "INTERCOM":
        msg = f"Private 1-on-1 audio intercom established with {cand.student_name}."
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported action: {req.action}")

    await db.commit()
    await db.refresh(cand)

    return {
        "success": True,
        "action": action_upper,
        "message": msg,
        "candidate": {
            "id": cand.id,
            "status": cand.status,
            "strikes": cand.strikes,
            "suspicionScore": cand.suspicion_score,
            "isPaused": cand.is_paused,
            "isDisqualified": cand.is_disqualified,
            "isNudged": cand.is_nudged,
            "nudgeMessage": cand.nudge_message
        }
    }

@router.post("/candidates/{candidate_id}/telemetry")
async def record_candidate_telemetry(
    candidate_id: int,
    req: ProctorTelemetryRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingests client-side Edge YOLO & Web Audio telemetry anomalies:
    - PHONE_DETECTED
    - MULTIPLE_FACES
    - ABSENCE
    - OFF_SCREEN_GAZE
    - AUDIO_ANOMALY
    - TAB_SWITCH
    """
    from app.models.models import ExamCandidateAttempt, ProctorAuditEvent, TriageAlert
    res = await db.execute(select(ExamCandidateAttempt).where(ExamCandidateAttempt.id == candidate_id))
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    strike_assigned = False
    suspicion_bump = 10.0
    
    if req.anomaly_type == "PHONE_DETECTED":
        suspicion_bump = 40.0
        strike_assigned = True
    elif req.anomaly_type == "MULTIPLE_FACES":
        suspicion_bump = 30.0
        strike_assigned = True
    elif req.anomaly_type == "TAB_SWITCH":
        cand.tab_switches += 1
        suspicion_bump = 15.0
        if cand.tab_switches >= 3:
            strike_assigned = True
    elif req.anomaly_type == "AUDIO_ANOMALY":
        suspicion_bump = 20.0
    elif req.anomaly_type == "OFF_SCREEN_GAZE":
        suspicion_bump = 12.0
    elif req.anomaly_type == "ABSENCE":
        suspicion_bump = 25.0

    cand.suspicion_score = min(100.0, cand.suspicion_score + suspicion_bump)
    cand.anomaly_type = req.anomaly_type.replace("_", " ").title()
    cand.last_anomaly_time = "Just now"

    if strike_assigned:
        cand.strikes = min(3, cand.strikes + 1)
        if cand.strikes >= 3:
            cand.is_paused = True
            cand.status = "critical"
            alert = TriageAlert(
                title=f"Automated AI Malpractice Lock: {cand.student_name}",
                description=f"Auto-triggered 3 strikes via Edge YOLO ({req.anomaly_type}). Suspicion: {cand.suspicion_score}%. Exam paused.",
                severity="CRITICAL",
                category="ACADEMIC",
                is_actionable=True,
                action_label="Review Live Feed",
                status="active"
            )
            db.add(alert)
        else:
            cand.status = "critical" if cand.strikes >= 2 else "warning"

    audit = ProctorAuditEvent(
        candidate_id=cand.id,
        candidate_name=cand.student_name,
        roll_no=cand.roll_no,
        room_id=cand.livekit_room_id or "VIRTUAL-EXAM-HALL-A",
        event_type=req.anomaly_type,
        confidence=req.confidence or 0.90,
        strike_assigned=strike_assigned,
        suspicion_increment=suspicion_bump,
        invigilator_notes=req.details or f"Edge YOLO detected {req.anomaly_type} (confidence={req.confidence})"
    )
    db.add(audit)
    await db.commit()
    await db.refresh(cand)

    return {
        "success": True,
        "anomaly": req.anomaly_type,
        "strikes": cand.strikes,
        "suspicionScore": cand.suspicion_score,
        "isPaused": cand.is_paused,
        "strikeAssigned": strike_assigned
    }

@router.post("/candidates/{candidate_id}/submit")
async def submit_candidate_cbt(
    candidate_id: int,
    req: CandidateExamSubmitRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Submits online CBT essay/response or uploaded script.
    """
    from app.models.models import ExamCandidateAttempt
    res = await db.execute(select(ExamCandidateAttempt).where(ExamCandidateAttempt.id == candidate_id))
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    cand.submission_content = req.submission_content
    cand.status = "completed"
    cand.submitted_at = datetime.datetime.utcnow()
    if req.script_pages_uploaded and req.script_pages_uploaded > 0:
        cand.script_pages_uploaded = req.script_pages_uploaded
        cand.seal_verified = True

    await db.commit()
    await db.refresh(cand)

    return {
        "success": True,
        "message": f"Examination successfully submitted and sealed for {cand.student_name}.",
        "candidate_id": cand.id,
        "submitted_at": cand.submitted_at.isoformat()
    }

@router.post("/candidates/{candidate_id}/evaluate")
async def evaluate_candidate_submission(
    candidate_id: int,
    req: CandidateEvaluateRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    SpeedGrader dual-pane marks evaluation & teacher remarks entry.
    """
    from app.models.models import ExamCandidateAttempt
    res = await db.execute(select(ExamCandidateAttempt).where(ExamCandidateAttempt.id == candidate_id))
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    cand.evaluated_marks = req.evaluated_marks
    cand.evaluator_remarks = req.evaluator_remarks
    await db.commit()
    await db.refresh(cand)

    return {
        "success": True,
        "message": f"Submission graded: {req.evaluated_marks} marks recorded for {cand.student_name}.",
        "evaluated_marks": cand.evaluated_marks,
        "evaluator_remarks": cand.evaluator_remarks
    }

@router.post("/author/upload-paper")
async def author_and_schedule_exam(
    req: AuthorExamPaperRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Teacher schedules an exam and attaches question paper PDF or CBT blueprint.
    """
    from app.models.models import Exam, ExamSchedule, QuestionPaper
    
    # 1. Create or link Question Paper
    qp = QuestionPaper(
        title=req.question_paper_title or f"{req.subject} Question Paper: {req.title}",
        subject=req.subject,
        class_name=req.class_name,
        section=req.section or "All",
        blueprint_json=json.dumps({
            "total_marks": req.total_marks or 100.0,
            "duration_minutes": req.duration_minutes or 60,
            "exam_mode": req.exam_mode or "MODE_CBT",
            "strictness": req.strictness_profile or "STANDARD"
        }),
        draft_file_url=req.question_paper_url or "/papers/sample_question_paper.pdf",
        draft_file_name=f"{req.subject.lower()}_{req.class_name.lower().replace(' ', '_')}.pdf",
        status="approved",
        created_by_teacher_id=req.teacher_id or 2,
        created_by_teacher_name="Mrs. Ananya Verma"
    )
    db.add(qp)
    await db.flush()

    # 2. Create Master Exam
    exam = Exam(
        title=req.title,
        subject=req.subject,
        class_name=req.class_name,
        section=req.section or "B",
        exam_type="mcq" if req.exam_mode == "MODE_CBT" else "descriptive",
        exam_mode=req.exam_mode or "MODE_CBT",
        duration_minutes=req.duration_minutes or 60,
        question_paper_url=req.question_paper_url or "/papers/sample_question_paper.pdf",
        strictness_profile=req.strictness_profile or "STANDARD",
        total_marks=req.total_marks or 100.0,
        exam_date=req.exam_date,
        is_published=True,
        published_at=datetime.datetime.utcnow()
    )
    db.add(exam)
    await db.flush()

    # 3. Create Exam Schedule
    sched = ExamSchedule(
        exam_id=exam.id,
        title=req.title,
        subject=req.subject,
        class_name=req.class_name,
        exam_date=req.exam_date,
        start_time=req.start_time or "09:00 AM",
        end_time="11:00 AM",
        hall_name="Virtual Room Alpha (Camera AI)",
        capacity=40,
        chief_invigilator_name="Mrs. Ananya Verma",
        question_paper_id=qp.id,
        question_paper_title=qp.title,
        status="Scheduled",
        academic_clearance=True
    )
    db.add(sched)
    await db.commit()
    await db.refresh(exam)
    await db.refresh(sched)

    return {
        "success": True,
        "message": f"Exam '{req.title}' successfully scheduled for {req.class_name} with mode {req.exam_mode}.",
        "exam_id": exam.id,
        "schedule_id": sched.id,
        "question_paper_id": qp.id
    }
'''

with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    orig = f.read()

# Avoid duplicate append if already present
if 'execute_proctor_action' not in orig:
    with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
        f.write(orig + code_to_append.replace('\n', '\r\n'))
    print("Successfully appended live proctor & conduction endpoints to backend/app/routers/exams.py")
else:
    print("Endpoints already present in backend/app/routers/exams.py")
