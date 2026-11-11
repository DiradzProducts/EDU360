dossier_code = '''

class DossierVerdictRequest(BaseModel):
    verdict: str  # APPROVED, PENALIZED, DISQUALIFIED
    penalty_marks: Optional[float] = 0.0
    notes: Optional[str] = None
    evaluator_name: Optional[str] = "Mrs. Ananya Verma"

@router.get("/candidates/{candidate_id}/dossier")
async def get_candidate_proctor_dossier(
    candidate_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the comprehensive post-exam proctoring audit dossier, credibility index,
    and chronological telemetry timeline for academic verification.
    """
    from app.models.models import ExamCandidateAttempt, ProctorAuditEvent
    res = await db.execute(select(ExamCandidateAttempt).where(ExamCandidateAttempt.id == candidate_id))
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate attempt not found")

    events_res = await db.execute(
        select(ProctorAuditEvent)
        .where(ProctorAuditEvent.candidate_id == candidate_id)
        .order_by(ProctorAuditEvent.logged_at.asc())
    )
    audit_events = events_res.scalars().all()

    credibility_index = max(5.0, round(100.0 - (cand.suspicion_score or 0.0), 1))
    
    if credibility_index >= 80.0 and cand.strikes == 0:
        trust_tier = "HIGH_TRUST"
        trust_label = "Clean Integrity (Verified)"
    elif credibility_index >= 60.0 and cand.strikes <= 1:
        trust_tier = "MEDIUM_TRUST"
        trust_label = "Moderate Caution (Review Flukes)"
    else:
        trust_tier = "SUSPICIOUS"
        trust_label = "High Malpractice Risk (Audit Mandated)"

    return {
        "success": True,
        "candidate": {
            "id": cand.id,
            "studentId": cand.student_id,
            "name": cand.student_name,
            "rollNo": cand.roll_no,
            "grade": cand.class_name,
            "section": cand.section,
            "subject": cand.subject,
            "avatar": cand.avatar or "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
            "status": cand.status,
            "examMode": cand.exam_mode,
            "suspicionScore": cand.suspicion_score,
            "credibilityIndex": credibility_index,
            "trustTier": trust_tier,
            "trustLabel": trust_label,
            "strikes": cand.strikes,
            "tabSwitches": cand.tab_switches,
            "anomalyType": cand.anomaly_type,
            "isPaused": cand.is_paused,
            "isDisqualified": cand.is_disqualified,
            "submissionContent": cand.submission_content,
            "evaluatedMarks": cand.evaluated_marks,
            "evaluatorRemarks": cand.evaluator_remarks,
            "submittedAt": cand.submitted_at.isoformat() if cand.submitted_at else None
        },
        "metrics": {
            "totalInfractions": len(audit_events),
            "strikesAssigned": cand.strikes,
            "tabSwitchCount": cand.tab_switches,
            "primaryAnomaly": cand.anomaly_type or "Clean Session"
        },
        "auditTimeline": [
            {
                "id": ev.id,
                "eventType": ev.event_type,
                "confidence": ev.confidence,
                "strikeAssigned": ev.strike_assigned,
                "suspicionIncrement": ev.suspicion_increment,
                "notes": ev.invigilator_notes,
                "loggedAt": ev.logged_at.isoformat() if ev.logged_at else None
            }
            for ev in audit_events
        ]
    }

@router.post("/candidates/{candidate_id}/dossier-verdict")
async def submit_candidate_dossier_verdict(
    candidate_id: int,
    req: DossierVerdictRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Teacher or Exam Coordinator signs off on the proctoring audit dossier:
    - APPROVED: Clears suspicions, marks verified
    - PENALIZED: Applies mark deduction penalty for minor infractions
    - DISQUALIFIED: Formal cancellation of paper for confirmed cheating
    """
    from app.models.models import ExamCandidateAttempt, ProctorAuditEvent, TriageAlert
    res = await db.execute(select(ExamCandidateAttempt).where(ExamCandidateAttempt.id == candidate_id))
    cand = res.scalars().first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    verdict_upper = req.verdict.upper()
    audit_notes = req.notes or f"Audit verdict {verdict_upper} logged by {req.evaluator_name}"

    if verdict_upper == "APPROVED":
        cand.status = "verified"
        cand.evaluator_remarks = f"Proctoring Audit Approved: {audit_notes}"
    elif verdict_upper == "PENALIZED":
        cand.status = "penalized"
        penalty = req.penalty_marks or 5.0
        current_marks = cand.evaluated_marks if cand.evaluated_marks is not None else 50.0
        cand.evaluated_marks = max(0.0, current_marks - penalty)
        cand.evaluator_remarks = f"Proctoring Penalty (-{penalty} marks): {audit_notes}"
    elif verdict_upper == "DISQUALIFIED":
        cand.status = "disqualified"
        cand.is_disqualified = True
        cand.evaluated_marks = 0.0
        cand.evaluator_remarks = f"Paper Cancelled due to Malpractice: {audit_notes}"
        alert = TriageAlert(
            title=f"Malpractice Verdict Signed: {cand.student_name}",
            description=f"Teacher finalized disqualification after dossier audit review. Reason: {audit_notes}",
            severity="CRITICAL",
            category="ACADEMIC",
            is_actionable=True,
            action_label="View Malpractice Dossier",
            status="active"
        )
        db.add(alert)
    else:
        raise HTTPException(status_code=400, detail=f"Invalid verdict: {req.verdict}")

    verdict_event = ProctorAuditEvent(
        candidate_id=cand.id,
        candidate_name=cand.student_name,
        roll_no=cand.roll_no,
        room_id=cand.livekit_room_id or "VIRTUAL-EXAM-HALL-A",
        event_type=f"VERDICT_{verdict_upper}",
        strike_assigned=verdict_upper == "DISQUALIFIED",
        invigilator_notes=f"Verdict [{verdict_upper}] confirmed by {req.evaluator_name}. Notes: {audit_notes}"
    )
    db.add(verdict_event)

    await db.commit()
    await db.refresh(cand)

    return {
        "success": True,
        "verdict": verdict_upper,
        "message": f"Dossier verdict [{verdict_upper}] finalized for {cand.student_name}.",
        "candidate": {
            "id": cand.id,
            "status": cand.status,
            "evaluatedMarks": cand.evaluated_marks,
            "evaluatorRemarks": cand.evaluator_remarks
        }
    }
'''

with open('backend/app/routers/exams.py', 'r', encoding='utf-8') as f:
    orig = f.read()

if 'get_candidate_proctor_dossier' not in orig:
    with open('backend/app/routers/exams.py', 'w', encoding='utf-8') as f:
        f.write(orig + dossier_code.replace('\n', '\r\n'))
    print("Successfully appended dossier endpoints to exams.py")
else:
    print("Dossier endpoints already present in exams.py")
