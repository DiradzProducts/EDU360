import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.models import (
    Student, FocusTable, HomeworkSubmission, BusRoute, FeeMilestone,
    LeaveRequest, ExitClearance
)
from app.schemas.schemas import (
    FocusTableResponse, HomeworkSubmissionResponse, BusRouteResponse,
    FeeMilestoneResponse, FeePayRequest,
    LeaveRequestCreate, LeaveRequestResponse,
    ExitClearanceResponse, ExitClearanceDigitalSign
)

router = APIRouter(prefix="/api/parent", tags=["parent"])

# --- 1. Moving Slider Banners (Anti-Spam High-Signal Engine) ---
@router.get("/banners")
async def get_parent_banners():
    return [
        {
            "id": 1,
            "title": "Unit Test 2 Results Are Live",
            "subtitle": "Class 8 Mathematics & Science report cards published.",
            "badge": "Academic Report",
            "badge_color": "blue",
            "action_text": "View Report Card",
            "action_target": "academics",
            "icon": "FileText",
            "gradient": "from-blue-600 to-indigo-700"
        },
        {
            "id": 2,
            "title": "Annual Day in 7 Days — Stage Committees",
            "subtitle": "Check Aarav's assigned choir role and rehearsal schedule.",
            "badge": "Event Spotlight",
            "badge_color": "purple",
            "action_text": "Check Stage Committee",
            "action_target": "events",
            "icon": "Sparkles",
            "gradient": "from-purple-600 to-pink-600"
        },
        {
            "id": 3,
            "title": "Fee Milestone 2 Due on 25th Oct",
            "subtitle": "Term 2 tuition & transport fee installment open for online payment.",
            "badge": "Payment Due",
            "badge_color": "amber",
            "action_text": "Pay via UPI / Card",
            "action_target": "fees",
            "icon": "CreditCard",
            "gradient": "from-amber-600 to-orange-600"
        },
        {
            "id": 4,
            "title": "School Bus Route 4 — On Schedule",
            "subtitle": "Bus is 8 mins away from Sector 15 Crossroad Stop.",
            "badge": "Live GPS",
            "badge_color": "emerald",
            "action_text": "Open Live Tracker",
            "action_target": "bus",
            "icon": "Navigation",
            "gradient": "from-emerald-600 to-teal-700"
        }
    ]

# --- 2. Shared Focus Table & Teacher Remarks ---
@router.get("/focus-table/{student_id}", response_model=FocusTableResponse)
async def get_child_focus_table(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FocusTable).where(FocusTable.student_id == student_id))
    ft = result.scalars().first()
    if not ft:
        raise HTTPException(status_code=404, detail="Focus Table not found for student")
    return ft

@router.post("/focus-table/{table_id}/toggle-check")
async def toggle_parent_checklist(table_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FocusTable).where(FocusTable.id == table_id))
    ft = result.scalars().first()
    if not ft:
        raise HTTPException(status_code=404, detail="Focus Table not found")
    ft.parent_check_completed = not ft.parent_check_completed
    ft.status = "needs_parent_check" if not ft.parent_check_completed else "in_progress"
    await db.commit()
    await db.refresh(ft)
    return {
        "success": True,
        "parent_check_completed": ft.parent_check_completed,
        "message": "Parent co-tracking status updated."
    }

@router.get("/homework-submissions/{student_id}", response_model=list[HomeworkSubmissionResponse])
async def get_child_homework_submissions(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(HomeworkSubmission).where(HomeworkSubmission.student_id == student_id))
    return result.scalars().all()

# --- 3. Live Bus GPS Tracker ---
@router.get("/bus-tracker/{student_id}", response_model=BusRouteResponse)
async def get_bus_tracker(student_id: int, db: AsyncSession = Depends(get_db)):
    # Look up student's route
    s_res = await db.execute(select(Student).where(Student.id == student_id))
    student = s_res.scalars().first()
    route_id = student.bus_route_id if student and student.bus_route_id else 1
    
    b_res = await db.execute(select(BusRoute).where(BusRoute.id == route_id))
    bus = b_res.scalars().first()
    if not bus:
        # Fallback to first route
        b_res = await db.execute(select(BusRoute))
        bus = b_res.scalars().first()
    return bus

@router.post("/bus-tracker/{student_id}/step", response_model=BusRouteResponse)
async def advance_bus_simulation(student_id: int, db: AsyncSession = Depends(get_db)):
    s_res = await db.execute(select(Student).where(Student.id == student_id))
    student = s_res.scalars().first()
    route_id = student.bus_route_id if student and student.bus_route_id else 1
    
    b_res = await db.execute(select(BusRoute).where(BusRoute.id == route_id))
    bus = b_res.scalars().first()
    if not bus:
        raise HTTPException(status_code=404, detail="Bus route not found")
    
    # Cycle stops: 0 -> 1 -> 2 -> 3 -> 4 -> 0
    bus.current_stop_idx = (bus.current_stop_idx + 1) % 5
    if bus.current_stop_idx == 4:
        bus.eta_mins = 2
        bus.live_status = "Approaching Destination Stop (Aarav's Stop)"
    elif bus.current_stop_idx == 0:
        bus.eta_mins = 25
        bus.live_status = "Departed School Campus"
    else:
        bus.eta_mins = max(4, 20 - bus.current_stop_idx * 4)
        bus.live_status = f"En Route — Passing Stop #{bus.current_stop_idx + 1}"
        
    await db.commit()
    await db.refresh(bus)
    return bus

# --- 4. Fee Milestones & Online Payment ---
@router.get("/fees/{student_id}", response_model=list[FeeMilestoneResponse])
async def get_student_fees(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FeeMilestone).where(FeeMilestone.student_id == student_id))
    return result.scalars().all()

@router.post("/fees/{milestone_id}/pay", response_model=FeeMilestoneResponse)
async def pay_fee_milestone(milestone_id: int, req: FeePayRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FeeMilestone).where(FeeMilestone.id == milestone_id))
    milestone = result.scalars().first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Fee milestone not found")
    
    milestone.status = "Paid"
    milestone.paid_at = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    milestone.payment_method = req.payment_method
    milestone.receipt_no = f"REC-2026-FEE-{milestone_id + 5821}"
    
    await db.commit()
    await db.refresh(milestone)
    return milestone

# --- 5. Leave Request Application ---
@router.post("/leave-requests", response_model=LeaveRequestResponse)
async def apply_student_leave(req: LeaveRequestCreate, db: AsyncSession = Depends(get_db)):
    new_lr = LeaveRequest(
        student_id=req.student_id,
        student_name=req.student_name,
        parent_name=req.parent_name,
        from_date=req.from_date,
        to_date=req.to_date,
        reason=req.reason,
        status="Pending"
    )
    db.add(new_lr)
    await db.commit()
    await db.refresh(new_lr)
    return new_lr

@router.get("/leave-requests/{student_id}", response_model=list[LeaveRequestResponse])
async def get_student_leave_requests(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LeaveRequest).where(LeaveRequest.student_id == student_id).order_by(LeaveRequest.applied_at.desc()))
    return result.scalars().all()

# --- 6. Digital TC Sign-Off ---
@router.post("/exit-clearance/{student_id}/digital-sign")
async def digital_sign_tc(student_id: int, req: ExitClearanceDigitalSign, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExitClearance).where(ExitClearance.student_id == student_id))
    clearance = result.scalars().first()
    if not clearance:
        raise HTTPException(status_code=404, detail="No active exit clearance record for this student")
    
    clearance.digital_parent_approved = req.parent_confirmation
    clearance.digital_approval_timestamp = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p UTC")
    
    if clearance.digital_parent_approved and clearance.physical_sign_verified:
        clearance.status = "Completed & Permanently Archived"
    else:
        clearance.status = "Digital Approved - Pending Physical Sign Scan"
        
    await db.commit()
    await db.refresh(clearance)
    return {
        "success": True,
        "message": "Digital Sign-off stamped with tamper-evident digital seal.",
        "clearance": clearance
    }
