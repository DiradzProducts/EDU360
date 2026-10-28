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
    StudentGamification, DailyQuest, MagicBoosterChest, BacklogEvent,
    Exam, ExamSubmission, RemedialSprint,
    QuestionPaper, ExamSchedule, ReportCard, Notification,
    FeeDefaulter, VendorInvoice, PaymentTransaction, FinanceDispatchLog,
    PayrollBatch, StaffPayslip, PurchaseOrder, FleetExpenseRecord,
    InventoryMovement, AssetCustodyLog
)

async def seed_data():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Users
        users = [
            # School Leadership & Coordinators
            User(id=1, name="Dr. Sunita Kapoor", username="admin", email="principal@edu360.internal", password="Password123", role="admin", avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", phone="+91 98111 00001"),
            User(id=6, name="Prof. Rajeshwari Nair", username="academic_coord", email="academic.coord@edu360.internal", password="Password123", role="academic_coordinator", avatar="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150", phone="+91 98111 00006"),
            User(id=7, name="Mr. Vikram Malhotra", username="transport_coord", email="transport.lead@edu360.internal", password="Password123", role="transport_coordinator", avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", phone="+91 98111 00007"),
            User(id=8, name="Dr. Hemanth Sen", username="exam_coord", email="exam.cell@edu360.internal", password="Password123", role="exam_coordinator", avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", phone="+91 98111 00008"),
            User(id=9, name="Mrs. Shalini Rao", username="inventory_coord", email="inventory.store@edu360.internal", password="Password123", role="inventory_coordinator", avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", phone="+91 98111 00009"),
            User(id=10, name="Ms. Sneha Kulkarni", username="admissions_coord", email="admissions.crm@edu360.internal", password="Password123", role="admissions_coordinator", avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", phone="+91 98111 00010"),
            User(id=11, name="Mr. Arvind Krishnan", username="accounts_coord", email="accounts.bursar@edu360.internal", password="Password123", role="accounts_coordinator", avatar="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", phone="+91 98111 00011"),

            # Subject Faculty & Teachers
            User(id=2, name="Mrs. Ananya Verma", username="teacher_mat", email="ananya.verma@edu360.internal", password="Password123", role="teacher", avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", phone="+91 98111 00002"), # Mathematics & Class 8-B Homeroom
            User(id=12, name="Dr. K. Raman", username="teacher_sci", email="raman.k@edu360.internal", password="Password123", role="teacher", avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", phone="+91 98111 22332"), # Physics & Science
            User(id=13, name="Mrs. S. Sen", username="teacher_chem", email="s.sen@edu360.internal", password="Password123", role="teacher", avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150", phone="+91 98111 22333"), # Chemistry
            User(id=14, name="Mrs. Sunitha Rao", username="teacher_eng", email="sunitha.rao@edu360.internal", password="Password123", role="teacher", avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", phone="+91 98111 22331"), # English Literature
            User(id=15, name="Mrs. Kalyani Murthy", username="teacher_soc", email="kalyani.m@edu360.internal", password="Password123", role="teacher", avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", phone="+91 98111 22335"), # Social Science
            User(id=16, name="Dr. Shalini Gupta", username="teacher_bio", email="shalini.gupta@edu360.internal", password="Password123", role="teacher", avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", phone="+91 98111 22336"), # Biology

            # Parents
            User(id=3, name="Mr. Rajesh Sharma", username="parent", email="rajesh.sharma@example.com", password="Password123", role="parent", avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", phone="+91 98111 00003"), # Parent of Aarav Sharma (8-B) & Aarav Kumar (3-A)
            User(id=17, name="Mrs. Rekha Mehta", username="parent_kabir", email="r.mehta@example.com", password="Password123", role="parent", avatar="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", phone="+91 98555 44444"), # Parent of Kabir Mehta (8-B)
            User(id=18, name="Dr. Vikram Patel", username="parent_diya", email="vikram.patel@example.com", password="Password123", role="parent", avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", phone="+91 98222 11111"), # Parent of Diya Patel (8-B)
            User(id=19, name="Mr. Alok Verma", username="parent_siddharth", email="alok.verma@example.com", password="Password123", role="parent", avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150", phone="+91 98777 55555"), # Parent of Siddharth Verma (8-A)
            User(id=20, name="Mrs. Meenakshi Iyer", username="parent_rohan", email="meenakshi.iyer@example.com", password="Password123", role="parent", avatar="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150", phone="+91 98333 22222"), # Parent of Rohan Iyer (8-A)
            User(id=21, name="Mr. Pradeep Gupta", username="parent_ananya", email="pradeep.gupta@example.com", password="Password123", role="parent", avatar="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150", phone="+91 98444 33333"), # Parent of Ananya Gupta (9-A)
            User(id=22, name="Mrs. Sangeeta Roy", username="parent_aditya", email="sangeeta.roy@example.com", password="Password123", role="parent", avatar="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150", phone="+91 98888 66666"), # Parent of Aditya Roy (9-B)

            # Students
            User(id=4, name="Aarav Sharma", username="sr_student", email="aarav.sharma@student.edu360.internal", password="Password123", role="student", avatar="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", phone="+91 98111 00004"),
            User(id=5, name="Aarav Kumar", username="jr_student", email="aarav.junior@student.edu360.internal", password="Password123", role="student", avatar="https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150", phone="+91 98111 00005"),
        ]
        db.add_all(users)

        # 2. Students (Enriched across Class 8-B, 8-A, 9-A, 9-B and Junior 3-A)
        students = [
            Student(id=1, user_id=4, name="Aarav Sharma", roll_no="14", class_name="Class 8", section="B", admission_no="EDU-2024-082", guardian_name="Mr. Rajesh Sharma", guardian_phone="+91 98111 00003", guardian_email="rajesh.sharma@example.com", attendance_pct=91.4, bus_route_id=1, academic_average_pct=76.8, status="Active", grade_tier="secondary", age=14),
            Student(id=2, user_id=None, name="Kabir Mehta", roll_no="15", class_name="Class 8", section="B", admission_no="EDU-2024-086", guardian_name="Mrs. Rekha Mehta", guardian_phone="+91 98555 44444", guardian_email="r.mehta@example.com", attendance_pct=72.0, bus_route_id=1, academic_average_pct=64.2, status="Active", grade_tier="secondary", age=13),
            Student(id=3, user_id=None, name="Diya Patel", roll_no="18", class_name="Class 8", section="B", admission_no="EDU-2024-083", guardian_name="Dr. Vikram Patel", guardian_phone="+91 98222 11111", guardian_email="vikram.patel@example.com", attendance_pct=96.0, bus_route_id=1, academic_average_pct=92.5, status="Active", grade_tier="secondary", age=14),
            Student(id=4, user_id=None, name="Siddharth Verma", roll_no="21", class_name="Class 8", section="A", admission_no="EDU-2024-091", guardian_name="Mr. Alok Verma", guardian_phone="+91 98777 55555", guardian_email="alok.verma@example.com", attendance_pct=84.5, bus_route_id=1, academic_average_pct=68.0, status="Active", grade_tier="secondary", age=14),
            Student(id=5, user_id=None, name="Rohan Iyer", roll_no="09", class_name="Class 8", section="A", admission_no="EDU-2024-084", guardian_name="Mrs. Meenakshi Iyer", guardian_phone="+91 98333 22222", guardian_email="meenakshi.iyer@example.com", attendance_pct=88.2, bus_route_id=1, academic_average_pct=81.0, status="Active", grade_tier="secondary", age=14),
            Student(id=6, user_id=None, name="Ananya Gupta", roll_no="04", class_name="Class 9", section="A", admission_no="EDU-2024-085", guardian_name="Mr. Pradeep Gupta", guardian_phone="+91 98444 33333", guardian_email="pradeep.gupta@example.com", attendance_pct=94.5, bus_route_id=1, academic_average_pct=74.5, status="Active", grade_tier="secondary", age=15),
            Student(id=7, user_id=None, name="Aditya Roy", roll_no="12", class_name="Class 9", section="B", admission_no="EDU-2024-097", guardian_name="Mrs. Sangeeta Roy", guardian_phone="+91 98888 66666", guardian_email="sangeeta.roy@example.com", attendance_pct=78.5, bus_route_id=1, academic_average_pct=65.0, status="Active", grade_tier="secondary", age=15),
            Student(id=8, user_id=5, name="Aarav Kumar", roll_no="08", class_name="Class 3-A", section="A", admission_no="EDU-2025-032", guardian_name="Mr. Rajesh Sharma", guardian_phone="+91 98111 00003", guardian_email="rajesh.sharma@example.com", attendance_pct=94.2, bus_route_id=1, academic_average_pct=88.5, status="Active", grade_tier="k5", age=8, avatar_character_url="https://api.dicebear.com/7.x/bottts/svg?seed=AaravJunior3D"),
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

        # 5. Admin & Coordinator Operational Tasks
        tasks = [
            AdminTask(
                id=1,
                title="Submit Class 10 Board Exam LOC to CBSE Portal",
                description="List of candidates for 2026 Board examination needs final verification of internal assessment grades.",
                category="urgent",
                domain="exam",
                due_date="Today, 5:00 PM",
                assigned_to="Dr. Hemanth Sen",
                assigned_to_role="exam_coordinator",
                created_by_name="Dr. Sunita Kapoor",
                created_by_role="admin",
                status="In Progress",
                priority="Critical",
                sla_hours=12,
                is_escalated=True,
                escalation_reason="CBSE Server closes at 6:00 PM. High priority institutional submission."
            ),
            AdminTask(
                id=2,
                title="Conduct Term-2 Remedial Batch Parent Orientation",
                description="Coordinate digital briefing with parents of students scoring ≤70% on Mathematics & Science 1-Week Remedial Focus plans.",
                category="urgent",
                domain="academic",
                due_date="Today, 6:30 PM",
                assigned_to="Mrs. Ananya Verma",
                assigned_to_role="teacher",
                created_by_name="Principal Sharma",
                created_by_role="admin",
                status="Pending",
                priority="High",
                sla_hours=12,
                is_auto_generated=False
            ),
            AdminTask(
                id=3,
                title="Audit Term 2 Fee Defaulters & Dispatch SMS Digest",
                description="30 accounts currently exceed 30 days overdue. Generate fee recovery aging statement and trigger parent reminder broadcast.",
                category="upcoming",
                domain="finance",
                due_date="Tomorrow, 11:00 AM",
                assigned_to="Mr. Arvind Krishnan",
                assigned_to_role="accounts_coordinator",
                created_by_name="Mr. Arvind Krishnan",
                created_by_role="accounts_coordinator",
                status="Pending",
                priority="Medium",
                sla_hours=48
            ),
            AdminTask(
                id=4,
                title="Review 8 New Admission Enquiries from AI Chatbot",
                description="Prospective parents requested Grade 6 and Grade 8 tours. Complete telephone qualification and assign counselor.",
                category="upcoming",
                domain="admissions",
                due_date="Tomorrow, 2:00 PM",
                assigned_to="Ms. Sneha Kulkarni",
                assigned_to_role="admissions_coordinator",
                created_by_name="Ms. Sneha Kulkarni",
                created_by_role="admissions_coordinator",
                status="In Progress",
                priority="Medium",
                sla_hours=36
            ),
            AdminTask(
                id=5,
                title="Review Class 8-B Math Remedial Focus Table Pacing",
                description="Ensure 1-Week Remedial interventions are logged for students scoring <= 70% in Term 1 Math examination.",
                category="urgent",
                domain="academic",
                due_date="Today, 4:00 PM",
                assigned_to="Prof. Rajeshwari Nair",
                assigned_to_role="academic_coordinator",
                created_by_name="Prof. Rajeshwari Nair",
                created_by_role="academic_coordinator",
                status="Pending Review",
                priority="High",
                sla_hours=24
            ),
            AdminTask(
                id=6,
                title="Audit Chemistry Laboratory Acid & Apparatus Stock",
                description="Verify stock buffer of Hydrochloric acid and test tubes prior to Class 9 practical examination.",
                category="upcoming",
                domain="inventory",
                due_date="Within 3 Days",
                assigned_to="Mrs. Shalini Rao",
                assigned_to_role="inventory_coordinator",
                created_by_name="Mrs. Shalini Rao",
                created_by_role="inventory_coordinator",
                status="Pending",
                priority="Medium",
                sla_hours=72
            ),
            AdminTask(
                id=7,
                title="CBSE Board Affiliation Renewal Dossier Inspection",
                description="Executive institutional compliance review covering fire safety, building fitness, and faculty service rules.",
                category="urgent",
                domain="executive",
                due_date="In 4 Days",
                assigned_to="Dr. Sunita Kapoor",
                assigned_to_role="admin",
                created_by_name="Dr. Sunita Kapoor",
                created_by_role="admin",
                status="In Progress",
                priority="High",
                sla_hours=96
            )
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
            AdmissionEnquiry(id=1, student_name="Siddharth Rao", parent_name="Mrs. Meera Rao", email="meera.rao@example.com", phone="+91 98450 99881", target_grade="Class 8", stage="followup", lead_temperature="hot", source="Website Form", doc_report_card=True, doc_birth_cert=True, doc_transfer_cert=False, next_followup_date=datetime.date.today().isoformat(), chat_transcript=chat_sample_1, notes="• [Oct 22] Initial Enquiry: Parent asked about online CBSE curriculum and demo class."),
            AdmissionEnquiry(id=2, student_name="Tanvi Deshmukh", parent_name="Dr. Amit Deshmukh", email="amit.d@example.com", phone="+91 98450 99882", target_grade="Class 6", stage="followup", lead_temperature="warm", source="Parent Referral", doc_report_card=True, doc_birth_cert=False, doc_transfer_cert=False, next_followup_date=datetime.date.today().isoformat(), chat_transcript=None, notes="• [Oct 21] Callback Requested: Discuss fee installment schedule."),
            AdmissionEnquiry(id=3, student_name="Aditya Roy", parent_name="Mrs. Neha Roy", email="neha.roy@example.com", phone="+91 98450 99883", target_grade="Class 9", stage="new", lead_temperature="cold", source="Social Media Ad", doc_report_card=False, doc_birth_cert=False, doc_transfer_cert=False, chat_transcript=None, notes="Direct web inquiry: Inquired about Cambridge curriculum options."),
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

        # 11. Homework & Submissions (Daily Homework vs Long-term Assignments across Subjects)
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
                teacher_id=15,
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
                due_date="2026-10-17",
                due_time="17:00",
                status="BACKLOG",
                assigned_date="2026-10-14",
                teacher_id=14,
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
                teacher_id=12,
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
                due_date="2026-10-16",
                due_time="18:00",
                status="BACKLOG",
                assigned_date="2026-10-15",
                teacher_id=13,
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
                teacher_id=16,
                teacher_name="Dr. Shalini Gupta",
                max_marks=20,
                resource_url="/samples/biology_cell_diagram.pdf",
                weightage="Daily Practice (5 pts)"
            ),
            Homework(
                id=7,
                title="Optics & Convex Lens: Ray Tracing Lab Sheet",
                subject="Physics",
                class_name="Class 8B",
                description="Measure object and image distances for concave mirrors and convex lenses. Construct principal ray diagrams showing focal point convergence.",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-17",
                due_time="17:00",
                status="BACKLOG",
                assigned_date="2026-10-13",
                teacher_id=12,
                teacher_name="Dr. K. Raman",
                max_marks=20,
                resource_url="/samples/physics_spring_lab.pdf",
                weightage="Lab Assessment (20 pts)"
            ),
            Homework(
                id=8,
                title="Linear Inequalities & Number Line Interval Shading",
                subject="Mathematics",
                class_name="Class 8B",
                description="Solve 8 single-variable inequalities. Graph solution intervals with open and closed circles on the number line.",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-14",
                due_time="17:00",
                status="BACKLOG",
                assigned_date="2026-10-11",
                teacher_id=2,
                teacher_name="Mrs. Ananya Verma",
                max_marks=20,
                resource_url="/samples/math_worksheet.png",
                weightage="Daily Practice (5 pts)"
            ),
            # Long-Term Assignments & Projects
            Homework(
                id=9,
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
                id=10,
                title="National History Monograph: The Indian Constitution Evolution",
                subject="Social Science",
                class_name="Class 8B",
                description="1500-word academic monograph referencing Constituent Assembly debates, B.R. Ambedkar committee drafts, and modern fundamental rights jurisprudence.",
                task_type="ASSIGNMENT",
                due_date="2026-11-05",
                due_time="23:59",
                status="PENDING",
                assigned_date="2026-10-05",
                teacher_id=15,
                teacher_name="Mrs. Kalyani Murthy",
                max_marks=40,
                resource_url="/samples/Constitution_Monograph_Guidelines.pdf",
                weightage="15% of Term 1 Final Grade",
                progress_pct=40.0
            )
        ]
        db.add_all(homeworks_data)

        # Visual Markup Annotations for Homework & Exam PTM Review
        sample_math_annotations = json.dumps([
            {"type": "tick", "x": 190, "y": 140, "color": "#10B981"},
            {"type": "circle", "x": 380, "y": 280, "radius": 32, "color": "#EF4444"},
            {"type": "text", "x": 420, "y": 275, "text": "Sign error in Q4: (-b ± √Δ)/(2a)", "color": "#EF4444"},
            {"type": "circle", "x": 380, "y": 420, "radius": 35, "color": "#EF4444"},
            {"type": "text", "x": 430, "y": 415, "text": "Dropped minus on -(3x - 5) in Q7", "color": "#EF4444"}
        ])

        sample_physics_annotations = json.dumps([
            {"type": "tick", "x": 190, "y": 120, "color": "#10B981"},
            {"type": "circle", "x": 350, "y": 310, "radius": 30, "color": "#EF4444"},
            {"type": "text", "x": 390, "y": 305, "text": "Q3: Reflected rays must cross at focal point F, not C", "color": "#EF4444"}
        ])

        submissions_data = [
            # Aarav Sharma Submissions
            HomeworkSubmission(
                id=1,
                homework_id=4,
                student_id=1,
                student_name="Aarav Sharma",
                original_file_url="/samples/physics_spring_lab.pdf",
                annotated_file_url="/samples/physics_spring_lab.pdf",
                annotations_json=sample_physics_annotations,
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
                marks_obtained=18.0,
                teacher_remarks="Excellent comparative synthesis between Article 14 and Article 21.",
                status="graded",
                submitted_at=datetime.datetime(2026, 10, 13, 15, 45),
                graded_at=datetime.datetime(2026, 10, 14, 11, 0),
                late_submission=False,
                is_backlog=False
            ),
            HomeworkSubmission(
                id=3,
                homework_id=1,
                student_id=1,
                student_name="Aarav Sharma",
                original_file_url="/samples/math_worksheet.png",
                annotated_file_url="/samples/math_worksheet.png",
                annotations_json=sample_math_annotations,
                marks_obtained=8.0,
                teacher_remarks="Sign errors throughout LCM expansion in Q4 and Q7. Intermediate factorization steps missing. Kept as evidence for PTM review.",
                status="backlog",
                is_backlog=True,
                late_submission=False,
                submitted_at=datetime.datetime(2026, 10, 15, 17, 1)
            ),
            HomeworkSubmission(
                id=4,
                homework_id=7,
                student_id=1,
                student_name="Aarav Sharma",
                original_file_url="/samples/physics_spring_lab.pdf",
                annotated_file_url="/samples/physics_spring_lab.pdf",
                annotations_json=sample_physics_annotations,
                marks_obtained=11.0,
                teacher_remarks="Ray diagram does not converge at the primary focal point F. Re-measure focal distance before PTM.",
                status="backlog",
                is_backlog=True,
                late_submission=False,
                submitted_at=datetime.datetime(2026, 10, 17, 17, 20)
            ),
            # Kabir Mehta Submissions
            HomeworkSubmission(
                id=5,
                homework_id=8,
                student_id=2,
                student_name="Kabir Mehta",
                original_file_url="/samples/math_worksheet.png",
                annotated_file_url="/samples/math_worksheet.png",
                annotations_json=None,
                marks_obtained=7.0,
                teacher_remarks="Inequality sign was not inverted when dividing by -2 in Q2, Q4, and Q8. Direct evidence for parent conference.",
                status="backlog",
                is_backlog=True,
                late_submission=False,
                submitted_at=datetime.datetime(2026, 10, 14, 17, 30)
            ),
            HomeworkSubmission(
                id=6,
                homework_id=5,
                student_id=2,
                student_name="Kabir Mehta",
                original_file_url="",
                status="backlog",
                is_backlog=True,
                late_submission=False,
                marks_obtained=9.5,
                teacher_remarks="25 redox equations incomplete; failed oxygen stoichiometry balancing. Overdue by 3 days.",
                submitted_at=datetime.datetime(2026, 10, 16, 18, 15)
            ),
            # Siddharth Verma Submissions
            HomeworkSubmission(
                id=7,
                homework_id=1,
                student_id=4,
                student_name="Siddharth Verma",
                original_file_url="",
                status="backlog",
                is_backlog=True,
                late_submission=False,
                marks_obtained=9.0,
                teacher_remarks="Dropped common difference sign (-4 written as +4). Unsubmitted revision.",
                submitted_at=datetime.datetime(2026, 10, 15, 17, 15)
            ),
            HomeworkSubmission(
                id=8,
                homework_id=3,
                student_id=4,
                student_name="Siddharth Verma",
                original_file_url="",
                status="backlog",
                is_backlog=True,
                late_submission=False,
                marks_obtained=10.0,
                teacher_remarks="Missed submission deadline (17 Oct). Essay missing required quotes from Act IV Scene 1.",
                submitted_at=datetime.datetime(2026, 10, 17, 17, 10)
            ),
        ]
        db.add_all(submissions_data)

        # 11b. Itemized Backlog Evidence Events (Undeniable Audit Trail for Parents at PTM)
        backlog_events = [
            # Aarav Sharma (Class 8-B)
            BacklogEvent(
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
                notes="Student missed scheduled cutoff (15 Oct 2026, 05:00 PM). Automated Backlog Engine recorded 0 uploads by 11:59 PM. Verified evidence for parent PTM review."
            ),
            BacklogEvent(
                id=2,
                student_id=1,
                homework_id=7,
                focus_table_id=1,
                evidence_code="#EVD-BKLOG-902",
                subject="Physics",
                title="Optics & Convex Lens: Ray Tracing Lab Sheet",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-17",
                due_time="17:00",
                status="UNRESOLVED",
                detected_at=datetime.datetime(2026, 10, 17, 17, 20),
                late_submission=False,
                teacher_name="Dr. K. Raman",
                notes="Optics ray tracing lab sheet unsubmitted after cutoff. Teacher flagged for Parent-Teacher conference."
            ),
            # Kabir Mehta (Class 8-B)
            BacklogEvent(
                id=3,
                student_id=2,
                homework_id=8,
                focus_table_id=2,
                evidence_code="#EVD-BKLOG-715",
                subject="Mathematics",
                title="Linear Inequalities & Number Line Interval Shading",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-14",
                due_time="17:00",
                status="UNRESOLVED",
                detected_at=datetime.datetime(2026, 10, 14, 17, 30),
                late_submission=False,
                teacher_name="Mrs. Ananya Verma",
                notes="Zero submission recorded. Correlated with 48% exam score in linear systems. Primary agenda for PTM."
            ),
            BacklogEvent(
                id=4,
                student_id=2,
                homework_id=5,
                focus_table_id=2,
                evidence_code="#EVD-BKLOG-716",
                subject="Chemistry",
                title="Chemical Reactions: Redox Equations Balancing Practice",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-16",
                due_time="18:00",
                status="UNRESOLVED",
                detected_at=datetime.datetime(2026, 10, 16, 18, 15),
                late_submission=False,
                teacher_name="Mrs. S. Sen",
                notes="Redox balancing practice overdue by 3 days. Parent alert triggered for PTM."
            ),
            # Siddharth Verma (Class 8-A)
            BacklogEvent(
                id=5,
                student_id=4,
                homework_id=1,
                focus_table_id=3,
                evidence_code="#EVD-BKLOG-820",
                subject="Mathematics",
                title="Worksheet #4: Solving Quadratics by Factoring",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-15",
                due_time="17:00",
                status="UNRESOLVED",
                detected_at=datetime.datetime(2026, 10, 15, 17, 15),
                late_submission=False,
                teacher_name="Mrs. Ananya Verma",
                notes="Decreasing sequence calculations unsubmitted. Flagged for parent review."
            ),
            BacklogEvent(
                id=6,
                student_id=4,
                homework_id=3,
                focus_table_id=3,
                evidence_code="#EVD-BKLOG-821",
                subject="English Literature",
                title="The Merchant of Venice: Portia's Mercy Speech Critical Analysis",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-17",
                due_time="17:00",
                status="UNRESOLVED",
                detected_at=datetime.datetime(2026, 10, 17, 17, 10),
                late_submission=False,
                teacher_name="Mrs. Sunitha Rao",
                notes="300-word critical evaluation overdue by 2 days. Critical for PTM."
            ),
            # Aditya Roy (Class 9-B)
            BacklogEvent(
                id=7,
                student_id=7,
                homework_id=1,
                focus_table_id=None,
                evidence_code="#EVD-BKLOG-631",
                subject="Mathematics",
                title="Worksheet #4: Solving Quadratics by Factoring",
                task_type="DAILY_HOMEWORK",
                due_date="2026-10-15",
                due_time="17:00",
                status="UNRESOLVED",
                detected_at=datetime.datetime(2026, 10, 15, 17, 15),
                late_submission=False,
                teacher_name="Mrs. Ananya Verma",
                notes="Trigonometric and quadratic field application worksheet overdue."
            ),
        ]
        db.add_all(backlog_events)

        # 12. Focus Tables (Per-Student Shared Teacher-Parent Academic Recoveries)
        focus_plan_aarav_json = json.dumps({
            "days": [
                {"day": "Day 1 (Mon)", "focus": "Quadratic Standard Form & Identifying a, b, c", "exercise": "Watch 12-min concept recap and list 5 equations.", "parent_checklist": "Verified concept video completed.", "status": "Completed"},
                {"day": "Day 2 (Tue)", "focus": "Factoring by Splitting the Middle Term", "exercise": "Solve 4 standard factoring questions on page 64.", "parent_checklist": "Verified 4 solved problems in rough notebook.", "status": "Completed"},
                {"day": "Day 3 (Wed)", "focus": "Discriminant (b² - 4ac) Calculation & Signs", "exercise": "Revisit teacher corrections on Worksheet #4 and fix Q4.", "parent_checklist": "Checked corrected formula with student.", "status": "In Progress"},
                {"day": "Day 4 (Thu)", "focus": "Timed 15-Minute Rapid Assessment", "exercise": "Attempt 6 online micro-quiz questions on EDU360 portal.", "parent_checklist": "Verify score submission.", "status": "Upcoming"}
            ]
        })

        focus_plan_kabir_json = json.dumps({
            "days": [
                {"day": "Day 1 (Mon)", "focus": "Strict vs Non-Strict Inequalities", "exercise": "Plot 8 basic inequalities on number lines.", "parent_checklist": "Checked number lines.", "status": "Completed"},
                {"day": "Day 2 (Tue)", "focus": "Division by Negative Integers Rule Drill", "exercise": "Solve 6 inequalities where division by -k flips the sign.", "parent_checklist": "Verify arrow flips.", "status": "In Progress"},
                {"day": "Day 3 (Wed)", "focus": "Compound Inequalities (AND vs OR)", "exercise": "Solve 4 double-ended inequalities.", "parent_checklist": "Review notes.", "status": "Upcoming"}
            ]
        })

        focus_plan_siddharth_json = json.dumps({
            "days": [
                {"day": "Day 1 (Mon)", "focus": "Decreasing Sequence Arithmetic Progressions", "exercise": "Solve 6 problems identifying d = a2 - a1 with negative difference.", "parent_checklist": "Checked signed calculation.", "status": "Completed"},
                {"day": "Day 2 (Tue)", "focus": "Nth Term of Decreasing AP", "exercise": "Calculate 15th term of sequence 40, 35, 30...", "parent_checklist": "Verified rough notebook.", "status": "In Progress"}
            ]
        })

        compliance_aarav_json = json.dumps({
            "total_assigned": 9,
            "on_time_submissions": 2,
            "late_submissions": 0,
            "backlog_count": 2,
            "compliance_pct": 77.8,
            "last_scanned_at": "2026-10-18T21:00:00Z"
        })

        compliance_kabir_json = json.dumps({
            "total_assigned": 8,
            "on_time_submissions": 1,
            "late_submissions": 0,
            "backlog_count": 2,
            "compliance_pct": 70.0,
            "last_scanned_at": "2026-10-18T21:00:00Z"
        })

        compliance_siddharth_json = json.dumps({
            "total_assigned": 8,
            "on_time_submissions": 2,
            "late_submissions": 0,
            "backlog_count": 2,
            "compliance_pct": 66.7,
            "last_scanned_at": "2026-10-18T21:00:00Z"
        })

        focus_tables = [
            FocusTable(
                id=1,
                student_id=1,
                student_name="Aarav Sharma",
                subject="Mathematics",
                weak_concept="Quadratic Equations: Factorization by Splitting & Sign Distribution",
                current_score_pct=52.0,
                target_score_pct=82.0,
                revision_plan_json=focus_plan_aarav_json,
                teacher_action="Review rough notebook solution for Day 3 and verify negative sign conventions before PTM.",
                parent_check_completed=True,
                status="in_progress",
                backlog_count=2,
                academic_compliance_json=compliance_aarav_json
            ),
            FocusTable(
                id=2,
                student_id=2,
                student_name="Kabir Mehta",
                subject="Mathematics",
                weak_concept="Linear Inequalities & Number Line Arrow Direction",
                current_score_pct=48.0,
                target_score_pct=75.0,
                revision_plan_json=focus_plan_kabir_json,
                teacher_action="Remind Kabir during homeroom to submit Day 2 inequality practice notebook.",
                parent_check_completed=False,
                status="in_progress",
                backlog_count=2,
                academic_compliance_json=compliance_kabir_json
            ),
            FocusTable(
                id=3,
                student_id=4,
                student_name="Siddharth Verma",
                subject="Mathematics",
                weak_concept="Arithmetic Progressions: Common Difference Sign in Decreasing Sequences",
                current_score_pct=44.0,
                target_score_pct=75.0,
                revision_plan_json=focus_plan_siddharth_json,
                teacher_action="Inspect Day 2 AP nth-term calculations and review during zero period.",
                parent_check_completed=False,
                status="in_progress",
                backlog_count=2,
                academic_compliance_json=compliance_siddharth_json
            )
        ]
        db.add_all(focus_tables)

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

        # 23. Exams & Descriptive Answer Sheet Submissions
        exams = [
            Exam(
                id=1,
                title="Term 1 Descriptive Examination - Mathematics",
                subject="Mathematics",
                class_name="Class 8",
                section="B",
                term="Term 1",
                exam_type="descriptive",
                total_marks=100.0,
                pass_marks=40.0,
                remedial_threshold_pct=70.0,
                exam_date="14 Oct 2026",
                is_published=True,
                published_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
            ),
            Exam(
                id=2,
                title="Mid-Term Mathematics Descriptive Paper (Class 8-A)",
                subject="Mathematics",
                class_name="Class 8",
                section="A",
                term="Mid-Term",
                exam_type="descriptive",
                total_marks=100.0,
                pass_marks=40.0,
                remedial_threshold_pct=70.0,
                exam_date="16 Oct 2026",
                is_published=False,
                published_at=None
            ),
            Exam(
                id=3,
                title="Quadratic Equations & Polynomials Assessment (Class 9-A & 9-B)",
                subject="Mathematics",
                class_name="Class 9",
                section="A",
                term="Term 1",
                exam_type="descriptive",
                total_marks=100.0,
                pass_marks=40.0,
                remedial_threshold_pct=70.0,
                exam_date="18 Oct 2026",
                is_published=True,
                published_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            )
        ]
        db.add_all(exams)

        exam_submissions = [
            # Exam 1 (Class 8-B)
            ExamSubmission(
                id=1,
                exam_id=1,
                student_id=1, # Aarav Sharma
                status="graded",
                paper_file_url="/samples/math_exam_sample.svg",
                paper_file_name="Aarav_Sharma_Math_Term1_Paper.pdf",
                submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=4),
                marks_obtained=52.0,
                percentage=52.0,
                teacher_feedback="Algebraic Fractions: Drops negative sign when expanding LCM numerator -(3x - 5). Needs parentheses drill.",
                graded_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                graded_by_teacher_id=2
            ),
            ExamSubmission(
                id=2,
                exam_id=1,
                student_id=2, # Kabir Mehta
                status="graded",
                paper_file_url="/samples/math_exam_sample.svg",
                paper_file_name="Kabir_Mehta_Math_Term1_Paper.pdf",
                submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=4),
                marks_obtained=64.0,
                percentage=64.0,
                teacher_feedback="Frequent sign confusion during middle term splitting when ac < 0.",
                graded_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                graded_by_teacher_id=2
            ),
            ExamSubmission(
                id=3,
                exam_id=1,
                student_id=3, # Diya Patel
                status="graded",
                paper_file_url="/samples/math_exam_sample.svg",
                paper_file_name="Diya_Patel_Math_Term1_Paper.pdf",
                submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=4),
                marks_obtained=92.5,
                percentage=92.5,
                teacher_feedback="Exemplary solutions with clear algebraic step proofs.",
                graded_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                graded_by_teacher_id=2
            ),
            # Exam 2 (Class 8-A, Unpublished)
            ExamSubmission(
                id=4,
                exam_id=2,
                student_id=4, # Siddharth Verma
                status="graded",
                paper_file_url="/samples/math_exam_sample.svg",
                paper_file_name="Siddharth_Verma_MidTerm_Paper.pdf",
                submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                marks_obtained=46.0,
                percentage=46.0,
                teacher_feedback="Omits cross-terms (2ab) when expanding (a - b)² binomials.",
                graded_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                graded_by_teacher_id=2
            ),
            ExamSubmission(
                id=5,
                exam_id=2,
                student_id=5, # Rohan Iyer
                status="graded",
                paper_file_url="/samples/math_exam_sample.svg",
                paper_file_name="Rohan_Iyer_MidTerm_Paper.pdf",
                submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                marks_obtained=81.0,
                percentage=81.0,
                teacher_feedback="Good step presentation; mastered algebraic methods.",
                graded_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                graded_by_teacher_id=2
            ),
            # Exam 3 (Class 9-A & 9-B)
            ExamSubmission(
                id=6,
                exam_id=3,
                student_id=6, # Ananya Gupta
                status="graded",
                paper_file_url="/samples/math_exam_sample.svg",
                paper_file_name="Ananya_Gupta_Term1_Paper.pdf",
                submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                marks_obtained=74.5,
                percentage=74.5,
                teacher_feedback="Comfortable with polynomials; minor calculation slips.",
                graded_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                graded_by_teacher_id=2
            ),
            ExamSubmission(
                id=7,
                exam_id=3,
                student_id=7, # Aditya Roy
                status="graded",
                paper_file_url="/samples/math_exam_sample.svg",
                paper_file_name="Aditya_Roy_Term1_Paper.pdf",
                submitted_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                marks_obtained=45.0,
                percentage=45.0,
                teacher_feedback="Sign reversal errors during inequality division by negative terms.",
                graded_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                graded_by_teacher_id=2
            ),
        ]
        db.add_all(exam_submissions)

        # 24. Relational Persistence of Remedial Sprints
        sprints = [
            RemedialSprint(
                id=1,
                student_id=1,
                exam_id=1,
                subject="Mathematics",
                exam_score_pct=52.0,
                current_day=3,
                total_days=7,
                status="active",
                weak_concept="Quadratic Equations: Factorization by Splitting & Sign Distribution",
                diagnostic_summary="Aarav accurately factors positive binomial denominators, but drops negative signs when expanding LCM numerators.",
                scanned_artifacts_json=json.dumps({
                    "exam_paper": {
                        "file_name": "Aarav_Sharma_Math_Term1_Paper.pdf",
                        "file_url": "/samples/math_exam_sample.svg",
                        "flagged_questions": "Section B: Q7 & Q9"
                    },
                    "homework_backlogs": [
                        {
                            "task_id": 884,
                            "title": "Worksheet #4.2: Distributive Signs",
                            "status": "Late Submitted",
                            "score_impact": "Unpracticed sign distribution outside brackets"
                        }
                    ]
                }),
                plan_days_json=json.dumps([
                    {
                        "day_num": 1,
                        "day_label": "Day 1 (Mon)",
                        "title": "Standard Form & Quadratic Coefficient Identification",
                        "focus_task": "Watch 12-min AI video recap on ax² + bx + c = 0 and identify a, b, c for 6 equations.",
                        "resource": "Video: Quadratic Foundations & Sign Conventions (Portal)",
                        "status": "Completed",
                        "submission_required": True,
                        "parent_checklist": "Verified concept notes written in Math rough notebook.",
                        "questions": [
                            {
                                "question_number": "Problem 1",
                                "question_text": "Identify the coefficients a, b, and c in: 3x² - 5x + 2 = 0. State whether the middle coefficient is positive or negative.",
                                "rubric_key": "Check: a = 3, b = -5, c = 2. Verify negative sign on -5 is retained.",
                                "expected_solution": "a = 3, b = -5, c = 2. Middle coefficient is negative (-5)."
                            }
                        ]
                    },
                    {
                        "day_num": 2,
                        "day_label": "Day 2 (Tue)",
                        "title": "Splitting the Middle Term with Worked Examples",
                        "focus_task": "Work through 4 guided problems step-by-step with sign verification.",
                        "resource": "Worksheet 4.1: Middle Term Splitting Guide",
                        "status": "Completed",
                        "submission_required": True,
                        "parent_checklist": "Inspected 4 worked problems and signed study diary.",
                        "questions": [
                            {
                                "question_number": "Problem 1",
                                "question_text": "Solve for x by splitting the middle term: x² - 8x + 12 = 0.",
                                "rubric_key": "Check factors of 12 that sum to -8: must be -6 and -2.",
                                "expected_solution": "(x - 6)(x - 2) = 0 => x = 6 or x = 2."
                            }
                        ]
                    },
                    {
                        "day_num": 3,
                        "day_label": "Day 3 (Wed)",
                        "title": "Rough Notebook Practice: Negative Binomial LCM Expansion",
                        "focus_task": "Solve 4 intermediate algebraic fraction problems in rough notebook and upload work.",
                        "resource": "Worksheet 4.2: Distributive Signs",
                        "status": "In Progress",
                        "submission_required": True,
                        "parent_checklist": "Inspect 4 worked problems and verify minus sign distribution before signing.",
                        "questions": [
                            {
                                "question_number": "Problem 1",
                                "question_text": "Simplify: 5/(x - 2) - 3/(x + 1) = 0. Write out the expanded numerator before combining terms.",
                                "rubric_key": "Must show 5(x + 1) - 3(x - 2) = 5x + 5 - 3x + 6 = 2x + 11.",
                                "expected_solution": "5x + 5 - 3x + 6 = 2x + 11 = 0 => x = -11/2."
                            }
                        ]
                    }
                ]),
                parent_name="Mr. Rajesh Sharma",
                parent_phone="+91 98111 00003",
                parent_status="Co-Tracking Enrolled",
                teacher_verification_notes="Auto-enrolled upon Term 1 Exam publication (52%)."
            ),
            RemedialSprint(
                id=2,
                student_id=2,
                exam_id=1,
                subject="Mathematics",
                exam_score_pct=64.0,
                current_day=2,
                total_days=7,
                status="active",
                weak_concept="Sign Confusion in Middle Term Splitting",
                diagnostic_summary="Kabir scored 64% in Term 1 Math. Struggles when constant term c is negative.",
                scanned_artifacts_json=json.dumps({"exam_paper": {"file_name": "Kabir_Mehta_Math_Term1_Paper.pdf"}}),
                plan_days_json=json.dumps([{"day_num": 1, "day_label": "Day 1 (Mon)", "status": "Completed"}]),
                parent_name="Mrs. Rekha Mehta",
                parent_phone="+91 98555 44444",
                parent_status="Co-Tracking Enrolled",
                teacher_verification_notes="Auto-enrolled upon Term 1 Exam publication (64%)."
            )
        ]
        db.add_all(sprints)

        # 25. Question Papers (Academic Coordinator -> Teacher -> Exam Cell pipeline)
        papers = [
            QuestionPaper(
                id=1,
                title="Term 1 Mathematics Comprehensive Final",
                subject="Mathematics",
                class_name="Class 8",
                section="All",
                term="Term 1",
                blueprint_json=json.dumps({
                    "total_marks": 100,
                    "units": ["Linear Equations (25m)", "Quadratic Factoring (30m)", "Mensuration (25m)", "Data Handling (20m)"],
                    "bloom_taxonomy": {"knowledge_pct": 35, "application_pct": 45, "hots_pct": 20},
                    "duration_minutes": 180,
                    "calculator_allowed": False
                }),
                draft_file_url="/samples/Class8_Math_Term1_Final_QP.pdf",
                draft_file_name="Class8_Math_Term1_Final_QP.pdf",
                answer_key_url="/samples/Class8_Math_Term1_AnswerKey.pdf",
                status="sent_to_exam_cell",
                due_date="2026-10-18",
                created_by_teacher_id=2,
                created_by_teacher_name="Mrs. Ananya Verma",
                reviewed_by_academic_id=6,
                handed_over_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
            ),
            QuestionPaper(
                id=2,
                title="Term 1 General Science Evaluation",
                subject="General Science",
                class_name="Class 8",
                section="All",
                term="Term 1",
                blueprint_json=json.dumps({
                    "total_marks": 100,
                    "units": ["Force & Pressure (25m)", "Cell Structure (25m)", "Metals & Non-Metals (25m)", "Light (25m)"],
                    "bloom_taxonomy": {"knowledge_pct": 40, "application_pct": 40, "hots_pct": 20},
                    "duration_minutes": 180,
                    "calculator_allowed": False
                }),
                draft_file_url="/samples/Class8_Science_Term1_QP.pdf",
                draft_file_name="Class8_Science_Term1_QP.pdf",
                answer_key_url="/samples/Class8_Science_Term1_AnswerKey.pdf",
                status="sent_to_exam_cell",
                due_date="2026-10-19",
                created_by_teacher_id=12,
                created_by_teacher_name="Dr. K. Raman",
                reviewed_by_academic_id=6,
                handed_over_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            ),
            QuestionPaper(
                id=3,
                title="Class 9 Mathematics Mid-Term Review",
                subject="Mathematics",
                class_name="Class 9",
                section="All",
                term="Mid-Term",
                blueprint_json=json.dumps({
                    "total_marks": 80,
                    "units": ["Polynomials (20m)", "Coordinate Geometry (20m)", "Linear Equations in Two Variables (20m)", "Lines & Angles (20m)"],
                    "bloom_taxonomy": {"knowledge_pct": 30, "application_pct": 50, "hots_pct": 20},
                    "duration_minutes": 150
                }),
                draft_file_url="/samples/Class9_Math_MidTerm_Draft.pdf",
                draft_file_name="Class9_Math_MidTerm_Draft.pdf",
                answer_key_url=None,
                status="under_review",
                revision_notes="Please ensure question 14 includes an alternate OR sub-problem as per CBSE format.",
                due_date="2026-10-25",
                created_by_teacher_id=2,
                created_by_teacher_name="Mrs. Ananya Verma",
                reviewed_by_academic_id=6
            ),
            QuestionPaper(
                id=4,
                title="Class 8 English Language & Literature",
                subject="English Literature",
                class_name="Class 8",
                section="All",
                term="Term 1",
                blueprint_json=json.dumps({
                    "total_marks": 80,
                    "units": ["Reading Comprehension (20m)", "Writing Skills (20m)", "Grammar (15m)", "Literature (25m)"],
                    "bloom_taxonomy": {"knowledge_pct": 30, "application_pct": 40, "hots_pct": 30},
                    "duration_minutes": 180
                }),
                draft_file_url=None,
                draft_file_name=None,
                status="draft",
                due_date="2026-10-26",
                created_by_teacher_id=14,
                created_by_teacher_name="Mrs. Sunitha Rao"
            )
        ]
        db.add_all(papers)

        # 26. Exam Schedules with Hall & Invigilator Deployment
        schedules = [
            ExamSchedule(
                id=1,
                exam_id=1,
                title="Class 8-A, 8-B: Mathematics Term 1 Final",
                subject="Mathematics",
                class_name="Class 8-A, Class 8-B",
                exam_date="2026-10-28",
                start_time="09:00 AM",
                end_time="12:00 PM",
                hall_name="Hall A (Seats 1-80)",
                capacity=80,
                chief_invigilator_name="Mrs. Ananya Verma",
                academic_clearance=True,
                academic_clearance_notes="Cleared by Academic Coordinator: Syllabus 100% completed."
            ),
            ExamSchedule(
                id=2,
                exam_id=2,
                title="Class 8-A, 8-B: General Science Term 1 Final",
                subject="General Science",
                class_name="Class 8-A, Class 8-B",
                exam_date="2026-10-30",
                start_time="09:00 AM",
                end_time="12:00 PM",
                hall_name="Hall A & B (Seats 1-80)",
                capacity=80,
                chief_invigilator_name="Dr. K. Raman",
                academic_clearance=True,
                academic_clearance_notes="Cleared by Academic Coordinator: Lab practicals completed."
            ),
            ExamSchedule(
                id=3,
                exam_id=None,
                title="Class 9-A, 9-B: Mathematics Mid-Term",
                subject="Mathematics",
                class_name="Class 9-A, Class 9-B",
                exam_date="2026-11-02",
                start_time="09:00 AM",
                end_time="12:00 PM",
                hall_name="Rooms 201-204",
                capacity=70,
                chief_invigilator_name="Dr. Suresh Babu",
                academic_clearance=False,
                academic_clearance_notes="Pending Academic Coordinator review: Unit 4 revision scheduled on Oct 31."
            ),
            ExamSchedule(
                id=4,
                exam_id=None,
                title="Class 9-A, 9-B: English Communicative",
                subject="English Literature",
                class_name="Class 9-A, Class 9-B",
                exam_date="2026-11-04",
                start_time="09:00 AM",
                end_time="12:00 PM",
                hall_name="Rooms 301-304",
                capacity=70,
                chief_invigilator_name="Mrs. Sunitha Rao",
                academic_clearance=True,
                academic_clearance_notes="Cleared: Oral speaking assessments completed."
            )
        ]
        db.add_all(schedules)

        # 27. Consolidated Report Cards with Gemini AI Pedagogical Feedback
        cards = [
            ReportCard(
                id=1,
                student_id=1,
                student_name="Aarav Sharma",
                roll_no="14",
                class_name="Class 8",
                section="B",
                term="Term 1",
                academic_year="2025-2026",
                grades_grid_json=json.dumps({
                    "Mathematics": {"score": 52.0, "max": 100, "grade": "C1", "remedial_flag": True, "remarks": "Lapses in quadratic signs; enrolled in 1-week focus sprint."},
                    "General Science": {"score": 78.0, "max": 100, "grade": "B1", "remedial_flag": False, "remarks": "High conceptual clarity in force & mechanics."},
                    "English Literature": {"score": 84.0, "max": 100, "grade": "A2", "remedial_flag": False, "remarks": "Expressive narrative structure and rich vocabulary."},
                    "Social Science": {"score": 76.0, "max": 100, "grade": "B1", "remedial_flag": False, "remarks": "Thorough understanding of historical timelines."},
                    "Hindi / Second Language": {"score": 82.0, "max": 100, "grade": "A2", "remedial_flag": False, "remarks": "Good grammatical application and poetic analysis."}
                }),
                total_marks_obtained=372.0,
                max_total_marks=500.0,
                overall_percentage=74.4,
                overall_grade="B1",
                attendance_pct=91.4,
                ai_teacher_narrative="Aarav shows exemplary analytical curiosity and performs consistently across humanities and languages. While foundational arithmetic is sound, he experienced conceptual lapses in quadratic sign distribution during the Term 1 examination. His active participation in the 1-Week Remedial sprint and 91.4% attendance indicate a positive trajectory toward mastery.",
                is_moderated=True,
                is_published=True,
                published_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            ),
            ReportCard(
                id=2,
                student_id=2,
                student_name="Kabir Mehta",
                roll_no="15",
                class_name="Class 8",
                section="B",
                term="Term 1",
                academic_year="2025-2026",
                grades_grid_json=json.dumps({
                    "Mathematics": {"score": 64.0, "max": 100, "grade": "B2", "remedial_flag": True, "remarks": "Factorization needs practice; participating in focus sprint."},
                    "General Science": {"score": 62.0, "max": 100, "grade": "B2", "remedial_flag": True, "remarks": "Needs more attention on chemical formula balancing."},
                    "English Literature": {"score": 70.0, "max": 100, "grade": "B1", "remedial_flag": False, "remarks": "Good reading comprehension; can improve spelling."},
                    "Social Science": {"score": 65.0, "max": 100, "grade": "B2", "remedial_flag": True, "remarks": "Map pointing and geographical zones need revision."},
                    "Hindi / Second Language": {"score": 60.0, "max": 100, "grade": "C1", "remedial_flag": True, "remarks": "Needs regular prose reading habit."}
                }),
                total_marks_obtained=321.0,
                max_total_marks=500.0,
                overall_percentage=64.2,
                overall_grade="B2",
                attendance_pct=72.0,
                ai_teacher_narrative="Kabir possesses good creative potential but attendance inconsistency (72%) has affected his grasp of multi-step problem solving. Focused effort on the middle-term splitting remedial plan and regular school attendance will unlock his full academic potential.",
                is_moderated=True,
                is_published=True,
                published_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            ),
            ReportCard(
                id=3,
                student_id=3,
                student_name="Diya Patel",
                roll_no="18",
                class_name="Class 8",
                section="B",
                term="Term 1",
                academic_year="2025-2026",
                grades_grid_json=json.dumps({
                    "Mathematics": {"score": 94.0, "max": 100, "grade": "A1", "remedial_flag": False, "remarks": "Outstanding problem solving and algebraic reasoning."},
                    "General Science": {"score": 92.0, "max": 100, "grade": "A1", "remedial_flag": False, "remarks": "Exemplary lab work and experimental design."},
                    "English Literature": {"score": 90.0, "max": 100, "grade": "A1", "remedial_flag": False, "remarks": "Sophisticated essay composition and literary analysis."},
                    "Social Science": {"score": 95.0, "max": 100, "grade": "A1", "remedial_flag": False, "remarks": "Exceptional historical analysis and cartography."},
                    "Hindi / Second Language": {"score": 91.5, "max": 100, "grade": "A1", "remedial_flag": False, "remarks": "Flawless grammar and poetic appreciation."}
                }),
                total_marks_obtained=462.5,
                max_total_marks=500.0,
                overall_percentage=92.5,
                overall_grade="A1",
                attendance_pct=96.0,
                ai_teacher_narrative="Diya continues to be an academic pacesetter with exemplary rigor and 96% attendance. Her problem-solving precision in mathematics and critical thinking across social sciences position her as a class leader. Recommended for advanced olympiad training.",
                is_moderated=True,
                is_published=True,
                published_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
            )
        ]
        db.add_all(cards)

        # 26. Initial Real-Time Institutional Notifications (All 8 Online Schooling Roles)
        initial_notifications = [
            # --- Role 1: Teacher (Mrs. Ananya Verma - User ID: 2) ---
            Notification(
                recipient_user_id=2,
                recipient_role="teacher",
                sender_name="Academic Coordinator",
                sender_role="academic_coordinator",
                title="Proxy Substitution Assigned: Period 3",
                message="You have been assigned as proxy cover for Class 8-B (Mathematics) replacing absent colleague Dr. Raman.",
                notification_type="PROXY_ASSIGNED",
                priority="CRITICAL",
                action_url="/teacher?tab=schedule",
                metadata_json=json.dumps({"period_number": 3, "class_name": "Class 8-B"}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
            ),
            Notification(
                recipient_user_id=2,
                recipient_role="teacher",
                sender_name="Exam Outcomes Engine",
                sender_role="system",
                title="Remedial Solution Submitted: Aarav Sharma",
                message="Aarav Sharma uploaded rough practice notebook for Day 2 Quadratic Factoring. Ready for SpeedGrader inspection.",
                notification_type="REMEDIAL_SUBMISSION",
                priority="URGENT",
                action_url="/teacher/focus/1?tab=remedial&day=2",
                metadata_json=json.dumps({"student_id": 1, "day": 2}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=25)
            ),
            Notification(
                recipient_user_id=2,
                recipient_role="teacher",
                sender_name="Prof. Rajeshwari Nair",
                sender_role="academic_coordinator",
                title="Commissioned: Term 1 Mathematics Blueprint",
                message="Prof. Rajeshwari Nair has commissioned the Class 8-B Term 1 Mathematics paper blueprint. Max Marks: 80.",
                notification_type="QP_ASSIGNED",
                priority="NORMAL",
                action_url="/teacher?tab=exams_gradebook&subtab=qp_desk&paperId=1",
                metadata_json=json.dumps({"paper_id": 1, "subject": "Mathematics", "class_name": "Class 8-B"}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            ),

            # --- Role 2: Student (Aarav Sharma - User ID: 4) ---
            Notification(
                recipient_user_id=4,
                recipient_role="student",
                sender_name="Live Class Engine",
                sender_role="system",
                title="Live Mathematics Starting in 10 Mins",
                message="Class 8-B Mathematics live virtual room is open. Session begins promptly at 10:00 AM.",
                notification_type="LIVE_CLASS_COUNTDOWN",
                priority="CRITICAL",
                action_url="/student/live-class/1",
                metadata_json=json.dumps({"class_id": 1, "subject": "Mathematics"}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=5)
            ),
            Notification(
                recipient_user_id=4,
                recipient_role="student",
                sender_name="Mrs. Ananya Verma",
                sender_role="teacher",
                title="Homework Corrections Requested",
                message="Mrs. Ananya Verma reviewed your Chapter 4 Homework and added red-pen feedback on Q3. Please review.",
                notification_type="HOMEWORK_RETURNED",
                priority="URGENT",
                action_url="/student?tab=homework&id=4",
                metadata_json=json.dumps({"homework_id": 4}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1)
            ),
            Notification(
                recipient_user_id=4,
                recipient_role="student",
                sender_name="Focus Sprint System",
                sender_role="system",
                title="Remedial Day 2 Worksheet Ready",
                message="Step-by-step guided worksheet for quadratic formulas is unlocked on your dashboard.",
                notification_type="REMEDIAL_DAY_READY",
                priority="NORMAL",
                action_url="/student?tab=remedial&day=2",
                metadata_json=json.dumps({"day": 2}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=3)
            ),

            # --- Role 3: Parent (Mr. Rajesh Sharma - User ID: 3) ---
            Notification(
                recipient_user_id=3,
                recipient_role="parent",
                sender_name="Exam Outcomes Engine",
                sender_role="system",
                title="Focus Table Action Plan Sign-off",
                message="7-Day Remedial Action Sprint generated for Aarav in Term 1 Math (Score: 58%). Parent review required.",
                notification_type="FOCUS_PLAN_REVIEW",
                priority="URGENT",
                action_url="/parent?tab=academics&view=focus-plan",
                metadata_json=json.dumps({"student_name": "Aarav Sharma"}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=30)
            ),
            Notification(
                recipient_user_id=3,
                recipient_role="parent",
                sender_name="Accounts Bursar",
                sender_role="accounts_coordinator",
                title="Tuition Fee Milestone Overdue",
                message="Quarter 3 Tuition Fee ₹18,500 is overdue for Aarav Sharma. Pay online to prevent exam hold.",
                notification_type="FEE_OVERDUE",
                priority="CRITICAL",
                action_url="/parent?tab=finance&action=pay",
                metadata_json=json.dumps({"amount": 18500.0}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=4)
            ),

            # --- Role 4: Admin (Dr. Sunita Kapoor - User ID: 1) ---
            Notification(
                recipient_user_id=1,
                recipient_role="admin",
                sender_name="Curriculum Pacing Engine",
                sender_role="system",
                title="Syllabus Lag Escalation: Class 8-B Science",
                message="Class 8-B Science (Dr. Suresh Babu) has fallen 2 units behind CBSE calendar milestone.",
                notification_type="PACING_LAG_CRITICAL",
                priority="URGENT",
                action_url="/admin?tab=curriculum&view=pacing",
                metadata_json=json.dumps({"class_name": "Class 8-B", "lag_units": 2}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=40)
            ),
            Notification(
                recipient_user_id=1,
                recipient_role="admin",
                sender_name="Admissions CRM",
                sender_role="admissions_coordinator",
                title="VIP Trustee Referral Inquiry Logged",
                message="Admissions enquiry from Board Trustee referral awaiting priority review and tour scheduling.",
                notification_type="VIP_REFERRAL",
                priority="URGENT",
                action_url="/admin?tab=crm&filter=vip",
                metadata_json=json.dumps({"lead_name": "Rohan Malhotra"}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            ),

            # --- Role 5: Academic Coordinator (Prof. Rajeshwari Nair - User ID: 6) ---
            Notification(
                recipient_user_id=6,
                recipient_role="academic_coordinator",
                sender_name="Timetable Governor",
                sender_role="system",
                title="Unmanned Period Alert: Period 3 Class 8-B",
                message="Dr. Raman approved medical leave. Class 8-B Period 3 needs substitute faculty coverage.",
                notification_type="UNMANNED_PERIOD",
                priority="CRITICAL",
                action_url="/admin?tab=substitutions",
                metadata_json=json.dumps({"period": 3, "class": "Class 8-B"}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=15)
            ),
            Notification(
                recipient_user_id=6,
                recipient_role="academic_coordinator",
                sender_name="Dr. Suresh Babu",
                sender_role="teacher",
                title="Faculty Workload Relief Requested",
                message="Dr. Suresh Babu requested +48h SLA extension on Mid-Term Lab Practical grading.",
                notification_type="TASK_RELIEF_REQUESTED",
                priority="URGENT",
                action_url="/admin?tab=tasks&filter=relief-requested",
                metadata_json=json.dumps({"task_id": 2}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=1)
            ),

            # --- Role 6: Admissions Coordinator (Ms. Sneha Kulkarni - User ID: 10) ---
            Notification(
                recipient_user_id=10,
                recipient_role="admissions_coordinator",
                sender_name="Online Admissions Portal",
                sender_role="system",
                title="Virtual Campus Tour Scheduled",
                message="Live 1-on-1 virtual curriculum tour scheduled via Zoom for tomorrow 4:00 PM with Parent Rajesh.",
                notification_type="TOUR_SCHEDULED",
                priority="URGENT",
                action_url="/admin?tab=crm&view=tours",
                metadata_json=json.dumps({"enquiry_id": 8}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=20)
            ),
            Notification(
                recipient_user_id=10,
                recipient_role="admissions_coordinator",
                sender_name="Accounts Desk",
                sender_role="accounts_coordinator",
                title="Admission Registration Fee Cleared",
                message="Candidate Aarav Kumar completed ₹25,000 admission payment. Assign roll number and section.",
                notification_type="NEW_ENROLMENT",
                priority="CRITICAL",
                action_url="/admin?tab=crm&action=enrol",
                metadata_json=json.dumps({"student_name": "Aarav Kumar"}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            ),

            # --- Role 7: Accounts Coordinator (Mr. Arvind Krishnan - User ID: 11) ---
            Notification(
                recipient_user_id=11,
                recipient_role="accounts_coordinator",
                sender_name="Online Fee Gateway",
                sender_role="system",
                title="Online Fee Payment Received: ₹45,000",
                message="Term 2 Tuition Fee cleared for Aarav Sharma (Txn: TXN-8921). Digital cryptographic seal generated.",
                notification_type="PAYMENT_RECEIVED",
                priority="NORMAL",
                action_url="/finance?tab=receipts&id=1",
                metadata_json=json.dumps({"amount": 45000.0, "student_id": 1}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
            ),
            Notification(
                recipient_user_id=11,
                recipient_role="accounts_coordinator",
                sender_name="Exam Controller",
                sender_role="exam_coordinator",
                title="Exam Hall Ticket Hold Applied",
                message="Term 1 examination cell active. 14 fee defaulters placed on automated hall ticket lock.",
                notification_type="EXAM_HOLD_TRIGGERED",
                priority="CRITICAL",
                action_url="/finance?tab=defaulters",
                metadata_json=json.dumps({"defaulter_count": 14}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=3)
            ),

            # --- Role 8: Exam Coordinator (Dr. Hemanth Sen - User ID: 8) ---
            Notification(
                recipient_user_id=8,
                recipient_role="exam_coordinator",
                sender_name="Examination Cell",
                sender_role="system",
                title="Exam Cycle Concluded: 5-Day Moderation SLA",
                message="Term 1 examination cycle ended. 5-Day SLA countdown started for all subject teachers to submit verified marks.",
                notification_type="MODERATION_START",
                priority="CRITICAL",
                action_url="/exams?tab=moderation",
                metadata_json=json.dumps({"sla_days": 5}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=50)
            ),
            Notification(
                recipient_user_id=8,
                recipient_role="exam_coordinator",
                sender_name="Academic Verification",
                sender_role="academic_coordinator",
                title="Strongroom Custody: Term 1 Mathematics",
                message="Term 1 Mathematics Paper has received Academic Clearance. Strongroom vault lock sealed.",
                notification_type="QP_IN_VAULT",
                priority="NORMAL",
                action_url="/exam_coordinator?tab=vault",
                metadata_json=json.dumps({"paper_id": 1}),
                is_read=False,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2)
            )
        ]
        db.add_all(initial_notifications)

        # 16. Finance & Accounts Coordinator Domain
        initial_defaulters = [
            FeeDefaulter(
                student_id=1,
                student_name="Aarav Sharma",
                class_name="Class 8-B",
                roll_no="14",
                parent_name="Mr. Rajesh Sharma",
                parent_phone="+91 98111 00003",
                milestone_title="Milestone 2: Term 2 Tuition & Transport Fee",
                amount_due=18500.0,
                days_overdue=22,
                reminder_sent=True,
                reminder_count=2,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                waiver_amount=0.0,
                status="Overdue",
                notes="Parent requested extension till 25th of current month."
            ),
            FeeDefaulter(
                student_id=2,
                student_name="Kabir Mehta",
                class_name="Class 8-B",
                roll_no="15",
                parent_name="Mrs. Rekha Mehta",
                parent_phone="+91 98555 44444",
                milestone_title="Milestone 2: Term 2 Tuition & Transport Fee",
                amount_due=18500.0,
                days_overdue=48,
                reminder_sent=True,
                reminder_count=4,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                waiver_amount=2500.0,
                waiver_reason="Merit & Sports Hardship Concession approved by Principal",
                waiver_approved_by="Dr. Sunita Kapoor",
                status="Partially Paid",
                notes="Remaining dues: ₹16,000. Second installment expected next Monday."
            ),
            FeeDefaulter(
                student_id=19,
                student_name="Siddharth Verma",
                class_name="Class 8-A",
                roll_no="22",
                parent_name="Mr. Alok Verma",
                parent_phone="+91 98777 55555",
                milestone_title="Milestone 2: Term 2 Tuition Fee",
                amount_due=14000.0,
                days_overdue=9,
                reminder_sent=False,
                reminder_count=0,
                status="Overdue",
                notes="First reminder due to be sent this week."
            ),
            FeeDefaulter(
                student_id=20,
                student_name="Rohan Iyer",
                class_name="Class 8-A",
                roll_no="24",
                parent_name="Mrs. Meenakshi Iyer",
                parent_phone="+91 98333 22222",
                milestone_title="Milestone 1 & 2 Combined Dues",
                amount_due=32500.0,
                days_overdue=64,
                reminder_sent=True,
                reminder_count=5,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                status="Overdue",
                notes="SLA Escalation required. Bursar telephonic meeting requested."
            ),
            FeeDefaulter(
                student_id=21,
                student_name="Ananya Gupta",
                class_name="Class 9-A",
                roll_no="08",
                parent_name="Mr. Pradeep Gupta",
                parent_phone="+91 98444 33333",
                milestone_title="Milestone 2: Term 2 Science Lab Fee",
                amount_due=6500.0,
                days_overdue=12,
                reminder_sent=True,
                reminder_count=1,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=5),
                status="Overdue",
                notes="Parent promised NEFT transfer by weekend."
            ),
            FeeDefaulter(
                student_id=22,
                student_name="Aditya Roy",
                class_name="Class 9-B",
                roll_no="11",
                parent_name="Mrs. Sangeeta Roy",
                parent_phone="+91 98888 66666",
                milestone_title="Milestone 2: Term 2 Tuition Fee",
                amount_due=15500.0,
                days_overdue=35,
                reminder_sent=True,
                reminder_count=3,
                last_reminder_at=datetime.datetime.utcnow() - datetime.timedelta(days=4),
                status="Overdue",
                notes="Pending UPI clearance from parent side."
            )
        ]
        db.add_all(initial_defaulters)

        initial_txs = [
            PaymentTransaction(
                utr_number="UPI/329481920192/AXIS",
                student_name="Aarav Sharma",
                class_name="Class 8-B",
                parent_name="Mr. Rajesh Sharma",
                amount=22000.0,
                payment_method="UPI",
                bank_name="Axis Bank",
                milestone_title="Milestone 1: Term 1 Tuition & Curriculum Fee",
                status="Success",
                reconciled=True,
                reconciled_at=datetime.datetime.utcnow() - datetime.timedelta(days=45),
                reconciled_by="Mr. Arvind Krishnan",
                gateway_ref="pay_OnbZ182947192"
            ),
            PaymentTransaction(
                utr_number="UPI/402918471902/HDFC",
                student_name="Diya Patel",
                class_name="Class 8-B",
                parent_name="Dr. Vikram Patel",
                amount=18500.0,
                payment_method="UPI",
                bank_name="HDFC Bank",
                milestone_title="Milestone 2: Term 2 Tuition & Transport Fee",
                status="Success",
                reconciled=False,
                gateway_ref="pay_PlmQ829104812",
                notes="Awaiting statement import from HDFC Corporate Portal"
            ),
            PaymentTransaction(
                utr_number="NET/592810482910/ICICI",
                student_name="Siddharth Verma",
                class_name="Class 8-A",
                parent_name="Mr. Alok Verma",
                amount=22000.0,
                payment_method="NetBanking",
                bank_name="ICICI Bank",
                milestone_title="Milestone 1: Term 1 Tuition Fee",
                status="Success",
                reconciled=True,
                reconciled_at=datetime.datetime.utcnow() - datetime.timedelta(days=30),
                reconciled_by="Mr. Arvind Krishnan"
            ),
            PaymentTransaction(
                utr_number="UPI/582910492819/SBIN",
                student_name="Ananya Gupta",
                class_name="Class 9-A",
                parent_name="Mr. Pradeep Gupta",
                amount=15500.0,
                payment_method="UPI",
                bank_name="State Bank of India",
                milestone_title="Milestone 1: Term 1 Tuition Fee",
                status="Success",
                reconciled=False,
                gateway_ref="pay_TybN938102941",
                notes="UTR matches Razorpay webhook, pending batch signoff"
            ),
            PaymentTransaction(
                utr_number="CARD/849102847192/VISA",
                student_name="Aditya Roy",
                class_name="Class 9-B",
                parent_name="Mrs. Sangeeta Roy",
                amount=22000.0,
                payment_method="Credit Card",
                bank_name="Standard Chartered",
                milestone_title="Milestone 1: Term 1 Tuition Fee",
                status="Success",
                reconciled=False,
                gateway_ref="pay_KzxW710294812",
                notes="T+2 settlement batch cleared"
            ),
            PaymentTransaction(
                utr_number="NEFT/CMS92810482910/KOTAK",
                student_name="Tanvi Deshmukh",
                class_name="Class 7-A",
                parent_name="Dr. Suresh Deshmukh",
                amount=38000.0,
                payment_method="NEFT",
                bank_name="Kotak Mahindra Bank",
                milestone_title="Full Annual Tuition & Transport",
                status="Success",
                reconciled=False,
                notes="CMS batch credit received in current account"
            )
        ]
        db.add_all(initial_txs)

        initial_vendor_invoices = [
            VendorInvoice(
                invoice_no="INV-2026-FL-084",
                vendor_name="Bharat Petroleum Corporation (Fleet)",
                vendor_category="Transport & Fuel",
                invoice_for="High-Speed Diesel for 14 School Bus Routes (Month of Oct)",
                amount=148500.0,
                invoice_date="18 Oct 2026",
                due_date="28 Oct 2026",
                status="Approved for Wire",
                authorized_by="Dr. Sunita Kapoor (Principal)",
                authorized_at=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                payment_mode="RTGS",
                notes="Fuel log logs verified against GPS telemetry."
            ),
            VendorInvoice(
                invoice_no="INV-2026-LB-109",
                vendor_name="National Scientific Equipment & Reagents",
                vendor_category="Laboratory Supplies",
                invoice_for="Class 8-10 Composite Science & Chemistry Lab Consumables",
                amount=42600.0,
                invoice_date="12 Oct 2026",
                due_date="26 Oct 2026",
                status="Pending Approval",
                notes="Awaiting inventory sign-off from Mrs. Shalini Rao."
            ),
            VendorInvoice(
                invoice_no="INV-2026-IT-215",
                vendor_name="EduCloud Infotech Solutions",
                vendor_category="Software & IT",
                invoice_for="High-Speed Campus Leased Line & Firewall Licensing Q3",
                amount=68000.0,
                invoice_date="15 Oct 2026",
                due_date="30 Oct 2026",
                status="Approved for Wire",
                authorized_by="Dr. Sunita Kapoor (Principal)",
                authorized_at=datetime.datetime.utcnow() - datetime.timedelta(hours=6),
                payment_mode="NEFT",
                notes="SLA uptime verified at 99.8%."
            ),
            VendorInvoice(
                invoice_no="INV-2026-CT-092",
                vendor_name="Annapurna Institutional Catering",
                vendor_category="Cafeteria & Dining",
                invoice_for="Mid-Day Student Meal Program & Staff Refreshments",
                amount=96400.0,
                invoice_date="05 Oct 2026",
                due_date="20 Oct 2026",
                status="Paid",
                authorized_by="Dr. Sunita Kapoor (Principal)",
                authorized_at=datetime.datetime.utcnow() - datetime.timedelta(days=10),
                payment_utr="RTGS/SBIN202610190829104",
                paid_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                payment_mode="RTGS",
                notes="Paid and voucher attached."
            ),
            VendorInvoice(
                invoice_no="INV-2026-SC-301",
                vendor_name="Eagle Eye Security & Facilities Ltd",
                vendor_category="Security & Maintenance",
                invoice_for="Campus Guard Staffing (Day/Night 12 Guards) & Sanitization",
                amount=124000.0,
                invoice_date="20 Oct 2026",
                due_date="02 Nov 2026",
                status="Audit Clearance Needed",
                notes="Biometric duty roster variance under review by Administrative Officer."
            )
        ]
        db.add_all(initial_vendor_invoices)

        initial_dispatch_logs = [
            FinanceDispatchLog(
                dispatch_type="WhatsApp",
                dispatch_scope="Tier 30+ Days (High Arrears)",
                target_count=3,
                total_amount_targeted=66500.0,
                dispatch_note="Dispatched customized WhatsApp payment links with late-fee grace waiver notice.",
                dispatched_by="Mr. Arvind Krishnan",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            ),
            FinanceDispatchLog(
                dispatch_type="SMS",
                dispatch_scope="All Defaulters (16-30 Days)",
                target_count=8,
                total_amount_targeted=134000.0,
                dispatch_note="Standard automated SMS reminder with school banking gateway URL.",
                dispatched_by="Mr. Arvind Krishnan",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
            )
        ]
        db.add_all(initial_dispatch_logs)

        # 16. Outflow: Monthly Staff Payroll Engine
        oct_batch = PayrollBatch(
            id=1,
            payroll_month="October 2026",
            total_staff_count=7,
            gross_total=391000.0,
            total_deductions=45920.0,
            net_payable=345080.0,
            status="Audit Pending",
            notes="Statutory deductions (PF 12%, PT ₹200, TDS) computed based on biometric attendance."
        )
        db.add(oct_batch)
        await db.flush()

        initial_payslips = [
            StaffPayslip(
                id=1,
                batch_id=oct_batch.id,
                staff_id=2,  # Mrs. Ananya Verma
                staff_name="Mrs. Ananya Verma",
                role_designation="Senior Mathematics Teacher & Homeroom Head",
                department="Mathematics & Secondary Academics",
                bank_account_no="918204918201",
                bank_ifsc="HDFC0001824",
                basic_salary=42000.0,
                hra_allowance=12600.0,
                special_allowance=7400.0,
                gross_earnings=62000.0,
                provident_fund=5040.0,
                professional_tax=200.0,
                income_tax_tds=2500.0,
                loss_of_pay_days=0,
                loss_of_pay_deduction=0.0,
                total_deductions=7740.0,
                net_salary=54260.0,
                disbursement_status="Pending"
            ),
            StaffPayslip(
                id=2,
                batch_id=oct_batch.id,
                staff_id=1,  # Dr. Sunita Kapoor
                staff_name="Dr. Sunita Kapoor",
                role_designation="Principal & Institutional Director",
                department="Executive Leadership",
                bank_account_no="918204918202",
                bank_ifsc="HDFC0001824",
                basic_salary=65000.0,
                hra_allowance=22750.0,
                special_allowance=17250.0,
                gross_earnings=105000.0,
                provident_fund=7800.0,
                professional_tax=200.0,
                income_tax_tds=11000.0,
                loss_of_pay_days=0,
                loss_of_pay_deduction=0.0,
                total_deductions=19000.0,
                net_salary=86000.0,
                disbursement_status="Pending"
            ),
            StaffPayslip(
                id=3,
                batch_id=oct_batch.id,
                staff_id=12,  # Dr. K. Raman
                staff_name="Dr. K. Raman",
                role_designation="Head of Department - Physics",
                department="Science & Laboratories",
                bank_account_no="918204918203",
                bank_ifsc="HDFC0001824",
                basic_salary=40000.0,
                hra_allowance=12000.0,
                special_allowance=6000.0,
                gross_earnings=58000.0,
                provident_fund=4800.0,
                professional_tax=200.0,
                income_tax_tds=2100.0,
                loss_of_pay_days=0,
                loss_of_pay_deduction=0.0,
                total_deductions=7100.0,
                net_salary=50900.0,
                disbursement_status="Pending"
            ),
            StaffPayslip(
                id=4,
                batch_id=oct_batch.id,
                staff_id=7,  # Mr. Vikram Malhotra
                staff_name="Mr. Vikram Malhotra",
                role_designation="Fleet & Logistics Coordinator",
                department="Transport & Campus Safety",
                bank_account_no="918204918204",
                bank_ifsc="HDFC0001824",
                basic_salary=32000.0,
                hra_allowance=9600.0,
                special_allowance=4400.0,
                gross_earnings=46000.0,
                provident_fund=3840.0,
                professional_tax=200.0,
                income_tax_tds=1200.0,
                loss_of_pay_days=0,
                loss_of_pay_deduction=0.0,
                total_deductions=5240.0,
                net_salary=40760.0,
                disbursement_status="Pending"
            ),
            StaffPayslip(
                id=5,
                batch_id=oct_batch.id,
                staff_id=9,  # Mrs. Shalini Rao
                staff_name="Mrs. Shalini Rao",
                role_designation="Store & Asset Inventory Custodian",
                department="Inventory & Facilities",
                bank_account_no="918204918205",
                bank_ifsc="HDFC0001824",
                basic_salary=30000.0,
                hra_allowance=9000.0,
                special_allowance=4000.0,
                gross_earnings=43000.0,
                provident_fund=3600.0,
                professional_tax=200.0,
                income_tax_tds=900.0,
                loss_of_pay_days=0,
                loss_of_pay_deduction=0.0,
                total_deductions=4700.0,
                net_salary=38300.0,
                disbursement_status="Pending"
            ),
            StaffPayslip(
                id=6,
                batch_id=oct_batch.id,
                staff_id=11,  # Mr. Arvind Krishnan
                staff_name="Mr. Arvind Krishnan",
                role_designation="Accounts Coordinator & Senior Bursar",
                department="Finance & Accounts",
                bank_account_no="918204918206",
                bank_ifsc="HDFC0001824",
                basic_salary=36000.0,
                hra_allowance=10800.0,
                special_allowance=5200.0,
                gross_earnings=52000.0,
                provident_fund=4320.0,
                professional_tax=200.0,
                income_tax_tds=1800.0,
                loss_of_pay_days=0,
                loss_of_pay_deduction=0.0,
                total_deductions=6320.0,
                net_salary=45680.0,
                disbursement_status="Pending"
            ),
            StaffPayslip(
                id=7,
                batch_id=oct_batch.id,
                staff_id=99,  # Driver Ramesh Kumar
                staff_name="Ramesh Kumar",
                role_designation="Senior School Bus Pilot (Route 4)",
                department="Transport Fleet",
                bank_account_no="918204918207",
                bank_ifsc="HDFC0001824",
                basic_salary=18000.0,
                hra_allowance=4500.0,
                special_allowance=2500.0,
                gross_earnings=25000.0,
                provident_fund=2160.0,
                professional_tax=200.0,
                income_tax_tds=0.0,
                loss_of_pay_days=0,
                loss_of_pay_deduction=0.0,
                total_deductions=2360.0,
                net_salary=22640.0,
                disbursement_status="Pending"
            )
        ]
        db.add_all(initial_payslips)

        # 17. Outflow: Store Procurement & 3-Way Match Purchase Orders
        initial_pos = [
            PurchaseOrder(
                id=1,
                po_number="PO-2026-OCT-008",
                department="Science Laboratories",
                vendor_name="Borosil Scientific Supplies Ltd",
                items_json=json.dumps([
                    {"item_name": "Borosilicate Beakers 250ml (Pack of 20)", "quantity": 5, "unit_price": 1400.0, "total": 7000.0},
                    {"item_name": "Concave & Convex Lens Kit with Optical Bench", "quantity": 10, "unit_price": 850.0, "total": 8500.0}
                ]),
                total_amount=15500.0,
                expected_delivery_date="20 Oct 2026",
                status="GRN Verified",
                grn_number="GRN-2026-OCT-041",
                grn_verified_by="Mrs. Shalini Rao (Store Lead)",
                grn_verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                linked_invoice_no="INV-2026-BS-88",
                notes="Delivered to Physics lab storage rack 3. 3-Way Match complete."
            ),
            PurchaseOrder(
                id=2,
                po_number="PO-2026-OCT-014",
                department="Sports & Athletics",
                vendor_name="Decathlon Institutional Direct",
                items_json=json.dumps([
                    {"item_name": "Match Size Footballs (FIFA Basic)", "quantity": 15, "unit_price": 1200.0, "total": 18000.0},
                    {"item_name": "Badminton Rackets & Tournament Feather Shuttles", "quantity": 20, "unit_price": 950.0, "total": 19000.0}
                ]),
                total_amount=37000.0,
                expected_delivery_date="26 Oct 2026",
                status="Issued",
                notes="Pending delivery from Decathlon logistics hub. Gate pass prepared."
            ),
            PurchaseOrder(
                id=3,
                po_number="PO-2026-OCT-019",
                department="Examination & Stationary Stores",
                vendor_name="Navneet Stationery Mart",
                items_json=json.dumps([
                    {"item_name": "CBSE Standard 32-Page Ruled Answer Booklets", "quantity": 2000, "unit_price": 18.0, "total": 36000.0},
                    {"item_name": "Whiteboard Markers & Dustless Chalk Cartons", "quantity": 50, "unit_price": 120.0, "total": 6000.0}
                ]),
                total_amount=42000.0,
                expected_delivery_date="19 Oct 2026",
                status="GRN Verified",
                grn_number="GRN-2026-OCT-055",
                grn_verified_by="Mrs. Shalini Rao (Store Lead)",
                grn_verified_at=datetime.datetime.utcnow() - datetime.timedelta(days=3),
                linked_invoice_no="INV-2026-NV-109",
                notes="Checked against packing slip. Clean match ready for payment batch."
            )
        ]
        db.add_all(initial_pos)

        # 18. Outflow: Yellow Bus Fleet Maintenance & Fuel AMC
        initial_fleet_expenses = [
            FleetExpenseRecord(
                id=1,
                vehicle_no="KA-01-EA-4412",
                bus_route="Route 1 - Indiranagar Express",
                expense_type="Fuel Refill (Diesel 180L)",
                vendor_name="Indian Oil Corporation Ltd",
                amount=16200.0,
                status="Approved for Wire",
                invoice_ref="IOC-OCT-9921",
                logged_by="Mr. Vikram Malhotra (Transport Lead)",
                due_date="28 Oct 2026",
                notes="Standard monthly diesel supply under bulk commercial agreement."
            ),
            FleetExpenseRecord(
                id=2,
                vehicle_no="KA-01-EA-4418",
                bus_route="Route 4 - Whitefield Corridor",
                expense_type="RTO Fitness & Speed Governor AMC",
                vendor_name="Karnataka State RTO Auto Services",
                amount=8400.0,
                status="Approved for Wire",
                invoice_ref="RTO-FIT-2026-04",
                logged_by="Mr. Vikram Malhotra (Transport Lead)",
                due_date="25 Oct 2026",
                notes="Mandatory annual fitness certificate renewal before inter-school excursion."
            ),
            FleetExpenseRecord(
                id=3,
                vehicle_no="KA-01-EA-4422",
                bus_route="Route 7 - Koramangala Ring Road",
                expense_type="Brake Pad Replacement & Air Filter Service",
                vendor_name="Ashok Leyland Authorized Depot",
                amount=22500.0,
                status="Pending Clearance",
                invoice_ref="AL-DEPOT-883",
                logged_by="Mr. Vikram Malhotra (Transport Lead)",
                due_date="30 Oct 2026",
                notes="Diagnostic report attached: Rear brake liners worn down to 2mm."
            ),
            FleetExpenseRecord(
                id=4,
                vehicle_no="KA-01-EA-4415",
                bus_route="Route 2 - Jayanagar Circle",
                expense_type="Commercial Bus Fleet Insurance Policy",
                vendor_name="New India Assurance Co.",
                amount=48000.0,
                status="Paid",
                invoice_ref="NIA-POL-55410",
                payment_utr="RTGS/SBIN2026101890214",
                paid_at=datetime.datetime.utcnow() - datetime.timedelta(days=4),
                logged_by="Mr. Vikram Malhotra (Transport Lead)",
                due_date="15 Oct 2026",
                notes="Comprehensive zero-depreciation policy renewed for 2026-27."
            )
        ]
        db.add_all(initial_fleet_expenses)

        # 26. Inventory & Asset Ledger (Lab Consumables, IT Hardware, Sports, Books)
        initial_inventory = [
            InventoryItem(
                id=1,
                asset_tag="CON-CHEM-001",
                name="Hydrochloric Acid (HCl 35% Analytical Grade)",
                category="Lab Consumable",
                sub_category="Chemistry Reagents",
                location="Chemistry Lab 2 Acid Locker",
                total_stock=5,
                available_stock=2,
                issued_count=3,
                damaged_count=0,
                reorder_level=5,
                unit_of_measure="Litres",
                unit_cost=320.0,
                amc_vendor="Apex Scientific Co.",
                condition="Low Buffer",
                last_audited="20 Oct 2026"
            ),
            InventoryItem(
                id=2,
                asset_tag="CON-BIO-004",
                name="Pre-Mounted Microscope Glass Slides (Set of 100)",
                category="Lab Consumable",
                sub_category="Biology Apparatus",
                location="Biology Lab Specimen Cabinet",
                total_stock=250,
                available_stock=240,
                issued_count=10,
                damaged_count=0,
                reorder_level=100,
                unit_of_measure="Units",
                unit_cost=15.0,
                amc_vendor="BioLab Solutions Ltd.",
                condition="Optimal",
                last_audited="18 Oct 2026"
            ),
            InventoryItem(
                id=3,
                asset_tag="AST-IT-092",
                name="Lenovo Tab M10 HD (Student Coding Tablets)",
                category="IT Hardware",
                sub_category="Coding Tablets",
                location="Computer Lab 1 Charging Cart A",
                total_stock=90,
                available_stock=60,
                issued_count=30,
                damaged_count=0,
                reorder_level=15,
                unit_of_measure="Units",
                unit_cost=12500.0,
                amc_vendor="Lenovo Enterprise Support",
                amc_valid_until="31 Dec 2027",
                condition="Optimal",
                last_audited="19 Oct 2026"
            ),
            InventoryItem(
                id=4,
                asset_tag="AST-AV-018",
                name="Promethean 75-inch 4K Interactive Touch Panel",
                category="IT Hardware",
                sub_category="Classroom Displays",
                location="Class 8-B Homeroom Wall",
                total_stock=16,
                available_stock=16,
                issued_count=0,
                damaged_count=0,
                reorder_level=2,
                unit_of_measure="Units",
                unit_cost=185000.0,
                amc_vendor="Promethean Digital India AMC",
                amc_valid_until="15 Nov 2027",
                condition="Optimal",
                last_audited="15 Oct 2026"
            ),
            InventoryItem(
                id=5,
                asset_tag="AST-OPT-042",
                name="Crown Glass Equilateral Triangular Prisms",
                category="Lab Consumable",
                sub_category="Physics Optics",
                location="Physics Lab Optics Vault",
                total_stock=35,
                available_stock=32,
                issued_count=2,
                damaged_count=1,
                reorder_level=10,
                unit_of_measure="Units",
                unit_cost=450.0,
                amc_vendor="OptoTech Instruments",
                condition="Optimal",
                last_audited="16 Oct 2026"
            ),
            InventoryItem(
                id=6,
                asset_tag="SPT-BALL-015",
                name="FIFA Quality Match Footballs (Size 5)",
                category="Sports Gear",
                sub_category="Field Sports",
                location="Sports Equipment Depot Rack B",
                total_stock=40,
                available_stock=32,
                issued_count=6,
                damaged_count=2,
                reorder_level=12,
                unit_of_measure="Units",
                unit_cost=1850.0,
                amc_vendor="Cosco India Sports",
                condition="Optimal",
                last_audited="21 Oct 2026"
            ),
            InventoryItem(
                id=7,
                asset_tag="BK-NCERT-801",
                name="NCERT Class 8 Mathematics & Science Textbook Bundles",
                category="Books/Stationery",
                sub_category="Standard Curricula",
                location="Central Textbook Repository Shelf 4",
                total_stock=400,
                available_stock=370,
                issued_count=30,
                damaged_count=0,
                reorder_level=50,
                unit_of_measure="Sets",
                unit_cost=650.0,
                amc_vendor="NCERT Publication Division",
                condition="Optimal",
                last_audited="12 Oct 2026"
            )
        ]
        db.add_all(initial_inventory)
        await db.flush()

        # 27. Active Daily Custody Logs (Tablet Carts & Student Loan)
        initial_custody = [
            AssetCustodyLog(
                id=1,
                item_id=3,
                borrower_name="Mrs. Ananya Verma",
                borrower_role="Teacher",
                borrower_ref_id="EMP-042",
                class_room="Class 8-B",
                quantity=30,
                checkout_time=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
                expected_return_time=datetime.datetime.utcnow() + datetime.timedelta(hours=3),
                condition_on_return="Pending Return",
                fine_assessed=0.0,
                status="Active"
            ),
            AssetCustodyLog(
                id=2,
                item_id=5,
                borrower_name="Kabir Mehta",
                borrower_role="Student",
                borrower_ref_id="15",
                class_room="Class 8-B",
                quantity=1,
                checkout_time=datetime.datetime.utcnow() - datetime.timedelta(days=2),
                expected_return_time=datetime.datetime.utcnow() - datetime.timedelta(days=1),
                condition_on_return="Pending Return",
                fine_assessed=0.0,
                status="Active"
            )
        ]
        db.add_all(initial_custody)

        await db.commit()
        print("EDU360 seed data populated successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
