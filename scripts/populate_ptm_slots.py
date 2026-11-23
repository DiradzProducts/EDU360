import asyncio
import json
import datetime
import asyncpg

SLOTS = [
    {
        "id": "slot-01",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "09:00 AM",
        "end_time": "09:10 AM",
        "status": "BOOKED",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": 1,
        "booked_student_name": "Aarav Sharma",
        "booked_class": "8-B",
        "booked_parent_id": "rajesh_sharma",
        "booked_parent_name": "Mr. Rajesh Sharma",
        "subject_name": "Mathematics & Class 8-B Homeroom",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-aarav-8b",
        "focus_table_agenda": [
            "Review Mid-Term Exam (52%) Q7 & Q9 Sign Errors",
            "Worksheet #4 Backlog Evidence (#EVD-BKLOG-884)",
            "Day 3 Rough Notebook Parent Sign-off Inspection"
        ]
    },
    {
        "id": "slot-02",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "raman",
        "start_time": "09:12 AM",
        "end_time": "09:22 AM",
        "status": "BOOKED",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": 1,
        "booked_student_name": "Aarav Sharma",
        "booked_class": "8-B",
        "booked_parent_id": "rajesh_sharma",
        "booked_parent_name": "Mr. Rajesh Sharma",
        "subject_name": "Physics (Dr. K. Raman)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-aarav-physics",
        "focus_table_agenda": [
            "Optics Ray Tracing Lab Backlog (#EVD-BKLOG-902)",
            "Mid-Term Q3 Concave Mirror Focal Point Reflection Error"
        ]
    },
    {
        "id": "slot-03",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "09:24 AM",
        "end_time": "09:34 AM",
        "status": "BOOKED",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": 2,
        "booked_student_name": "Kabir Mehta",
        "booked_class": "8-B",
        "booked_parent_id": "rekha_mehta",
        "booked_parent_name": "Mrs. Rekha Mehta",
        "subject_name": "Mathematics",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-kabir-math",
        "focus_table_agenda": [
            "Review Exam Score 48% (Flagged Q3, Q5, Q8)",
            "Linear Inequalities Backlog (#EVD-BKLOG-715)",
            "Negative Division Sign Inversion Rule"
        ]
    },
    {
        "id": "slot-04",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "09:36 AM",
        "end_time": "09:56 AM",
        "status": "BOOKED",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": 1,
        "booked_student_name": "Aarav Sharma",
        "booked_class": "8-B",
        "booked_parent_id": "rajesh_sharma",
        "booked_parent_name": "Mr. Rajesh Sharma",
        "subject_name": "Class 8-B Homeroom & Junior Sibling Consultation",
        "is_sibling_combo": True,
        "sibling_student_id": 8,
        "sibling_student_name": "Aarav Kumar (Class 3-A Junior)",
        "meeting_url": "https://meet.google.com/edu-sharma-sibling-ptm",
        "focus_table_agenda": [
            "Aarav's 1-Week Remedial Pacing & Zero-period Support",
            "Aarav Junior's Phonics Reading Booster & Magic Chest Stars"
        ]
    },
    {
        "id": "slot-05",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "sen",
        "start_time": "10:00 AM",
        "end_time": "10:10 AM",
        "status": "BOOKED",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": 2,
        "booked_student_name": "Kabir Mehta",
        "booked_class": "8-B",
        "booked_parent_id": "rekha_mehta",
        "booked_parent_name": "Mrs. Rekha Mehta",
        "subject_name": "Chemistry (Mrs. S. Sen)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-kabir-chem",
        "focus_table_agenda": [
            "Redox Equations Balancing Practice Backlog (#EVD-BKLOG-716)",
            "Stoichiometric Balancing Deficit"
        ]
    },
    {
        "id": "slot-05b",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "sunitha",
        "start_time": "10:12 AM",
        "end_time": "10:22 AM",
        "status": "BOOKED",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": 4,
        "booked_student_name": "Siddharth Verma",
        "booked_class": "8-A",
        "booked_parent_id": "alok_verma",
        "booked_parent_name": "Mr. Alok Verma",
        "subject_name": "English Literature (Mrs. Sunitha Rao)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-siddharth-english",
        "focus_table_agenda": [
            "The Merchant of Venice Essay Backlog (#EVD-BKLOG-821)",
            "Act IV Scene 1 Textual Citations"
        ]
    },
    {
        "id": "slot-05c",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "10:24 AM",
        "end_time": "10:34 AM",
        "status": "AVAILABLE",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Mathematics & Class 8-B Homeroom",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-05c",
        "focus_table_agenda": []
    },
    {
        "id": "slot-05d",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "raman",
        "start_time": "10:36 AM",
        "end_time": "10:46 AM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Science & Physics (Dr. K. Raman)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-05d",
        "focus_table_agenda": []
    },
    {
        "id": "slot-05e",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "sunitha",
        "start_time": "10:48 AM",
        "end_time": "10:58 AM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Mathematics (Mrs. Sunitha Rao)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-05e",
        "focus_table_agenda": []
    },
    {
        "id": "slot-break-tea",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "11:00 AM",
        "end_time": "11:15 AM",
        "status": "BREAK",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Faculty Morning Tea Break",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": None,
        "focus_table_agenda": []
    },
    {
        "id": "slot-06",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "11:20 AM",
        "end_time": "11:30 AM",
        "status": "AVAILABLE",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Mathematics & Class 8-B Homeroom",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-06",
        "focus_table_agenda": []
    },
    {
        "id": "slot-06b",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "sen",
        "start_time": "11:32 AM",
        "end_time": "11:42 AM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Chemistry (Mrs. S. Sen)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-06b",
        "focus_table_agenda": []
    },
    {
        "id": "slot-06c",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "11:44 AM",
        "end_time": "11:54 AM",
        "status": "AVAILABLE",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Mathematics & Class 8-B Homeroom",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-06c",
        "focus_table_agenda": []
    },
    {
        "id": "slot-06d",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "raman",
        "start_time": "12:00 PM",
        "end_time": "12:10 PM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Science & Physics (Dr. K. Raman)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-06d",
        "focus_table_agenda": []
    },
    {
        "id": "slot-06e",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "rajesh_nair",
        "start_time": "12:12 PM",
        "end_time": "12:22 PM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Social Studies & History (Mr. Rajesh Nair)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-06e",
        "focus_table_agenda": []
    },
    {
        "id": "slot-06f",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "12:24 PM",
        "end_time": "12:34 PM",
        "status": "BOOKED",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": 5,
        "booked_student_name": "Diya Patel",
        "booked_class": "8-B",
        "booked_parent_id": "suresh_patel",
        "booked_parent_name": "Mr. Suresh Patel",
        "subject_name": "Mathematics",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-diya-math",
        "focus_table_agenda": [
            "Quadratic Equations Factorization Deficit",
            "Speed-Distance Word Problem Modeling"
        ]
    },
    {
        "id": "slot-break-lunch",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "01:00 PM",
        "end_time": "01:45 PM",
        "status": "BREAK",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Faculty Lunch Break",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": None,
        "focus_table_agenda": []
    },
    {
        "id": "slot-07",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "02:00 PM",
        "end_time": "02:10 PM",
        "status": "AVAILABLE",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Mathematics",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-07",
        "focus_table_agenda": []
    },
    {
        "id": "slot-07b",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "raman",
        "start_time": "02:12 PM",
        "end_time": "02:22 PM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Science & Physics (Dr. K. Raman)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-07b",
        "focus_table_agenda": []
    },
    {
        "id": "slot-07c",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "sen",
        "start_time": "02:24 PM",
        "end_time": "02:34 PM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Chemistry (Mrs. S. Sen)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-07c",
        "focus_table_agenda": []
    },
    {
        "id": "slot-07d",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "sunitha",
        "start_time": "02:36 PM",
        "end_time": "02:46 PM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Senior Mathematics (Mrs. Sunitha Rao)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-07d",
        "focus_table_agenda": []
    },
    {
        "id": "slot-08",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "02:48 PM",
        "end_time": "02:58 PM",
        "status": "AVAILABLE",
        "interaction_scope": "HOMEROOM_CLASS",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Mathematics & Class 8-B Homeroom",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-08",
        "focus_table_agenda": []
    },
    {
        "id": "slot-09",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "ananya",
        "start_time": "03:00 PM",
        "end_time": "03:10 PM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "Mathematics",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-09",
        "focus_table_agenda": []
    },
    {
        "id": "slot-10",
        "event_id": "ptm-conf-2026-term1",
        "teacher_id": "deepa",
        "start_time": "03:12 PM",
        "end_time": "03:22 PM",
        "status": "AVAILABLE",
        "interaction_scope": "SUBJECT_SPECIFIC",
        "booked_student_id": None,
        "booked_student_name": None,
        "booked_class": None,
        "booked_parent_id": None,
        "booked_parent_name": None,
        "subject_name": "English Literature (Ms. Deepa Menon)",
        "is_sibling_combo": False,
        "sibling_student_id": None,
        "sibling_student_name": None,
        "meeting_url": "https://meet.google.com/edu-ptm-slot-10",
        "focus_table_agenda": []
    }
]

async def populate():
    print("Connecting to PostgreSQL...")
    conn = await asyncpg.connect("postgresql://postgres:123456789@localhost:5432/edu360")
    print("Connected.")

    # 1. Clear old ptm_slots
    await conn.execute("DELETE FROM ptm_slots;")
    print("Cleared existing ptm_slots.")

    # 2. Insert new slots
    insert_sql = """
        INSERT INTO ptm_slots (
            id, event_id, teacher_id, start_time, end_time, status,
            interaction_scope, booked_student_id, booked_student_name,
            booked_class, booked_parent_id, booked_parent_name,
            subject_name, is_sibling_combo, sibling_student_id,
            sibling_student_name, meeting_url, focus_table_agenda
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        );
    """
    for s in SLOTS:
        await conn.execute(
            insert_sql,
            s["id"],
            s["event_id"],
            s["teacher_id"],
            s["start_time"],
            s["end_time"],
            s["status"],
            s["interaction_scope"],
            s["booked_student_id"],
            s["booked_student_name"],
            s["booked_class"],
            s["booked_parent_id"],
            s["booked_parent_name"],
            s["subject_name"],
            s["is_sibling_combo"],
            s["sibling_student_id"],
            s["sibling_student_name"],
            s["meeting_url"],
            json.dumps(s["focus_table_agenda"])
        )
    print(f"Successfully inserted {len(SLOTS)} PTM slots.")

    # 3. Seed initial PTM notifications for Mrs. Ananya Verma and Dr. Raman
    notif_sql = """
        INSERT INTO notifications (
            recipient_user_id, recipient_role, sender_name, sender_role,
            title, message, notification_type, priority, is_read, action_url,
            created_at, metadata_json
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
        );
    """
    now = datetime.datetime.utcnow()
    await conn.execute(
        notif_sql,
        2,
        "teacher",
        "Mr. Rajesh Sharma",
        "parent",
        "PTM Slot Booked: Aarav Sharma (Class 8-B)",
        "Mr. Rajesh Sharma has booked PTM Slot 09:00 AM - 09:10 AM on 24 Oct for Aarav Sharma. Agenda: Review Mid-Term Exam (52%) Q7 & Q9 Sign Errors, Worksheet #4 Backlog Evidence.",
        "PTM_SLOT_BOOKED",
        "URGENT",
        False,
        "/teacher?tab=parent_hub",
        now - datetime.timedelta(minutes=15),
        json.dumps({"slot_id": "slot-01", "student_name": "Aarav Sharma", "class": "8-B"})
    )
    await conn.execute(
        notif_sql,
        12,
        "teacher",
        "Mr. Rajesh Sharma",
        "parent",
        "PTM Slot Booked: Aarav Sharma (Class 8-B)",
        "Mr. Rajesh Sharma has booked PTM Slot 09:12 AM - 09:22 AM on 24 Oct for Aarav Sharma. Agenda: Optics Ray Tracing Lab Backlog (#EVD-BKLOG-902).",
        "PTM_SLOT_BOOKED",
        "URGENT",
        False,
        "/teacher?tab=parent_hub",
        now - datetime.timedelta(minutes=10),
        json.dumps({"slot_id": "slot-02", "student_name": "Aarav Sharma", "class": "8-B"})
    )
    print("Seeded initial PTM notifications for Teacher Portal.")

    # 4. Summary counts
    slot_count = await conn.fetchval("SELECT count(*) FROM ptm_slots;")
    avail_count = await conn.fetchval("SELECT count(*) FROM ptm_slots WHERE status = 'AVAILABLE';")
    booked_count = await conn.fetchval("SELECT count(*) FROM ptm_slots WHERE status = 'BOOKED';")
    break_count = await conn.fetchval("SELECT count(*) FROM ptm_slots WHERE status = 'BREAK';")
    print(f"Total Slots: {slot_count} (Available: {avail_count}, Booked: {booked_count}, Breaks: {break_count})")

    await conn.close()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(populate())
