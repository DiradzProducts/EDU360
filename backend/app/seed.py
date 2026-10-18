import asyncio
import json
import datetime
from app.core.database import engine, Base, AsyncSessionLocal
from app.models.models import (
    User, Student, OfficialDocument, TriageAlert, AdminTask, AdmissionEnquiry,
    Event, EventStaffAssignment, VendorEquipment, ExitClearance,
    LiveClass, AttendanceRecord, Homework, HomeworkSubmission,
    FocusTable, LeaveRequest, FeeMilestone, BusRoute,
    StudentPortfolio, ClassRecording, InventoryItem, StaffMember,
    StudentGamification, DailyQuest, MagicBoosterChest, BacklogEvent
)

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Users
        users = [
            User(id=1, name="Dr. Sunita Kapoor", email="principal@edu360.internal", role="admin", avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", phone="+91 98111 00001"),
            User(id=2, name="Mrs. Ananya Verma", email="ananya.verma@edu360.internal", role="teacher", avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", phone="+91 98111 00002"),
            User(id=3, name="Mr. Rajesh Sharma", email="rajesh.sharma@example.com", role="parent", avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", phone="+91 98111 00003"),
            User(id=4, name="Aarav Sharma", email="aarav.sharma@student.edu360.internal", role="student", avatar="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", phone="+91 98111 00004"),
            User(id=5, name="Aarav Kumar", email="aarav.junior@student.edu360.internal", role="student", avatar="https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150", phone="+91 98111 00005"),
        ]
        db.add_all(users)

        # 2. Students
        students = [
            Student(id=1, user_id=4, name="Aarav Sharma", roll_no="14", class_name="Class 8", section="B", admission_no="EDU-2024-082", guardian_name="Mr. Rajesh Sharma", guardian_phone="+91 98111 00003", guardian_email="rajesh.sharma@example.com", attendance_pct=91.4, bus_route_id=1, academic_average_pct=76.8, status="Active", grade_tier="secondary", age=14),
            Student(id=2, user_id=None, name="Diya Patel", roll_no="18", class_name="Class 8", section="B", admission_no="EDU-2024-083", guardian_name="Mrs. Sunita Patel", guardian_phone="+91 98222 11111", guardian_email="sunita.patel@example.com", attendance_pct=96.0, bus_route_id=1, academic_average_pct=92.5, status="Active", grade_tier="secondary", age=14),
            Student(id=3, user_id=None, name="Rohan Iyer", roll_no="22", class_name="Class 8", section="B", admission_no="EDU-2024-084", guardian_name="Mr. S. Iyer", guardian_phone="+91 98333 22222", guardian_email="s.iyer@example.com", attendance_pct=88.2, bus_route_id=1, academic_average_pct=81.0, status="Active", grade_tier="secondary", age=14),
            Student(id=4, user_id=None, name="Ananya Gupta", roll_no="04", class_name="Class 8", section="B", admission_no="EDU-2024-085", guardian_name="Mr. P. Gupta", guardian_phone="+91 98444 33333", guardian_email="p.gupta@example.com", attendance_pct=94.5, bus_route_id=1, academic_average_pct=89.0, status="Active", grade_tier="secondary", age=14),
            Student(id=5, user_id=None, name="Kabir Mehta", roll_no="15", class_name="Class 8", section="B", admission_no="EDU-2024-086", guardian_name="Mrs. R. Mehta", guardian_phone="+91 98555 44444", guardian_email="r.mehta@example.com", attendance_pct=72.0, bus_route_id=1, academic_average_pct=64.2, status="Active", grade_tier="secondary", age=13),
            Student(id=6, user_id=5, name="Aarav Kumar", roll_no="08", class_name="Class 3-A", section="A", admission_no="EDU-2025-032", guardian_name="Mr. Rajesh Sharma", guardian_phone="+91 98111 00003", guardian_email="rajesh.sharma@example.com", attendance_pct=94.2, bus_route_id=1, academic_average_pct=88.5, status="Active", grade_tier="k5", age=8, avatar_character_url="https://api.dicebear.com/7.x/bottts/svg?seed=AaravJunior3D"),
        ]
        db.add_all(students)

        # 3. Official Documents (SIS Document Vault - Strict Admin edit control)
        docs = [
            OfficialDocument(id=1, student_id=1, title="Bonafide Certificate 2025-26", doc_type="Bonafide", file_url="/documents/bonafide_aarav_sharma.pdf", is_official=True, uploaded_by_role="admin", status="Verified", verified_stamp="EDU360 Official Seal - Reg #9921"),
            OfficialDocument(id=2, student_id=1, title="Term 1 Consolidated Marks Memo", doc_type="Marks Card", file_url="/documents/term1_marks_aarav_sharma.pdf", is_official=True, uploaded_by_role="admin", status="Verified", verified_stamp="EDU360 Examination Controller"),
            OfficialDocument(id=3, student_id=1, title="Municipal Birth Certificate Copy", doc_type="Birth Certificate", file_url="/documents/birth_cert_aarav.pdf", is_official=True, uploaded_by_role="admin", status="Verified", verified_stamp="Verified by Registrar"),
        ]
        db.add_all(docs)

        # 4. Triage Alerts (🔴/🟠/🟢 Priority Triage Engine)
        alerts = [
            TriageAlert(
                id=1,
                level="red",
                category="attendance",
                title="Chronic Absenteeism: 20 Students Absent Today",
                description="5 students (including Kabir Mehta, Roll #15) have been absent for 3+ consecutive days without parent leave applications.",
                count_affected=5,
                action_label="Assign Class Teacher to Call Parents",
                action_endpoint="/api/admin/triage/1/act",
                resolved=False,
                resolution_note=None
            ),
            TriageAlert(
                id=2,
                level="red",
                category="academics",
                title="Academic Drop: Class 8B Maths Average Down by 18%",
                description="Unit Test 2 quadratic equations results show significant dip in Class 8B. 12 students scored below 60%.",
                count_affected=12,
                action_label="Schedule Review with Maths Teacher & Deploy Focus Table",
                action_endpoint="/api/admin/triage/2/act",
                resolved=False,
                resolution_note=None
            ),
            TriageAlert(
                id=3,
                level="orange",
                category="fees",
                title="Pending Milestone 2: 30 Students Overdue",
                description="Fee Milestone 2 was due on 10th Oct. ₹5,55,000 pending collection across Class 8 and Class 9.",
                count_affected=30,
                action_label="Trigger Targeted Push Reminders & Tele-Caller Call List",
                action_endpoint="/api/admin/triage/3/act",
                resolved=False,
                resolution_note=None
            ),
            TriageAlert(
                id=4,
                level="orange",
                category="operations",
                title="Telemetry Delay: 2 School Buses (Route 4 & Route 7)",
                description="Bus Route 4 GPS ping delayed by 12 mins near Outer Ring Road flyover.",
                count_affected=2,
                action_label="Ping Transport Supervisor & Driver Ramesh",
                action_endpoint="/api/admin/triage/4/act",
                resolved=False,
                resolution_note=None
            ),
            TriageAlert(
                id=5,
                level="green",
                category="tasks",
                title="Board Exam Registration Data Verification",
                description="Class 10 CBSE LOC student photographs and subject combinations need final digital sign-off before 5:00 PM.",
                count_affected=45,
                action_label="Complete LOC Verification",
                action_endpoint="/api/admin/triage/5/act",
                resolved=False,
                resolution_note=None
            ),
        ]
        db.add_all(alerts)

        # 5. Admin Tasks
        tasks = [
            AdminTask(id=1, title="Submit Class 10 Board Exam LOC to CBSE Portal", category="urgent", due_date="Today, 5:00 PM", assigned_to="Academic Coordinator", status="In Progress", priority="High"),
            AdminTask(id=2, title="Inspect Stage Audio & LED Wall Setup for Annual Day", category="urgent", due_date="Today, 6:30 PM", assigned_to="Estate Manager", status="Pending", priority="High"),
            AdminTask(id=3, title="Audit Term 2 Fee Defaulters & Dispatch SMS Digest", category="upcoming", due_date="Tomorrow, 11:00 AM", assigned_to="Accounts Office", status="Pending", priority="Medium"),
            AdminTask(id=4, title="Review 8 New Admission Enquiries from AI Chatbot", category="upcoming", due_date="15 Oct, 2:00 PM", assigned_to="Admissions Head", status="Pending", priority="Medium"),
        ]
        db.add_all(tasks)

        # 6. Admission Enquiries (CRM with AI Chat Transcript)
        chat_sample_1 = json.dumps([
            {"sender": "parent", "text": "Hi, does EDU360 follow the CBSE curriculum for Class 8?", "time": "10:14 AM"},
            {"sender": "bot", "text": "Hello! Yes, our institution is fully affiliated with CBSE (New Delhi). We integrate experiential STEM labs and outcome-based Focus Tables.", "time": "10:14 AM"},
            {"sender": "parent", "text": "What is the fee range for Grade 8, and is bus transport available to Whitefield?", "time": "10:15 AM"},
            {"sender": "bot", "text": "Annual tuition is structured in 3 milestones totaling approx ₹65,000. Route 4 specifically covers Whitefield with live GPS tracking! Would you like me to book a campus tour?", "time": "10:15 AM"},
            {"sender": "parent", "text": "Yes please! Tomorrow around 11:30 AM would be great for my son Siddharth.", "time": "10:16 AM"},
            {"sender": "bot", "text": "Booked! I have notified our Admissions Counselor. See you tomorrow at 11:30 AM!", "time": "10:16 AM"}
        ])

        enquiries = [
            AdmissionEnquiry(id=1, student_name="Siddharth Rao", parent_name="Mrs. Meera Rao", email="meera.rao@example.com", phone="+91 98450 99881", target_grade="Class 8", stage="visit", chat_transcript=chat_sample_1, notes="Campus tour scheduled tomorrow 11:30 AM. Highly interested in STEM lab."),
            AdmissionEnquiry(id=2, student_name="Tanvi Deshmukh", parent_name="Dr. Amit Deshmukh", email="amit.d@example.com", phone="+91 98450 99882", target_grade="Class 6", stage="followup", chat_transcript=None, notes="Needs fee milestone installment breakdown via email."),
            AdmissionEnquiry(id=3, student_name="Aditya Roy", parent_name="Mrs. Neha Roy", email="neha.roy@example.com", phone="+91 98450 99883", target_grade="Class 9", stage="new", chat_transcript=None, notes="Inquired about sports facilities and robotics club."),
        ]
        db.add_all(enquiries)

        # 7. Events (Annual Day 2026)
        event = Event(
            id=1,
            title="Annual Day 2026: Navarasa (Rhythms of Tomorrow)",
            date="24 Oct 2026 • 5:30 PM",
            location="Main Auditorium & Open Air Amphitheatre",
            description="Our flagship cultural showcase featuring 400+ student performers, orchestra, and robotics exhibition.",
            banner_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
            status="Active Preparation"
        )
        db.add(event)

        assignments = [
            EventStaffAssignment(id=1, event_id=1, staff_id=2, staff_name="Mrs. Ananya Verma", committee_role="Stage Coordination & Western Choir Head", student_volunteers=json.dumps(["Aarav Sharma", "Diya Patel", "Rohan Iyer"])),
            EventStaffAssignment(id=2, event_id=1, staff_id=5, staff_name="Mr. Vikram Joshi", committee_role="Campus Discipline & VIP Ushering", student_volunteers=json.dumps(["Kabir Mehta", "Vivaan Sen", "Aditya Sharma"])),
            EventStaffAssignment(id=3, event_id=1, staff_id=6, staff_name="Ms. Priya Sen", committee_role="Costume Design & Green Room Management", student_volunteers=json.dumps(["Ananya Gupta", "Pooja Hegde"])),
        ]
        db.add_all(assignments)

        equipments = [
            VendorEquipment(id=1, event_id=1, equipment_name="Digital P3.9 LED Backdrop Wall (40 x 20 ft)", vendor_name="Horizon AV Tech Solutions", vendor_phone="+91 98765 43210", status="Delivered", handover_timestamp="22 Oct 2026, 09:30 AM", notes="Assembled on main stage. Tested HDMI & SDI inputs."),
            VendorEquipment(id=2, event_id=1, equipment_name="Concert Line-Array Sound System + 8 Wireless Shure Mics", vendor_name="AcousticPro Live Bangalore", vendor_phone="+91 98765 43211", status="Delivered", handover_timestamp="22 Oct 2026, 11:15 AM", notes="Sound check completed with choir."),
            VendorEquipment(id=3, event_id=1, equipment_name="600 Velvet Banquet Chairs & Water Misting Canopies", vendor_name="Royal Events & Tenting", vendor_phone="+91 98765 43212", status="Ordered", handover_timestamp="Pending Handover (23 Oct, 2:00 PM)", notes="Truck scheduled to enter Gate 2."),
        ]
        db.add_all(equipments)

        # 8. Student Exit & Dual Signature TC Clearance
        exit_clearances = [
            ExitClearance(
                id=1,
                student_id=1,  # Can be tested on Aarav or test student
                student_name="Karan Malhotra",
                class_name="Class 10A",
                fee_cleared=True,
                library_cleared=True,
                inventory_cleared=True,
                tc_ready=True,
                digital_parent_approved=True,
                digital_approval_timestamp="12 Oct 2026, 04:15 PM UTC",
                physical_scan_url="/assets/scanned_register_karan_malhotra.png",
                physical_sign_verified=True,
                status="Completed & Permanently Archived"
            ),
            ExitClearance(
                id=2,
                student_id=1,  # Live test record for Aarav's preview
                student_name="Aarav Sharma (Sample Exit Flow)",
                class_name="Class 8B",
                fee_cleared=True,
                library_cleared=True,
                inventory_cleared=True,
                tc_ready=True,
                digital_parent_approved=False,
                digital_approval_timestamp=None,
                physical_scan_url=None,
                physical_sign_verified=False,
                status="Pending Parent Digital Approval"
            )
        ]
        db.add_all(exit_clearances)

        # 9. Live Classes
        live_cls = LiveClass(
            id=1,
            title="Class 8B Mathematics: Quadratic Equations & Factorization",
            subject="Mathematics",
            class_name="Class 8B",
            teacher_id=2,
            teacher_name="Mrs. Ananya Verma",
            scheduled_time="Today, 10:00 AM",
            duration_mins=45,
            status="live",
            meet_url="https://meet.edu360.internal/room/math8b-live"
        )
        db.add(live_cls)

        # 10. Attendance Records (Auto-Attendance rule demo)
        att_records = [
            AttendanceRecord(id=1, class_id=1, student_id=1, student_name="Aarav Sharma", join_timestamp="+3.2m (10:03 AM)", minutes_late=3.2, status="Present", teacher_override=False, date=datetime.date.today().isoformat()),
            AttendanceRecord(id=2, class_id=1, student_id=2, student_name="Diya Patel", join_timestamp="+1.0m (10:01 AM)", minutes_late=1.0, status="Present", teacher_override=False, date=datetime.date.today().isoformat()),
            AttendanceRecord(id=3, class_id=1, student_id=3, student_name="Rohan Iyer", join_timestamp="+14.5m (10:14 AM)", minutes_late=14.5, status="Late", teacher_override=False, date=datetime.date.today().isoformat()),
            AttendanceRecord(id=4, class_id=1, student_id=4, student_name="Ananya Gupta", join_timestamp="+6.0m (10:06 AM)", minutes_late=6.0, status="Present", teacher_override=False, date=datetime.date.today().isoformat()),
            AttendanceRecord(id=5, class_id=1, student_id=5, student_name="Kabir Mehta", join_timestamp=None, minutes_late=0.0, status="Absent", teacher_override=False, date=datetime.date.today().isoformat()),
        ]
        db.add_all(att_records)

        # 11. Homework & Submissions (Daily Homework vs Long-term Assignments)
        homeworks_data = [
            Homework(
                id=1,
                title="Worksheet #4: Solving Quadratics by Factoring",
                subject="Mathematics",
                class_name="Class 8B",
                description="Complete Q1 to Q10 showing all intermediate calculation steps for quadratic roots. Mandatory step documentation.",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-15",
                due_time="17:00",
                status="BACKLOG",
                assigned_date="2026-10-12",
                teacher_id=2,
                teacher_name="Mrs. Ananya Verma",
                max_marks=20,
                resource_url="/samples/math_worksheet.png",
                weightage="Daily Practice (5 pts)"
            ),
            Homework(
                id=2,
                title="Constitutional Rights Comparative Analysis Case Study",
                subject="Social Science",
                class_name="Class 8B",
                description="Comparative study of Right to Equality (Articles 14-18) vs Right to Freedom (Articles 19-22) with 2 landmark Supreme Court cases.",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-13",
                due_time="16:00",
                status="SUBMITTED",
                assigned_date="2026-10-10",
                teacher_id=3,
                teacher_name="Mrs. Kalyani Murthy",
                max_marks=20,
                resource_url="/samples/civics_handout.pdf",
                weightage="Daily Practice (5 pts)"
            ),
            Homework(
                id=3,
                title="The Merchant of Venice: Portia's Mercy Speech Critical Analysis",
                subject="English Literature",
                class_name="Class 8B",
                description="Write a 300-word critical evaluation of Act IV Scene 1. Contrast Portia's argument on divine mercy against Shylock's legal bond insistence.",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-18",
                due_time="17:00",
                status="PENDING",
                assigned_date="2026-10-14",
                teacher_id=4,
                teacher_name="Mrs. Sunitha Rao",
                max_marks=15,
                resource_url="/samples/merchant_of_venice_act4.pdf",
                weightage="Weekly Essay (10 pts)"
            ),
            Homework(
                id=4,
                title="Force & Laws of Motion: Newton's Third Law Lab Sheet",
                subject="Physics",
                class_name="Class 8B",
                description="Experimental verification of action-reaction pairs using dual spring balances. Free-body diagram calculations and error margins.",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-10",
                due_time="17:00",
                status="GRADED",
                assigned_date="2026-10-06",
                teacher_id=5,
                teacher_name="Dr. K. Raman",
                max_marks=20,
                resource_url="/samples/physics_spring_lab.pdf",
                weightage="Lab Assessment (20 pts)"
            ),
            Homework(
                id=5,
                title="Chemical Reactions: Redox Equations Balancing Practice",
                subject="Chemistry",
                class_name="Class 8B",
                description="Complete balancing for 25 redox reactions, decomposition equations, and displacement reactions with stoichiometric coefficient validation.",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-17",
                due_time="18:00",
                status="PENDING",
                assigned_date="2026-10-15",
                teacher_id=6,
                teacher_name="Mrs. S. Sen",
                max_marks=20,
                resource_url="/samples/chemistry_worksheet_5.pdf",
                weightage="Daily Practice (5 pts)"
            ),
            Homework(
                id=6,
                title="Cell Division: Mitosis & Meiosis Stages Comparison Chart",
                subject="Biology",
                class_name="Class 8B",
                description="Hand-drawn structural diagrams of chromosomes during Metaphase and Anaphase with spindle fiber attachments and centriole positions.",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-19",
                due_time="17:00",
                status="PENDING",
                assigned_date="2026-10-16",
                teacher_id=7,
                teacher_name="Dr. Shalini Gupta",
                max_marks=20,
                resource_url="/samples/biology_cell_diagram.pdf",
                weightage="Daily Practice (5 pts)"
            ),
            # Long-Term Assignments & Projects
            Homework(
                id=7,
                title="Autonomous Mars Rover & Sensor Array Capstone Project",
                subject="STEM & Robotics",
                class_name="Class 8B",
                description="End-to-end hardware-software prototype with ultrasonic obstacle detection, ESP32 telemetry streaming, and a responsive web telemetry dashboard.",
                task_type="ASSIGNMENT",
                due_date="2026-10-28",
                due_time="18:00",
                status="PENDING",
                assigned_date="2026-10-01",
                teacher_id=2,
                teacher_name="Mr. Rajesh Nambiar",
                max_marks=50,
                resource_url="/samples/Mars_Rover_Capstone_Brief.pdf",
                weightage="25% of Term 1 Final Grade",
                progress_pct=65.0
            ),
            Homework(
                id=8,
                title="National History Monograph: The Indian Constitution Evolution",
                subject="Social Science",
                class_name="Class 8B",
                description="1500-word academic monograph referencing Constituent Assembly debates, B.R. Ambedkar committee drafts, and modern fundamental rights jurisprudence.",
                task_type="ASSIGNMENT",
                due_date="2026-11-05",
                due_time="23:59",
                status="PENDING",
                assigned_date="2026-10-05",
                teacher_id=3,
                teacher_name="Mrs. Kalyani Murthy",
                max_marks=40,
                resource_url="/samples/Constitution_Monograph_Guidelines.pdf",
                weightage="15% of Term 1 Final Grade",
                progress_pct=40.0
            ),
            Homework(
                id=9,
                title="Full-Stack Data Visualization Portal with Python & SQLite",
                subject="Computer Science",
                class_name="Class 8B",
                description="Develop a relational database client with normalized schemas, REST API endpoints, interactive Chart.js visualization, and unit test coverage.",
                task_type="ASSIGNMENT",
                due_date="2026-11-14",
                due_time="23:59",
                status="PENDING",
                assigned_date="2026-10-08",
                teacher_id=2,
                teacher_name="Mr. Rajesh Nambiar",
                max_marks=50,
                resource_url="/samples/CS_Portal_Project_Blueprint.zip",
                weightage="20% of Term 1 Final Grade",
                progress_pct=20.0
            )
        ]
        db.add_all(homeworks_data)

        sample_annotations = json.dumps([
            {"type": "tick", "x": 190, "y": 140, "color": "#10B981"},
            {"type": "tick", "x": 190, "y": 280, "color": "#10B981"},
            {"type": "circle", "x": 380, "y": 420, "radius": 35, "color": "#EF4444"},
            {"type": "text", "x": 430, "y": 415, "text": "Check sign in Q4: (-b ± √Δ)/(2a)", "color": "#EF4444"}
        ])

        submissions_data = [
            HomeworkSubmission(
                id=1,
                homework_id=4,
                student_id=1,
                student_name="Aarav Sharma",
                original_file_url="/samples/physics_spring_lab.pdf",
                annotated_file_url="/samples/physics_spring_lab.pdf",
                annotations_json=sample_annotations,
                marks_obtained=18.5,
                teacher_remarks="Outstanding derivation of action-reaction pairs in Q2. In Q4, double check signs when stating vector direction. Solid work overall!",
                status="graded",
                submitted_at=datetime.datetime(2026, 10, 9, 14, 20),
                graded_at=datetime.datetime(2026, 10, 11, 10, 15),
                late_submission=False,
                is_backlog=False
            ),
            HomeworkSubmission(
                id=2,
                homework_id=2,
                student_id=1,
                student_name="Aarav Sharma",
                original_file_url="/samples/civics_handout.pdf",
                annotated_file_url=None,
                annotations_json=None,
                marks_obtained=None,
                teacher_remarks=None,
                status="submitted",
                submitted_at=datetime.datetime(2026, 10, 13, 15, 45),
                late_submission=False,
                is_backlog=False
            ),
            HomeworkSubmission(
                id=3,
                homework_id=1,
                student_id=1,
                student_name="Aarav Sharma",
                original_file_url="",
                status="backlog",
                is_backlog=True,
                late_submission=False,
                submitted_at=datetime.datetime(2026, 10, 15, 17, 1)
            )
        ]
        db.add_all(submissions_data)

        # 11b. Backlog Evidence Event
        backlog_ev = BacklogEvent(
            id=1,
            student_id=1,
            homework_id=1,
            focus_table_id=1,
            evidence_code="#EVD-BKLOG-884",
            subject="Mathematics",
            title="Worksheet #4: Solving Quadratics by Factoring",
            task_type="DAILY_HOMEWORK",
            due_date="2026-10-15",
            due_time="17:00",
            status="UNRESOLVED",
            detected_at=datetime.datetime(2026, 10, 15, 17, 15),
            late_submission=False,
            teacher_name="Mrs. Ananya Verma",
            notes="Student failed to submit Textbook Exercise 4.2 before the scheduled cutoff (15 Oct 2026, 05:00 PM). The system automatically transitioned the assignment to Backlog status. Tagged as verified evidence for parent progress review."
        )
        db.add(backlog_ev)

        # 12. Focus Table (Per-Student Shared Teacher-Parent Tool)
        focus_plan_json = json.dumps({
            "days": [
                {"day": "Day 1 (Mon)", "focus": "Quadratic Standard Form & Identifying a, b, c", "exercise": "Watch 12-min concept recap and list 5 equations.", "parent_checklist": "Verified concept video completed.", "status": "Completed"},
                {"day": "Day 2 (Tue)", "focus": "Factoring by Splitting the Middle Term", "exercise": "Solve 4 standard factoring questions on page 64.", "parent_checklist": "Verified 4 solved problems in rough notebook.", "status": "Completed"},
                {"day": "Day 3 (Wed)", "focus": "Discriminant (b² - 4ac) Calculation & Signs", "exercise": "Revisit teacher corrections on Worksheet #4 and fix Q4.", "parent_checklist": "Checked corrected formula with student.", "status": "In Progress"},
                {"day": "Day 4 (Thu)", "focus": "Timed 15-Minute Rapid Assessment", "exercise": "Attempt 6 online micro-quiz questions on EDU360 portal.", "parent_checklist": "Verify score submission.", "status": "Upcoming"}
            ]
        })

        compliance_summary_json = json.dumps({
            "total_assigned": 9,
            "on_time_submissions": 2,
            "late_submissions": 0,
            "backlog_count": 1,
            "compliance_pct": 88.9,
            "last_scanned_at": "2026-10-17T21:57:00Z"
        })

        focus_table = FocusTable(
            id=1,
            student_id=1,
            student_name="Aarav Sharma",
            subject="Mathematics",
            weak_concept="Quadratic Equations & Sign Rules in Quadratic Formula",
            current_score_pct=52.0,
            target_score_pct=82.0,
            revision_plan_json=focus_plan_json,
            teacher_action="Host 5-min 1-on-1 doubt clearing session during zero period on Thursday.",
            parent_check_completed=True,
            status="in_progress",
            backlog_count=1,
            academic_compliance_json=compliance_summary_json
        )
        db.add(focus_table)

        # 13. Leave Requests
        leave_req = LeaveRequest(
            id=1,
            student_id=1,
            student_name="Aarav Sharma",
            parent_name="Mr. Rajesh Sharma",
            from_date="16 Oct 2026",
            to_date="16 Oct 2026",
            reason="Orthodontic dental consultation and braces adjustment at Apollo Clinic.",
            status="Pending",
            teacher_notes=None
        )
        db.add(leave_req)

        # 14. Fee Milestones
        fees = [
            FeeMilestone(id=1, student_id=1, title="Milestone 1: Term 1 Tuition & Curriculum Fee", amount=22000.0, due_date="15 Jul 2026", status="Paid", receipt_no="REC-2026-FEE-5821", paid_at="12 Jul 2026, 11:20 AM", payment_method="UPI (GPay)"),
            FeeMilestone(id=2, student_id=1, title="Milestone 2: Term 2 Tuition & Transport Fee", amount=18500.0, due_date="25 Oct 2026", status="Overdue", receipt_no=None, paid_at=None, payment_method=None),
            FeeMilestone(id=3, student_id=1, title="Milestone 3: Term 3 Activities, Labs & Annual Day", amount=15000.0, due_date="15 Jan 2027", status="Upcoming", receipt_no=None, paid_at=None, payment_method=None),
        ]
        db.add_all(fees)

        # 15. Bus Route
        bus_stops = json.dumps([
            {"name": "School Main Campus", "time": "03:15 PM", "status": "Departed"},
            {"name": "Sarjapur Signal Junction", "time": "03:26 PM", "status": "Passed"},
            {"name": "Bellandur EcoSpace Gate 2", "time": "03:38 PM", "status": "Current Stop"},
            {"name": "Sector 15 Crossroad (Aarav's Stop)", "time": "03:46 PM", "status": "Approaching (ETA 8 mins)"},
            {"name": "Greenwood Palms Apartments", "time": "03:55 PM", "status": "Terminal Stop"}
        ])

        bus = BusRoute(
            id=1,
            route_number="Route #4",
            driver_name="Uncle Ramesh",
            driver_phone="+91 98450 12345",
            vehicle_no="KA-01-EB-4412",
            stops_json=bus_stops,
            current_stop_idx=2,
            live_status="Moving smoothly • 2 Stops Away • 3 Mins ETA",
            eta_mins=3
        )
        db.add(bus)

        # 16. Student Portfolio (Side-by-Side: Participations vs Achievements)
        portfolio = [
            StudentPortfolio(id=1, student_id=1, category="participation", title="Inter-House Football League 2025", event_name="Phoenix House Captain (Forward)", date="Aug 2025", proof_url=None, verified_by_school=True, description="Led Phoenix House to the semifinals, scoring 4 goals."),
            StudentPortfolio(id=2, student_id=1, category="participation", title="Annual Science & Innovation Expo", event_name="Smart Irrigation Sensor Prototype", date="Nov 2025", proof_url=None, verified_by_school=True, description="Demonstrated Arduino-based soil moisture automated watering."),
            StudentPortfolio(id=3, student_id=1, category="achievement", title="Karnataka State Mathematics Olympiad", event_name="Silver Medal (Rank 14 Statewide)", date="Sep 2025", proof_url="/samples/math_olympiad_cert.png", verified_by_school=True, description="Awarded distinction in logical reasoning and algebra."),
            StudentPortfolio(id=4, student_id=1, category="achievement", title="District U-14 Rapid Chess Championship", event_name="1st Runner-Up Trophy", date="Dec 2025", proof_url="/samples/chess_trophy_cert.png", verified_by_school=True, description="Won 5 out of 6 rounds at Bangalore Youth Chess Open."),
        ]
        db.add_all(portfolio)

        # 17. Class Recordings Library
        recordings = [
            ClassRecording(id=1, title="Quadratic Equations: Factorization by Splitting", subject="Mathematics", chapter="Chapter 4: Quadratic Equations", teacher_name="Mrs. Ananya Verma", duration="42 mins", video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumbnail="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400", date="11 Oct 2026"),
            ClassRecording(id=2, title="Force and Laws of Motion: Newton's 3rd Law", subject="Physics", chapter="Chapter 9: Laws of Motion", teacher_name="Dr. K. Raman", duration="48 mins", video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", thumbnail="https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400", date="09 Oct 2026"),
            ClassRecording(id=3, title="The Merchant of Venice: Act II Scene IV", subject="English", chapter="Drama Literature", teacher_name="Ms. Rachel Adams", duration="38 mins", video_url="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", thumbnail="https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400", date="07 Oct 2026"),
        ]
        db.add_all(recordings)

        # 18. Staff Members
        staff = [
            StaffMember(id=1, name="Dr. Sunita Kapoor", role="Principal & Administrator", department="Administration", email="principal@edu360.internal", phone="+91 98111 00001", attendance_status="Present", salary_slip_ready=True),
            StaffMember(id=2, name="Mrs. Ananya Verma", role="Senior Mathematics Teacher", department="Academics", email="ananya.verma@edu360.internal", phone="+91 98111 00002", attendance_status="Present", salary_slip_ready=True),
            StaffMember(id=3, name="Dr. K. Raman", role="Physics Faculty", department="Academics", email="k.raman@edu360.internal", phone="+91 98111 00005", attendance_status="Present", salary_slip_ready=True),
            StaffMember(id=4, name="Ramesh Kumar", role="Senior Transport Driver", department="Logistics", email="transport.ramesh@edu360.internal", phone="+91 98450 12345", attendance_status="On Duty", salary_slip_ready=True),
        ]
        db.add_all(staff)

        # 19. Inventory
        inventory = [
            InventoryItem(id=1, name="CBSE Class 8 Mathematics NCERT Exemplar", category="Books", total_quantity=120, issued_quantity=95, damaged_quantity=2, min_threshold=15, status="Good Stock"),
            InventoryItem(id=2, name="Compound Optical Microscopes (1000x)", category="Lab Equipment", total_quantity=25, issued_quantity=22, damaged_quantity=1, min_threshold=5, status="Optimal"),
            InventoryItem(id=3, name="Yonex Carbonex Badminton Rackets", category="Sports Gear", total_quantity=40, issued_quantity=32, damaged_quantity=4, min_threshold=10, status="Low Stock Alert"),
            InventoryItem(id=4, name="Dell OptiPlex Core i7 Desktop Terminals", category="IT Hardware", total_quantity=60, issued_quantity=58, damaged_quantity=0, min_threshold=5, status="Optimal"),
        ]
        db.add_all(inventory)

        # 20. Junior Gamification (K-5 Junior Explorer Engine)
        gamifications = [
            StudentGamification(
                id=1,
                student_id=6,  # Aarav Kumar (Junior Explorer, Class 3-A)
                level=3,
                level_title="Explorer",
                xp_points=450,
                total_stars=180,
                attendance_streak_days=7,
                sound_effects_enabled=True
            ),
            StudentGamification(
                id=2,
                student_id=1,  # Aarav Sharma (Secondary, Class 8)
                level=5,
                level_title="Scholar",
                xp_points=720,
                total_stars=340,
                attendance_streak_days=5,
                sound_effects_enabled=True
            )
        ]
        db.add_all(gamifications)

        # 21. Daily Homework Quests with Star Rewards
        quests = [
            DailyQuest(
                id=1,
                student_id=6,
                title="Count & Color 10 Stars in Chapter 2 Workbook",
                subject="Math",
                xp_reward=25,
                stars_reward=50,
                status="active",
                teacher_reaction="Super Star! ⭐ - Ms. Priya",
                proof_image_url=None,
                due_date="Today, 4:00 PM"
            ),
            DailyQuest(
                id=2,
                student_id=6,
                title="Draw and Name 3 Farm Animals",
                subject="Art & Nature",
                xp_reward=30,
                stars_reward=60,
                status="active",
                teacher_reaction="Creative Genius! 🎨 - Ms. Neha",
                proof_image_url=None,
                due_date="Tomorrow, 10:00 AM"
            ),
            DailyQuest(
                id=3,
                student_id=6,
                title="Read Aloud: The Magic Treehouse (Ch 1)",
                subject="English Phonics",
                xp_reward=20,
                stars_reward=40,
                status="completed",
                teacher_reaction="Brilliant Pronunciation! 🌟 - Ms. Priya",
                proof_image_url="/samples/storybook_audio_proof.png",
                due_date="Yesterday"
            )
        ]
        db.add_all(quests)

        # 22. Magic Power Booster (4-Day Focus Table with Treasure Chests)
        chests = [
            MagicBoosterChest(
                id=1,
                student_id=6,
                concept_title="Number Counting & Phonics",
                day_number=1,
                day_task_title="Count 1 to 20 with Number Blocks",
                status="completed_claimed",
                chest_stars=30,
                parent_signed=True
            ),
            MagicBoosterChest(
                id=2,
                student_id=6,
                concept_title="Number Counting & Phonics",
                day_number=2,
                day_task_title="Find & Circle 5 Rhyming Words",
                status="ready_to_open",
                chest_stars=30,
                parent_signed=True
            ),
            MagicBoosterChest(
                id=3,
                student_id=6,
                concept_title="Number Counting & Phonics",
                day_number=3,
                day_task_title="Solve 3 Animal Addition Riddles",
                status="locked",
                chest_stars=40,
                parent_signed=False
            ),
            MagicBoosterChest(
                id=4,
                student_id=6,
                concept_title="Number Counting & Phonics",
                day_number=4,
                day_task_title="Draw the Treasure Map & Spell 5 Words",
                status="locked",
                chest_stars=50,
                parent_signed=False
            )
        ]
        db.add_all(chests)

        await db.commit()
        print("EDU360 seed data populated successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
