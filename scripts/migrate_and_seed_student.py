import sys
import os
import asyncio
import json

sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import AsyncSessionLocal, engine, Base
from sqlalchemy import text

async def migrate_and_seed():
    print("=" * 60)
    print("MIGRATING & SEEDING STUDENT WORKFLOWS (POSTGRESQL)")
    print("=" * 60)

    async with engine.begin() as conn:
        print("1. Creating missing tables from Base metadata...")
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Tables verified.")

        print("2. Altering tables with missing columns...")
        await conn.execute(text("ALTER TABLE students ADD COLUMN IF NOT EXISTS secondary_details TEXT;"))
        await conn.execute(text("ALTER TABLE exam_candidate_attempts ADD COLUMN IF NOT EXISTS verification_seal_hash VARCHAR(128);"))
        print("✓ Columns verified.")

    async with AsyncSessionLocal() as session:
        # Seed Aarav Sharma (student id 1) secondary_details if empty
        res = await session.execute(text("SELECT id, name, secondary_details FROM students WHERE id = 1;"))
        student = res.fetchone()
        if student:
            current_sec = student[2]
            if not current_sec:
                initial_details = {
                    "secondary_guardian_name": "Mrs. Priya Sharma",
                    "secondary_phone": "+91 98450 99881",
                    "secondary_email": "priya.sharma@consulting.com",
                    "preferred_language": "English / Hindi",
                    "hobbies": "Competitive Robotics, Football (Midfield), Astronomy",
                    "aspirational_career": "Aerospace & AI Robotics Engineer",
                    "dietary_preference": "Vegetarian",
                    "emergency_notes": "Allergic to penicillin. Campus doctor clearance certified."
                }
                await session.execute(
                    text("UPDATE students SET secondary_details = :details WHERE id = 1;"),
                    {"details": json.dumps(initial_details)}
                )
                await session.commit()
                print("✓ Seeded secondary_details for Student Aarav Sharma (id: 1).")
            else:
                print("✓ Student id 1 already has secondary_details.")

        # Check events table and seed sample events if needed
        res_events = await session.execute(text("SELECT COUNT(*) FROM events;"))
        count_events = res_events.scalar()
        print(f"Total events in database: {count_events}")
        if count_events == 0:
            events_data = [
                ("Annual Science & AI Exhibition", "2026-11-28", "Main Auditorium", "Annual campus exhibition showcasing student IoT and Robotics innovations. Open to all students.", "Upcoming"),
                ("Inter-School Football Championship", "2026-12-05", "Campus Sports Ground", "Quarter-final match against DPS Bangalore. Student volunteers required.", "Upcoming"),
                ("CBSE National Robotics Hackathon", "2026-12-14", "STEM Innovation Lab", "State-level coding & robotics sprint for Secondary students.", "Upcoming"),
                ("Winter Break / Annual Holiday", "2026-12-24", "Campus Wide", "School closes for winter vacation through Jan 2, 2027.", "Upcoming"),
            ]
            for title, dt, loc, desc, status in events_data:
                await session.execute(
                    text("""
                        INSERT INTO events (title, date, location, description, status)
                        VALUES (:title, :date, :location, :description, :status);
                    """),
                    {"title": title, "date": dt, "location": loc, "description": desc, "status": status}
                )
            await session.commit()
            print("✓ Seeded 4 default school events.")

        # Check student_portfolios for student_id = 1
        res_port = await session.execute(text("SELECT COUNT(*) FROM student_portfolios WHERE student_id = 1;"))
        count_port = res_port.scalar()
        print(f"Total portfolios for student 1: {count_port}")
        if count_port == 0:
            sample_portfolios = [
                (1, "participation", "Western Choir Lead Tenor", "Annual Day 2026", "Oct 2026", "/samples/certificate_preview.png", True, "Selected as lead vocalist for Western choral ensemble performance before the Governing Body."),
                (1, "participation", "4x100m Relay Anchor", "Annual Athletics Meet 2026", "Sep 2026", "/samples/certificate_preview.png", True, "Anchored the Class 8-B relay squad to an inter-house Silver medal."),
                (1, "achievement", "National Science Olympiad (NSO)", "SOF Olympiad 2026", "Aug 2026", "/samples/certificate_preview.png", True, "Secured All-India Rank 48, State Rank 4 with distinction gold certificate in Physics and Astronomy."),
                (1, "achievement", "CBSE Regional AI & Robotics Hackathon", "CBSE Innovation Cell", "Oct 2026", "/samples/certificate_preview.png", False, "Runner-up award for computer vision autonomous obstacle navigation rover prototype.")
            ]
            for sid, cat, title, evt, dt, proof, ver, desc in sample_portfolios:
                await session.execute(
                    text("""
                        INSERT INTO student_portfolios (student_id, category, title, event_name, date, proof_url, verified_by_school, description)
                        VALUES (:sid, :cat, :title, :evt, :dt, :proof, :ver, :desc);
                    """),
                    {"sid": sid, "cat": cat, "title": title, "evt": evt, "dt": dt, "proof": proof, "ver": ver, "desc": desc}
                )
            await session.commit()
            print("✓ Seeded 4 portfolio records for Aarav Sharma.")

        # Ensure ExamCandidateAttempt has verification_seal_hash set if completed
        await session.execute(text("""
            UPDATE exam_candidate_attempts 
            SET verification_seal_hash = 'SEAL-8B-7F3A-4D91' 
            WHERE verification_seal_hash IS NULL AND status = 'completed';
        """))
        await session.commit()
        print("✓ Updated verification_seal_hash on completed candidate attempts.")

    print("=" * 60)
    print("MIGRATION & SEEDING COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(migrate_and_seed())
