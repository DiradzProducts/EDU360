"""
Generate updated ABOUT_EDU360.docx and PRD Word Documents
Synchronized with Production Architecture v3.0 (Cross-Role Synchronizations, 8 Canonical Roles,
Morning Absence Alerts, Homework Dual Fan-Out, Substitution Proxy Routing, Atomic SIS Onboarding,
Financial Fee Hold on Admit Cards, Bank Reconcile Settlement, and ClockProvider).
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def add_heading(doc, text, level):
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    if level == 1:
        h.paragraph_format.space_before = Pt(16)
        h.paragraph_format.space_after = Pt(6)
        for r in h.runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(16)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)
    elif level == 2:
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(4)
        for r in h.runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(13)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)
    elif level == 3:
        h.paragraph_format.space_before = Pt(8)
        h.paragraph_format.space_after = Pt(2)
        for r in h.runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(11)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    return h

def add_callout(doc, title, text, bg_hex="F0FDF4", border_hex="16A34A"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="none"/>'
        f'<w:left w:val="single" w:sz="36" w:space="0" w:color="{border_hex}"/>'
        f'<w:bottom w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    run_t = p.add_run(f"📌 {title}\n")
    run_t.bold = True
    run_t.font.name = 'Calibri'
    run_t.font.size = Pt(10)
    run_t.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    
    run_b = p.add_run(text)
    run_b.font.name = 'Calibri'
    run_b.font.size = Pt(9.5)
    run_b.font.color.rgb = RGBColor(0x33, 0x41, 0x55)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(3)

def format_table(table, col_widths, headers, data, header_bg="1E3A8A"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_background(hdr_cells[i], header_bg)
        set_cell_margins(hdr_cells[i], top=100, bottom=100, left=120, right=120)
        for r in hdr_cells[i].paragraphs[0].runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for row_idx, row_data in enumerate(data):
        row_cells = table.add_row().cells
        bg_color = "F8FAFC" if row_idx % 2 == 1 else "FFFFFF"
        for col_idx, cell_value in enumerate(row_data):
            row_cells[col_idx].text = str(cell_value)
            set_cell_background(row_cells[col_idx], bg_color)
            set_cell_margins(row_cells[col_idx], top=80, bottom=80, left=100, right=100)
            for r in row_cells[col_idx].paragraphs[0].runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)

    for row in table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = Inches(width)

def generate_doc():
    doc = docx.Document()
    
    # Page Margins
    for sec in doc.sections:
        sec.top_margin = Inches(0.8)
        sec.bottom_margin = Inches(0.8)
        sec.left_margin = Inches(0.8)
        sec.right_margin = Inches(0.8)

    # Document Header Box
    tbl_title = doc.add_table(rows=1, cols=1)
    tbl_title.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl_title.cell(0, 0)
    set_cell_background(cell, "0F172A")
    set_cell_margins(cell, top=200, bottom=200, left=240, right=240)
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r1 = p.add_run("PRODUCT REQUIREMENTS DOCUMENT (PRD)\n")
    r1.font.name = 'Calibri'
    r1.font.size = Pt(18)
    r1.font.bold = True
    r1.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    r2 = p.add_run("EDU360 — K–12 Institutional Management, Live Education & Unified SIS Ecosystem\n")
    r2.font.name = 'Calibri'
    r2.font.size = Pt(13)
    r2.font.bold = True
    r2.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8)

    r3 = p.add_run("Document Version: 3.0 (Production Architecture Baseline) | Platforms: 8 Canonical Roles (Web & Mobile)")
    r3.font.name = 'Calibri'
    r3.font.size = Pt(10)
    r3.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # 1. Executive Summary & Product Vision
    add_heading(doc, "1. Executive Summary & Product Vision", level=1)
    p = doc.add_paragraph(
        "EDU360 is an enterprise-grade, cloud-native Educational Operating System & Student Outcomes Platform engineered for K–12 institutions. "
        "Traditional School ERPs operate as disconnected, static digital registers that spam users with notifications and leave leadership blind to operational risks. "
        "EDU360 functions as a Unified Action & Intelligence System connecting Administration, 4 Specialized Coordinators, Teachers, Parents, and Students around five core principles:"
    )
    p.paragraph_format.space_after = Pt(4)

    p1 = doc.add_paragraph()
    r = p1.add_run("1. Actionable Management Intelligence: ")
    r.bold = True
    p1.add_run("Highlights what needs attention today, why it matters, and who needs to take action via a real-time Red / Orange / Green Priority Triage Engine with purged inactive categories.")

    p2 = doc.add_paragraph()
    r = p2.add_run("2. Outcome-Oriented Parent Involvement & Tri-Directional Communications: ")
    r.bold = True
    p2.add_run("Eliminates spam via an anti-spam moving-slider dashboard on mobile for routine updates, coupled with a shared Student Focus Table, multi-student family profile switching, and high-signal alerts (morning absence warnings and homework oversight).")

    p3 = doc.add_paragraph()
    r = p3.add_run("3. Zero Extra Burden for Teachers: ")
    r.bold = True
    p3.add_run("Online class attendance via a 10-minute WebRTC telemetry rule, period-wise subject attendance auto-excused upon approved leave, curriculum delivery checked off directly into PostgreSQL, homework assignment dual notification fan-out, and SpeedGrader inline canvas correction.")

    p4 = doc.add_paragraph()
    r = p4.add_run("4. Deterministic Time-Alignment & Governance-First Security: ")
    r.bold = True
    p4.add_run("Centralized ClockProvider simulation engine synchronizing timetables, period bells, and exam lifecycles across all 8 portals, backed by HMAC-SHA256 tokens, targeted user-id notifications, and pessimistic row locking.")

    p5 = doc.add_paragraph()
    r = p5.add_run("5. Zero-Disruption Atomic SIS Onboarding: ")
    r.bold = True
    p5.add_run("New candidate conversions from Admissions CRM execute as single-pass transactional inceptions calculating sequential roll numbers, seeding annual fee milestones, linking parent accounts, and propagating instantly to rosters.")

    # 2. Platform Strategy
    add_heading(doc, "2. Platform Strategy & Multi-Portal Architecture", level=1)
    p = doc.add_paragraph("EDU360 follows a Role-Optimized Platform Strategy tailored to ergonomic workstation needs, user mobility, and task complexity across all 8 Canonical Roles:")
    
    strat_headers = ["User Role", "Route / Portal", "Primary Platform", "Secondary Platform", "Operational Rationale"]
    strat_widths = [1.3, 1.2, 1.3, 1.2, 2.2]
    strat_data = [
        ["Super Admin / Principal", "/admin", "Web App (Desktop 1080p+)", "Mobile Web (Urgent)", "High-density priority triage, task delegation, document vault lock, medical re-exam adjudication, and administrative overrides."],
        ["Academic Coordinator", "/academic_coordinator", "Web App (Desktop/Laptop)", "Tablet Web", "Curriculum pacing audit, conflict-free teacher timetable substitutions, faculty workload balancing, and inter-coordinator exam-syllabus sync."],
        ["Exam Coordinator", "/exam_coordinator", "Web App (Desktop/Laptop)", "Tablet Web", "Atomic batch class exam scheduling, hall deployment, seat allocation, financial clearance gating, dynamic admit cards, and re-exams."],
        ["Accounts Coordinator", "/accounts_coordinator", "Web App (Desktop/Laptop)", "Tablet Web", "3-tier fee aging, authentic counter collection, fee structures, online bank reconciliation, and staff payroll with LOP deductions."],
        ["Admissions Coordinator", "/admissions_coordinator", "Web App (Desktop/Laptop)", "Mobile App / Tablet", "24/7 AI chatbot lead CRM, follow-up call tracking, and 1-click atomic conversion into SIS with sequential roll & fee milestone seeding."],
        ["Teachers", "/teacher", "Web App (Desktop/Laptop)", "Mobile App / Tablet", "Desktop displays optimal for LiveKit classroom hosting, browser SpeedGrader, homework fan-out, morning absence alerts, and PTM summary notes."],
        ["Parents", "/parent", "Mobile App (Android / iOS)", "Responsive Web", "Mobile-first for on-the-go push notifications, multi-child family switching, 1-tap UPI fee payments with authentic QR codes, and PTM booking."],
        ["Students (Secondary)", "/student", "Web App (Desktop/Laptop)", "Mobile App / Tablet", "Full-width displays for distraction-free LiveKit classes, digital notes, dynamic admit cards with seating details, online exams, and homework uploads."]
    ]
    t = doc.add_table(rows=1, cols=5)
    format_table(t, strat_widths, strat_headers, strat_data, header_bg="1E3A8A")

    # 3. User Roles & Permission Matrix
    add_heading(doc, "3. User Roles & Permission Matrix (RBAC & Governance)", level=1)
    add_callout(doc, "Strict Document Security & Administrative Override Rule", 
                "1. Official student documents in the Student Information System (SIS) can ONLY be uploaded, edited, or replaced by Administration. Teachers, Parents, and Students have strictly View/Download-Only access.\n"
                "2. The Administrative Override Engine grants Principal/Super Admin ultimate executive authority over student leaves, institutional SLAs, exam moderation, and fee overrides. When an executive override is stamped (is_admin_override=True), downstream roles (Teachers/Coordinators) are locked out (403 Forbidden) from reversing the action.\n"
                "3. Secondary Profile Lock: Only authenticated students (role='student') may edit their secondary extracurricular profile and 2nd guardian emergency details.")

    rbac_headers = ["Module / Capability", "Principal / Admin", "Academic Coord.", "Exam Coord.", "Accounts Coord.", "Admissions Coord.", "Teacher", "Student", "Parent"]
    rbac_widths = [1.6, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]
    rbac_data = [
        ["Priority Triage & Tasks", "Full (Exec)", "View/Act", "View/Act", "View/Act", "View/Act", "None", "None", "None"],
        ["SIS Document Vault Control", "Full (Lock)", "View Only", "View Only", "View Only", "View Only", "View Only", "View Only", "View Only"],
        ["Administrative Override Engine", "Full (Bypass)", "None", "None", "None", "None", "None", "None", "None"],
        ["Atomic SIS Onboarding", "Full (Audit)", "Auto-Roster", "Auto-Roster", "Auto-Invoice", "1-Click Convert", "Auto-Roster", "View Profile", "Multi-Child"],
        ["Sibling 15% Fee Waiver", "Full (Audit)", "None", "None", "Auto-Invoice", "Apply Link", "None", "None", "Verify Link"],
        ["Batch Exam Scheduling & Hall Alloc.", "Full (Audit)", "Sync Pacing", "Full (Batch)", "Fee Clearance", "None", "View Duty", "View Admit", "View Admit"],
        ["Financial Fee Hold on Admit Cards", "Override Hold", "None", "Enforce Hold", "Manage Dues", "None", "None", "Gated Card", "View Hold Alert"],
        ["Medical Re-Exam Protocol", "Approve", "Pacing Sync", "Schedule Hall", "Fee Audit", "None", "Invigilate", "View Admit", "Apply (Docs)"],
        ["Teacher Exam & Substitution Sync", "Full (Audit)", "Manage Proxy", "Invigilation Sync", "None", "None", "Live Schedule", "None", "None"],
        ["Teacher Homework Assignment Fan-out", "Full (Audit)", "Audit Pacing", "None", "None", "None", "Assign HW", "Receive Alert", "Receive Alert"],
        ["Morning Absence Critical Alert", "Full (Audit)", "None", "None", "None", "None", "Trigger Alert", "Status Stamp", "Receive Alert"],
        ["Bank Reconcile Ledger Auto-Settle", "Full (Audit)", "None", "None", "Reconcile", "None", "None", "View Receipt", "Scan & Pay"],
        ["Staff Payroll & LOP Deductions", "Authorize (Check)", "Workload Sync", "None", "Draft Batch (Maker)", "None", "View Payslip", "None", "None"],
        ["Live Online Class Hosting", "Full (Audit)", "Monitor Class", "None", "None", "None", "Full (Host)", "Join/Replay", "None"],
        ["Auto-Attendance (10-Min Rule)", "Full (Audit)", "View Register", "None", "None", "None", "Live Roster", "Status Stamp", "View Child"],
        ["SpeedGrader Inline Canvas", "Full (Audit)", "Audit Pacing", "None", "None", "None", "Grade & Mark", "Submit/View", "View Child"],
        ["Staff Leave (CL/SL/EL/LOP)", "Approve/Reject", "Substitute Match", "None", "Payroll LOP Sync", "None", "Apply/Track", "None", "None"],
        ["PTM Concurrency Booking & Notes", "Full (Audit)", "Faculty Audit", "None", "None", "None", "Create & Notes", "None", "Hold, Cancel, Notes"],
        ["Dual-Signature Student Exit/TC", "Sign & Seal", "Inventory Sync", "None", "Dues Clearance", "None", "View Only", "Withdrawn", "Digital Sign"]
    ]
    t = doc.add_table(rows=1, cols=9)
    format_table(t, rbac_widths, rbac_headers, rbac_data, header_bg="0284C7")

    # 4. Detailed Functional Requirements
    add_heading(doc, "4. Detailed Functional Requirements by Role", level=1)
    
    add_heading(doc, "4.1 Student Portal & Mobile App", level=2)
    doc.add_paragraph("• Live Classroom Cockpit (LMS): Direct in-browser LiveKit WebRTC connection with active speaker spotlighting and screen sharing.\n"
                      "• Dynamic 10-Minute Auto-Attendance Tracker: Background telemetry logs attendance status; period-level statuses auto-excused on approved leave.\n"
                      "• Dynamic Admit Cards & Financial Fee Hold Gating: Live dynamic hall tickets with designated hall, seat number, chief invigilator, and QR code. Gated with fee resolution banner if student has unpaid arrears.\n"
                      "• Medical Re-Exam Admit Card: Rescheduled hall tickets delivered upon administrative medical approval.\n"
                      "• Homework Vault & Submission Dropzone: Real-time homework alerts, mobile camera capture upload, and SpeedGrader feedback viewer.\n"
                      "• Sequential Roll Numbering & Multi-Year Ledger: Clean sequential roll numbers without gaps and fully seeded annual fee milestones from Day 1.\n"
                      "• Shared Student Focus Table: Weekly study timetable highlighting weak concepts co-tracked with parents and teachers.")

    add_heading(doc, "4.2 Teacher Portal & SpeedGrader", level=2)
    doc.add_paragraph("• Teacher Home Dashboard: Dynamic schedule ticker driven by ClockProvider highlighting active period, homework grading, and invigilation duties.\n"
                      "• Homework Assignment Dual Fan-Out: Assigns homework with deadline and rubric, auto-dispatching dual alerts to student cohort and parents.\n"
                      "• Automated Morning Absence Alert: Marking a student absent during roll call immediately triggers a critical push alert to the parent with an excused leave deep-link.\n"
                      "• SpeedGrader Studio (Browser Canvas): 2-pane evaluation workspace displaying student submissions alongside rubrics with freehand vector stylus annotations.\n"
                      "• Conflict-Free Substitution Proxy Injection: Injects proxy cover periods strictly into selected substitute teacher schedules without cross-faculty schedule corruption.\n"
                      "• Curriculum Delivery Check-Off: Logs unit completion directly into PostgreSQL CurriculumPacing, auto-calculating Ahead/On Track/Lagging status.\n"
                      "• PTM Attendance & Summary Notes Governance: Marks teacher/parent attendance and saves meeting summary notes delivered to parent app.")

    add_heading(doc, "4.3 Parent Portal & Family Engagement", level=2)
    doc.add_paragraph("• Multi-Student Family Account Switching: Seamless switching between enrolled siblings without re-authenticating via Student.parent_user_id.\n"
                      "• High-Signal Alert Center: Morning roll call absence warnings, homework assignment deadline reminders, and PTM cancellation notices.\n"
                      "• Authentic QR Code Fee Checkout: Dynamic UPI QR code generator (authentic-qr.tsx), instant settlements, counter payment history receipts, and PDF tax receipts.\n"
                      "• Medical Re-Exam Application: Apply for missed examination re-scheduling with attached medical certificate.\n"
                      "• PTM Closed-Loop Booking & Notes: 15-minute slot selector with 5-minute lock timer, cancellation with reason logging, and conference summary notes.")

    add_heading(doc, "4.4 Super Admin & Principal Console", level=2)
    doc.add_paragraph("• Priority Triage Command Center: Real-time Red/Orange/Green priority status indicators with purged inactive transport/inventory categories.\n"
                      "• Atomic Single-Pass SIS Onboarding: Converts admission leads into enrolled students in a single transaction (sequential roll no, fee milestone seeding, sibling discount, and parent linkage).\n"
                      "• Student Lifecycle Termination: Transition to Withdrawn status upon exit clearance verification; automatically purged from active rosters.\n"
                      "• Administrative Override Engine: 5 concrete executive bypass domains enabling Principal to override student leaves, force-close stalled tasks, and decouple exam locks with downstream lockout (403 Forbidden).\n"
                      "• Dynamic Homeroom Override Cascade: Resolves exact homeroom teacher user ID and dispatches high-priority alert with executive remarks.\n"
                      "• Four-Eye Payroll Authorization: Principal reviews monthly salary batch computed by Accounts Coordinator and applies executive authorization.")

    add_heading(doc, "4.5 Exam Coordinator Portal", level=2)
    doc.add_paragraph("• Atomic Batch Class Exam Scheduling: Schedule all subjects for a class in one atomic transaction, generating batch_id and series_name.\n"
                      "• Teacher Invigilation Schedule Synchronization: Synchronizes exam duties with teacher personal timetables.\n"
                      "• Dynamic Exam Surveillance Cockpit: Proctored surveillance WebSocket rooms dynamically resolve based on class and section.\n"
                      "• Financial Fee Hold Gating on Admit Cards: Enforces fee clearance gates preventing admit card generation for defaulters unless overridden.\n"
                      "• Inter-Coordinator Exam Sync Protocol: Resolves syllabus cut-offs and reschedules lagging exams with Academic Coordinator.\n"
                      "• Medical Re-Exam Scheduling: Assigns exam dates, time slots, halls, and chief invigilators for approved medical re-exam candidates.")

    add_heading(doc, "4.6 Accounts Coordinator Portal", level=2)
    doc.add_paragraph("• Institutional Fee Structure Configurator: Standardized class-wise fee structures (FeeStructure) across tuition, term milestones, and lab/library fees.\n"
                      "• Dynamic Fee Aging Days Calculation: Real-time days_overdue calculated against current UTC date vs student created_at.\n"
                      "• Bank Reconciliation Auto-Settlement: Reconciling an online payment transaction automatically settles the student's FeeDefaulter balance, marks it Paid upon zero balance, and clears exam holds.\n"
                      "• Physical Counter Collection Engine: Cashier modal for recording manual cash, cheque, Demand Draft, or POS card payments with zero-overpayment guards and row locks.\n"
                      "• Staff Payroll & LOP Deduction Engine (Maker): Computes monthly payroll cross-referencing staff attendance and approved Loss of Pay (LOP) leaves.")

    add_heading(doc, "4.7 Admissions Coordinator Portal", level=2)
    doc.add_paragraph("• 24/7 AI Chatbot & Lead Ingestion CRM: Captures incoming parent inquiries and routes high-intent prospects to counselors.\n"
                      "• Single-Click Atomic SIS Conversion: Converts admitted candidates directly into enrolled students with sequential roll no, fee milestone seeding, and parent_user_id linkage.\n"
                      "• Sibling Linking & Automated Discount Engine: Detects enrolled siblings and applies a 15% tuition fee waiver automatically.\n"
                      "• Secondary Student Dossier: Captures emergency contacts, languages, dietary preferences, and career ambitions into SIS.")

    add_heading(doc, "4.8 Academic Coordinator Portal", level=2)
    doc.add_paragraph("• Curriculum Pacing & Syllabus Tracker: Monitors chapter completion percentages against lesson plans across all sections reading live from PostgreSQL.\n"
                      "• Inter-Coordinator Exam Sync Protocol: Initiates consultation meetings (ExamSyncRequest) when class syllabus delivery lags.\n"
                      "• PTM Faculty Attendance Audit: Monitors institutional compliance for Parent-Teacher Meetings tracking faculty attendance rates and completed conferences.\n"
                      "• Conflict-Free Teacher Substitution Matching: Real-time substitution engine injecting proxy periods into the selected substitute's timetable without period collisions.")

    # 5. Key System Workflows
    add_heading(doc, "5. Key System Workflows & Execution Matrices", level=1)
    
    wf_headers = ["Workflow Code & Title", "Core Actors Involved", "Architectural Invariant / Execution Rule", "Primary Outcome"]
    wf_widths = [1.8, 1.6, 2.2, 1.6]
    wf_data = [
        ["Workflow 5.1: Auto-Attendance & Morning Absence", "Teacher, Student, LiveKit, Parent", "10-Minute WebRTC rule; roll call absence triggers critical parent alert.", "Automated attendance + parent absence notice with leave deep-link."],
        ["Workflow 5.2: Homework Fan-Out & SpeedGrader", "Teacher, Student, Parent, S3 Vault", "Homework creation triggers dual alert; in-browser canvas evaluation.", "Student/Parent deadline oversight + evaluated PDF feedback."],
        ["Workflow 5.3: PTM Closed-Loop Governance", "Parent, Teacher, DB Lock, Academics", "SELECT ... FOR UPDATE locks; cancellation protocol; attendance & summary notes.", "Zero double-bookings; meeting notes delivered to parent; audited by Academics."],
        ["Workflow 5.4: Dual-Signature Student Exit", "Parent, Principal, Library, Finance", "All dues verified; Parent Digital OTP + Principal Scanned Physical Seal.", "Tamper-evident digital TC issuance + transition to Withdrawn status."],
        ["Workflow 5.5: Batch Exam & Financial Fee Hold", "Exam Coord, Accounts, Student, DB", "Atomic batch creation; financial fee hold gating on hall ticket download.", "Gated admit card for defaulters; live QR hall ticket for cleared students."],
        ["Workflow 5.6: Four-Eye Staff Payroll & LOP", "Accounts (Maker), Principal (Checker), Staff", "Separation of duties; dynamic LOP leave deduction calculation.", "Executive-authorized monthly salary disbursement + itemized payslips."],
        ["Workflow 5.7: Administrative Override Cascade", "Principal, Teacher, Parent, DB Lockout", "Hierarchical bypass; downstream roles locked out (403 Forbidden).", "Executive override stamped in SecurityAuditLog + dual notification cascade."],
        ["Workflow 5.8: Inter-Coord Exam Syllabus Sync", "Academic Coord, Exam Coord, Teacher", "ExamSyncRequest triggered when syllabus lag < 50%; joint resolution.", "Exam dates rescheduled or cut-offs trimmed without student disadvantage."],
        ["Workflow 5.9: Medical Re-Examination Lifecycle", "Parent, Principal, Exam Coord, Student", "ReExamRequest submitted with medical certificate; Admin approval.", "Dedicated re-exam hall, date, and invigilator assigned; live admit card."]
    ]
    t = doc.add_table(rows=1, cols=4)
    format_table(t, wf_widths, wf_headers, wf_data, header_bg="1E3A8A")

    # 6. Technology Stack & Roadmap
    add_heading(doc, "6. Recommended Technology Stack & Architecture", level=1)
    tech_headers = ["Architecture Layer", "Production Technology", "Operational Role & Justification"]
    tech_widths = [1.8, 2.2, 3.2]
    tech_data = [
        ["Web Frontend", "Next.js 14/16 (React 18/19)", "SSR for blazing initial loads + Client components for high-density administrative dashboards."],
        ["Mobile Application", "React Native (Expo) + TypeScript", "Cross-platform iOS/Android parent app sharing data types, schemas, and API contracts."],
        ["Backend API", "FastAPI (Python 3.11+)", "High-throughput asynchronous ASGI runtime handling SIS, Attendance, Fees, Academic, and Exams endpoints."],
        ["Primary Database", "PostgreSQL 15+ (asyncpg)", "Enterprise relational database with ACID compliance, JSON column indexing, and foreign keys."],
        ["ORM & Concurrency", "SQLAlchemy 2.0 Async", "Single-pass JOIN queries + Pessimistic Row Locking (SELECT ... FOR UPDATE) for zero race conditions."],
        ["Live Video & Audio", "LiveKit WebRTC Server & SDK", "Embedded in-browser live classrooms, screen sharing, auto-recording, and attendance webhooks."],
        ["Dynamic Timekeeping", "Centralized ClockProvider", "Reactive simulation hook with 30-second ticker aligning class timetables, period switches, and exam lifecycles."],
        ["Real-Time Notifications", "In-App WebSocket + Web Audio", "Targeted role & user-id dispatching with live sound chimes, unread count badges, and deep-link action navigation."],
        ["Financial Ledger Engine", "fee-ledger.ts + authentic-qr.tsx", "Real-time bank reconciliation, counter POS collection guards, and dynamic QR code generation."],
        ["Security & Auth", "HMAC-SHA256 Signed Tokens", "Dual-mode authentication (Bearer Tokens + Scoped Role Headers) with zero unauthorized bypasses."],
        ["Artificial Intelligence", "Google Gemini 1.5/2.0 Flash Vision", "Multimodal diagram inspection, student notebook OCR analysis, remedial sprint generation, and Socratic doubt solving."],
        ["Compliance & Storage", "S3-Compatible Encrypted Vault", "Cloudflare R2 / AWS S3 for zero-egress storage of homework uploads, evaluated PDFs, and transfer certificates."]
    ]
    t = doc.add_table(rows=1, cols=3)
    format_table(t, tech_widths, tech_headers, tech_data, header_bg="0284C7")

    # Save to both paths
    out_docx_1 = os.path.abspath("docs/ABOUT_EDU360.docx")
    out_docx_2 = os.path.abspath("docs/prd/ABOUT_EDU360.docx")
    os.makedirs(os.path.dirname(out_docx_1), exist_ok=True)
    os.makedirs(os.path.dirname(out_docx_2), exist_ok=True)
    doc.save(out_docx_1)
    doc.save(out_docx_2)
    print(f"Generated DOCX: {out_docx_1} and {out_docx_2}")

if __name__ == "__main__":
    generate_doc()
