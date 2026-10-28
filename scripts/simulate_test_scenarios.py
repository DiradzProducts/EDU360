import sys
import os
import argparse
import asyncio
import datetime

# Ensure backend directory is in python path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(base_dir, "backend")
sys.path.insert(0, backend_dir)

from app.core.database import AsyncSessionLocal, engine, Base
from app.seed import seed_data
from app.models.models import (
    TriageAlert, AdminTask, FeeDefaulter, Student, AttendanceRecord, Notification
)
from sqlalchemy import select, update

async def reset_database():
    print("🔄 Resetting database and repopulating baseline data...")
    await seed_data()
    print("✅ Baseline database repopulated successfully!")

async def inject_absence_spike():
    print("🚨 Injecting Scenario 1: Extreme Absenteeism Spike (20+ Students Absent)...")
    async with AsyncSessionLocal() as db:
        # 1. Update or create Triage Alert for 20+ Absences
        res = await db.execute(select(TriageAlert).where(TriageAlert.category == "attendance"))
        alert = res.scalars().first()
        if alert:
            alert.level = "red"
            alert.title = "CRITICAL SPIKE: 24 Students Absent Today (Class 8 & 9)"
            alert.description = "Urgent health/welfare notice: 24 students missed online morning sessions today. 7 students on 3+ day consecutive absence streak."
            alert.count_affected = 24
            alert.resolved = False
        else:
            alert = TriageAlert(
                level="red",
                category="attendance",
                title="CRITICAL SPIKE: 24 Students Absent Today (Class 8 & 9)",
                description="Urgent health/welfare notice: 24 students missed online morning sessions today. 7 students on 3+ day consecutive absence streak.",
                count_affected=24,
                action_label="Assign Class Teachers to Emergency Welfare Calls",
                action_endpoint="/api/admin/triage/1/act",
                resolved=False
            )
            db.add(alert)

        # 2. Add an Urgent Admin Task for the Class Teacher
        task = AdminTask(
            title="EMERGENCY WELFARE: 24 Students Absent Streak Check (Class 8-B & 8-A)",
            description="Attendance engine detected abnormal absence surge. Conduct telephonic checks with parents before 02:00 PM today.",
            category="urgent",
            domain="academic",
            due_date="Today, 2:00 PM",
            assigned_to="Mrs. Ananya Verma",
            assigned_to_role="teacher",
            created_by_name="EDU360 Attendance Engine",
            created_by_role="system",
            status="Pending",
            priority="Critical",
            sla_hours=4,
            is_auto_generated=True,
            trigger_event="absence_streak"
        )
        db.add(task)
        await db.commit()
    print("✅ Scenario 1 Injected: Check Super Admin (/admin) to see the RED card with 24 affected students!")

async def inject_extreme_fee_overdue():
    print("💳 Injecting Scenario 2: 3 to 4 Months (90–120+ Days) Extreme Fee Arrears...")
    async with AsyncSessionLocal() as db:
        # Ingest 3-4 months overdue defaulters
        defaulters = [
            FeeDefaulter(
                student_name="Karan Malhotra",
                class_name="Class 8-B",
                roll_no="07",
                parent_name="Mr. Rajesh Malhotra",
                parent_phone="+91 98111 88801",
                milestone_title="Term 1 Tuition & Registration Fee (4 Months Overdue)",
                amount_due=45000.0,
                days_overdue=124, # > 4 months
                reminder_sent=True,
                reminder_count=4,
                is_admission_fee=False,
                exam_clearance=False, # Blocked from hall ticket
                status="Critical Overdue",
                notes="4th SMS & email warning dispatched. Family requested financial hardship review."
            ),
            FeeDefaulter(
                student_name="Simran Kaur",
                class_name="Class 9-A",
                roll_no="19",
                parent_name="Mr. Gurpreet Singh",
                parent_phone="+91 98111 88802",
                milestone_title="One-Time Admission & Term 1 Installment (3.5 Months Overdue)",
                amount_due=62000.0,
                days_overdue=105, # > 3.5 months
                reminder_sent=True,
                reminder_count=3,
                is_admission_fee=True, # Unpaid admission fee!
                exam_clearance=False, # Blocked from hall ticket
                status="Critical Overdue",
                notes="Admission fee pending since July. Father promised post-dated cheque."
            ),
            FeeDefaulter(
                student_name="Arjun Nambiar",
                class_name="Class 8-A",
                roll_no="22",
                parent_name="Dr. Suresh Nambiar",
                parent_phone="+91 98111 88803",
                milestone_title="Term 1 Tuition Balance (90 Days Overdue)",
                amount_due=38500.0,
                days_overdue=92, # exactly 3 months
                reminder_sent=True,
                reminder_count=3,
                is_admission_fee=False,
                exam_clearance=False,
                status="Critical Overdue",
                notes="3 Months overdue aging. Hall ticket locked."
            )
        ]
        db.add_all(defaulters)

        # Update fee alert on Admin Dashboard
        res = await db.execute(select(TriageAlert).where(TriageAlert.category == "fees"))
        fee_alert = res.scalars().first()
        if fee_alert:
            fee_alert.level = "orange"
            fee_alert.title = "High Fee Arrears: ₹6,95,000 Overdue (33 Accounts)"
            fee_alert.description = "3 accounts exceed 90+ to 120+ days overdue (over 3-4 months). Term 1 examination hall tickets locked."
            fee_alert.count_affected = 33
            fee_alert.resolved = False

        await db.commit()
    print("✅ Scenario 2 Injected: Check Accounts (/accounts_coordinator) Arrears Aging (30+ Days) to see 90d and 124d accounts!")

async def inject_task_sla_escalation():
    print("⏱️ Injecting Scenario 3: Task SLA Breach & Principal Escalation...")
    async with AsyncSessionLocal() as db:
        task = AdminTask(
            title="CRITICAL SLA BREACH: Term 1 Grade Verification Past 48-Hour Statutory Limit",
            description="Grade moderation dossier for Class 9 Science remained pending past the 48-hour deadline. Coordinator escalated to Principal for direct executive order.",
            category="urgent",
            domain="exam",
            due_date="EXPIRED (0h Remaining)",
            assigned_to="Dr. Hemanth Sen",
            assigned_to_role="exam_coordinator",
            created_by_name="Academic Governance Engine",
            created_by_role="system",
            status="escalated_to_principal",
            priority="Critical",
            sla_hours=0,
            is_escalated=True,
            escalation_reason="Statutory CBSE grading upload closing today. Department lead unreachable."
        )
        db.add(task)
        await db.commit()
    print("✅ Scenario 3 Injected: Check Admin (/admin) Tasks Cockpit to see the 'Escalated to Principal' banner!")

async def main():
    parser = argparse.ArgumentParser(description="EDU360 Testing & Scenario Simulation Engine")
    parser.add_argument("--reset", action="store_true", help="Clean reset and repopulate baseline seed data")
    parser.add_argument("--absences", action="store_true", help="Inject 20+ students absence spike & RED triage alert")
    parser.add_argument("--fees", action="store_true", help="Inject 3 to 4 months (90-120+ days) fee defaulters & hall ticket locks")
    parser.add_argument("--escalations", action="store_true", help="Inject expired SLA task escalated to Principal")
    parser.add_argument("--all", action="store_true", help="Reset database and inject all extreme scenarios together")

    args = parser.parse_args()

    if not any([args.reset, args.absences, args.fees, args.escalations, args.all]):
        print("Usage: python scripts/simulate_test_scenarios.py [--reset | --absences | --fees | --escalations | --all]")
        return

    if args.reset or args.all:
        await reset_database()

    if args.absences or args.all:
        await inject_absence_spike()

    if args.fees or args.all:
        await inject_extreme_fee_overdue()

    if args.escalations or args.all:
        await inject_task_sla_escalation()

    print("\n🎉 Simulation complete! Refresh your browser to verify the changes in the portal.")

if __name__ == "__main__":
    asyncio.run(main())
