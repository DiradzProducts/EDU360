"""
Generate updated ABOUT_EDU360.docx and PRD Word Documents
Synchronized with Production Architecture v2.5 (Cross-Role Synchronizations, 8 Canonical Roles,
Inter-Coordinator Exam Sync, Medical Re-Exam, PTM Closed-Loop Attendance, Dynamic Admit Cards,
Authentic QR Fee Ledger, ClockProvider, and Targeted Notifications).
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

    r3 = p.add_run("Document Version: 2.5 (Cross-Role Synchronized) | Platforms: 8 Canonical Roles (Web & Mobile)")
    r3.font.name = 'Calibri'
    r3.font.size = Pt(10)
    r3.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # 1. Executive Summary & Product Vision
    add_heading(doc, "1. Executive Summary & Product Vision", level=1)
    p = doc.add_paragraph(
        "EDU360 is an enterprise-grade, cloud-native Educational Operating System & Student Outcomes Platform engineered for K–12 institutions. "
        "Traditional School ERPs operate as disconnected, static digital registers that spam users with notifications and leave leadership blind to operational risks. "
        "EDU360 functions as a Unified Action & Intelligence System connecting Administration, 4 Specialized Coordinators, Teachers, Parents, and Students around four core principles:"
    )
    p.paragraph_format.space_after = Pt(4)

    p1 = doc.add_paragraph()
    r = p1.add_run("1. Actionable Management Intelligence: ")
    r.bold = True
    p1.add_run("Highlights what needs attention today, why it matters, and who needs to take action via a real-time Red / Orange / Green Priority Triage Engine. Deprecated non-operational domains (transport and inventory) are purged from active triage.")

    p2 = doc.add_paragraph()
    r = p2.add_run("2. Outcome-Oriented Parent Involvement: ")
    r.bold = True
    p2.add_run("Eliminates spam via an anti-spam moving-slider dashboard on mobile for routine updates, coupled with a shared Student Focus Table for weak-subject improvement and multi-student family profile switching.")

    p3 = doc.add_paragraph()
    r = p3.add_run("3. Zero Extra Burden for Teachers: ")
    r.bold = True
    p3.add_run("Online class attendance via a 10-minute WebRTC telemetry rule, period-wise subject attendance auto-excused upon approved leave, curriculum delivery checked off directly to PostgreSQL, and SpeedGrader inline canvas correction.")

    p4 = doc.add_paragraph()
    r = p4.add_run("4. Deterministic Time-Alignment & Governance-First Security: ")
    r.bold = True
    p4.add_run("Centralized ClockProvider simulation engine synchronizing timetables, period bells, and exam lifecycles across all 8 portals, backed by HMAC-SHA256 tokens, targeted user-id notifications, and pessimistic row locking.")

    # 2. Platform Strategy
    add_heading(doc, "2. Platform Strategy & Multi-Portal Architecture", level=1)
    p = doc.add_paragraph("EDU360 follows a Role-Optimized Platform Strategy tailored to ergonomic workstation needs, user mobility, and task complexity across all 8 Canonical Roles:")
    
    strat_headers = ["User Role", "Route / Portal", "Primary Platform", "Secondary Platform", "Operational Rationale"]
    strat_widths = [1.3, 1.2, 1.3, 1.2, 2.2]
    strat_data = [
        ["Super Admin / Principal", "/admin", "Web App (Desktop 1080p+)", "Mobile Web (Urgent)", "High-density priority triage, task delegation, document vault lock, medical re-exam adjudication, and administrative overrides."],
        ["Academic Coordinator", "/academic_coordinator", "Web App (Desktop/Laptop)", "Tablet Web", "Curriculum pacing audit, teacher substitutions, faculty workload balancing, and inter-coordinator exam-syllabus sync."],
        ["Exam Coordinator", "/exam_coordinator", "Web App (Desktop/Laptop)", "Tablet Web", "Atomic batch class exam scheduling, hall deployment, seat allocation, clearance gating, dynamic admit cards, and re-exams."],
        ["Accounts Coordinator", "/accounts_coordinator", "Web App (Desktop/Laptop)", "Tablet Web", "3-tier fee aging, authentic counter collection, fee structures, online bank reconciliation, and staff payroll with LOP deductions."],
        ["Admissions Coordinator", "/admissions_coordinator", "Web App (Desktop/Laptop)", "Mobile App / Tablet", "24/7 AI chatbot lead CRM, follow-up call tracking, and 1-click atomic conversion into SIS with 15% sibling discount."],
        ["Teachers", "/teacher", "Web App (Desktop/Laptop)", "Mobile App / Tablet", "Desktop displays optimal for LiveKit classroom hosting, browser SpeedGrader, PTM attendance & summary notes, and categorized staff leave."],
        ["Parents", "/parent", "Mobile App (Android / iOS)", "Responsive Web", "Mobile-first for on-the-go push notifications, multi-child switching, 1-tap UPI fee payments with authentic QR codes, and PTM booking."],
        ["Students (Secondary)", "/student", "Web App (Desktop/Laptop)", "Mobile App / Tablet", "Full-width displays for distraction-free LiveKit classes, digital notes, dynamic admit cards with seating details, online exams, and homework uploads."]
    ]
    t = doc.add_table(rows=1, cols=5)
    format_table(t, strat_widths, strat_headers, strat_data, header_bg="1E3A8A")

    # 3. User Roles & Permission Matrix
    add_heading(doc, "3. User Roles & Permission Matrix (RBAC & Governance)", level=1)
    add_callout(doc, "Strict Document Security & Administrative Override Rule", 
                "1. Official student documents in the Student Information System (SIS) can ONLY be uploaded, edited, or replaced by Administration. Teachers, Parents, and Students have strictly View/Download-Only access.\n"
                "2. The Administrative Override Engine grants Principal/Super Admin ultimate executive authority over student leaves, institutional SLAs, exam moderation, and fee overrides. When an executive override is stamped (is_admin_override=True), downstream roles (Teachers/Coordinators) are locked out (403 Forbidden) from reversing the action.")

    rbac_headers = ["Module / Capability", "Principal / Admin", "Academic Coord.", "Exam Coord.", "Accounts Coord.", "Admissions Coord.", "Teacher", "Student", "Parent"]
    rbac_widths = [1.6, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7]
    rbac_data = [
        ["Priority Triage & Tasks", "Full (Exec)", "View/Act", "View/Act", "View/Act", "View/Act", "None", "None", "None"],
        ["SIS Document Vault Control", "Full (Lock)", "View Only", "View Only", "View Only", "View Only", "View Only", "View Only", "View Only"],
        ["Administrative Override Engine", "Full (Bypass)", "None", "None", "None", "None", "None", "None", "None"],
        ["Admissions CRM & Conversion", "Full (Audit)", "View Only", "View Only", "Fee Sync", "Full (Lead CRM)", "None", "None", "None"],
        ["Sibling 15% Fee Waiver", "Full (Audit)", "None", "None", "Auto-Invoice", "Apply Link", "None", "None", "Verify Link"],
        ["Batch Exam Scheduling & Hall Alloc.", "Full (Audit)", "Sync Pacing", "Full (Batch)", "Fee Clearance", "None", "View Duty", "View Admit", "View Admit"],
        ["Inter-Coord Exam Sync Protocol", "Full (Audit)", "Request/Align", "Resolve/Cutoff", "None", "None", "Pacing Feed", "None", "None"],
        ["Medical Re-Exam Protocol", "Approve", "Pacing Sync", "Schedule Hall", "Fee Audit", "None", "Invigilate", "View Admit", "Apply (Docs)"],
        ["Dynamic Admit Card Generation", "Full (Audit)", "View Only", "Full (Publish)", "Fee Clearance", "None", "View Only", "Live Download", "View Only"],
        ["3-Tier Fee Aging & Counter Pay", "Full (Audit)", "None", "Clearance Lock", "Full (Counter)", "None", "None", "View Status", "Pay (Online)"],
        ["Authentic QR Bank Reconcile", "Full (Audit)", "None", "None", "Reconcile", "None", "None", "View Receipt", "Scan & Pay"],
        ["Staff Payroll & LOP Deductions", "Authorize (Check)", "Workload Sync", "None", "Draft Batch (Maker)", "None", "View Payslip", "None", "None"],
        ["Live Online Class Hosting", "Full (Audit)", "Monitor Class", "None", "None", "None", "Full (Host)", "Join/Replay", "None"],
        ["Auto-Attendance (10-Min Rule)", "Full (Audit)", "View Register", "None", "None", "None", "Live Roster", "Status Stamp", "View Child"],
        ["SpeedGrader Inline Canvas", "Full (Audit)", "Audit Pacing", "None", "None", "None", "Grade & Mark", "Submit/View", "View Child"],
        ["Staff Leave (CL/SL/EL/LOP)", "Approve/Reject", "Substitute Match", "None", "Payroll LOP Sync", "None", "Apply/Track", "None", "None"],
        ["PTM Concurrency Booking & Notes", "Full (Audit)", "Faculty Audit", "None", "None", "None", "Create & Notes", "None", "Hold, Cancel, Notes"],
        ["Dual-Signature Student Exit/TC", "Sign & Seal", "Inventory Sync", "None", "Dues Clearance", "None", "View Only", "View Status", "Digital Sign"]
    ]
    t = doc.add_table(rows=1, cols=9)
    format_table(t, rbac_widths, rbac_headers, rbac_data, header_bg="0284C7")

    # 4. Detailed Functional Requirements
    add_heading(doc, "4. Detailed Functional Requirements by Role", level=1)
    
    add_heading(doc, "4.1 Student Portal & Mobile App", level=2)
    doc.add_paragraph("• Live Classroom Cockpit (LMS): Direct in-browser LiveKit WebRTC connection with active speaker spotlighting and screen sharing.\n"
                      "• Dynamic 10-Minute Auto-Attendance Tracker: Background telemetry logs attendance status; period-level statuses auto-excused on approved leave.\n"
                      "• Dynamic Admit Cards & Seating Roster: Live dynamic hall tickets pulling directly from Exam Coordinator batch database with hall name, seat number, chief invigilator, QR code, and academic clearance.\n"
                      "• Medical Re-Exam Admit Card: Instant delivery of rescheduled admit cards with venue and timing upon admin approval.\n"
                      "• Homework Vault & Submission Engine: Multi-file upload dropzone with mobile camera capture and SpeedGrader feedback viewer.\n"
                      "• Side-by-Side Portfolio: 2-pane portfolio separating institutional events from uploaded merit certificates.\n"
                      "• Shared Student Focus Table: Weekly study timetable highlighting weak concepts co-tracked with parents and teachers.")

    add_heading(doc, "4.2 Teacher Portal & SpeedGrader", level=2)
    doc.add_paragraph("• Teacher Home Dashboard: Dynamic schedule ticker driven by ClockProvider highlighting active period and duty assignments.\n"
                      "• SpeedGrader Studio (Browser Canvas): 2-pane evaluation workspace displaying student submissions alongside rubrics with freehand vector stylus annotations.\n"
                      "• Curriculum Delivery Check-Off: Logs unit completion directly into PostgreSQL CurriculumPacing, auto-calculating Ahead/On Track/Lagging status.\n"
                      "• PTM Closed-Loop Attendance & Notes: Marks teacher and parent attendance (COMPLETED, ABSENT), recording conference summary notes pushed to parent app.\n"
                      "• Staff Leave Management: Apply for categorized leaves (CL, SL, EL, LOP) specifying affected teaching periods, auto-feeding LOP deductions into payroll.\n"
                      "• Period-Wise Attendance Register: Fast-key bulk attendance marker (P, A, L, E) with automated leave-synchronization.")

    add_heading(doc, "4.3 Parent Portal & Family Engagement", level=2)
    doc.add_paragraph("• Multi-Student Account Switching: Seamless switching between enrolled siblings without re-authenticating via Student.parent_user_id.\n"
                      "• Anti-Spam Moving Slider Carousel: Routine announcements glide as top interactive slides, onboarding parents to open the app once daily.\n"
                      "• Authentic QR Code Fee Checkout: Dynamic UPI QR code generator (authentic-qr.tsx), instant settlements, counter payment history receipts, and PDF tax receipts.\n"
                      "• Medical Re-Exam Application: Apply for missed examination re-scheduling with attached medical certificate.\n"
                      "• PTM Booking & Cancellation: 15-minute slot selector with 5-minute lock timer and cancellation protocol with reason logging.\n"
                      "• High-Signal Push Alerts: Reserved strictly for urgent items: Teacher Remarks, Focus Table updates, 3-day absence warnings, and fee alerts.")

    add_heading(doc, "4.4 Super Admin & Principal Console", level=2)
    doc.add_paragraph("• Priority Triage Command Center: Real-time Red/Orange/Green priority status indicators with purged inactive transport/inventory categories.\n"
                      "• Administrative Override Engine: 5 concrete executive bypass domains enabling Principal to override student leaves, force-close stalled tasks, and decouple exam locks with downstream lockout (403 Forbidden).\n"
                      "• Dynamic Homeroom Override Cascade: Resolves exact homeroom teacher user ID and dispatches high-priority alert with executive remarks.\n"
                      "• Medical Re-Exam Adjudication: Reviews parent re-exam requests and verifies documentary evidence for Exam Coordinator scheduling.\n"
                      "• Four-Eye Payroll Authorization: Principal reviews monthly salary batch computed by Accounts Coordinator and applies executive authorization.\n"
                      "• Dual-Signature Student Exit / TC Clearance: Requires Parent Digital Approval (OTP) and Principal Scanned Physical Signature before vault sealing.")

    add_heading(doc, "4.5 Exam Coordinator Portal", level=2)
    doc.add_paragraph("• Atomic Batch Class Exam Scheduling: Schedule all subjects for a class in one atomic transaction, generating batch_id and series_name.\n"
                      "• Inter-Coordinator Exam Sync Protocol: Resolves syllabus cut-offs and reschedules lagging exams with Academic Coordinator.\n"
                      "• Medical Re-Exam Scheduling: Assigns exam dates, time slots, halls, and chief invigilators for approved medical re-exam candidates.\n"
                      "• Hall Deployment & Seating Allocation: Manages halls, capacities, and assigns Chief Invigilators per session.\n"
                      "• Dynamic Admit Card Generation Engine: Automates hall ticket publishing with fee clearance gates and verification QR codes.\n"
                      "• Academic Moderation Ledger & AI Scanning: Normalizes exam marks and processes scanned answer scripts via Gemini Flash Vision API.")

    add_heading(doc, "4.6 Accounts Coordinator Portal", level=2)
    doc.add_paragraph("• Institutional Fee Structure Configurator: Standardized class-wise fee structures (FeeStructure) across tuition, term milestones, and lab/library fees.\n"
                      "• 3-Tier Fee Aging Ledger & Defaulter Triage: Tracks receivables categorized into Aging Tiers (1–30d, 31–60d, 60+d) with 1-click reminders.\n"
                      "• Physical Counter Collection Engine: Cashier modal for recording manual cash, cheque, Demand Draft, or POS card payments with zero-overpayment guards and row locks.\n"
                      "• Online Bank Transaction Ledger: Real-time UTR reconciliation auto-syncing with parent fee payments (fee-ledger.ts).\n"
                      "• Staff Payroll & LOP Deduction Engine (Maker): Computes monthly payroll cross-referencing staff attendance and approved Loss of Pay (LOP) leaves.\n"
                      "• Four-Eye Separation of Duties Workflow: Submits draft payroll batches to the Principal for executive authorization before executing disbursement wire.")

    add_heading(doc, "4.7 Admissions Coordinator Portal", level=2)
    doc.add_paragraph("• 24/7 AI Chatbot & Lead Ingestion CRM: Captures incoming parent inquiries and routes high-intent prospects to counselors.\n"
                      "• Single-Click Atomic SIS Conversion: Converts admitted candidates directly into enrolled students (POST /api/admin/crm/enquiries/{id}/convert) with parent_user_id linkage.\n"
                      "• Sibling Linking & Automated Discount Engine: Detects enrolled siblings and applies a 15% tuition fee waiver automatically.\n"
                      "• Secondary Student Dossier: Captures emergency contacts, languages, dietary preferences, and career ambitions into SIS.")

    add_heading(doc, "4.8 Academic Coordinator Portal", level=2)
    doc.add_paragraph("• Curriculum Pacing & Syllabus Tracker: Monitors chapter completion percentages against lesson plans across all sections reading live from PostgreSQL.\n"
                      "• Inter-Coordinator Exam Sync Protocol: Initiates consultation meetings (ExamSyncRequest) when class syllabus delivery lags.\n"
                      "• PTM Faculty Attendance Audit: Monitors institutional compliance for Parent-Teacher Meetings tracking faculty attendance rates and completed conferences.\n"
                      "• Teacher Substitution & Workload Balancing: Real-time substitution engine recommending qualified replacement teachers without collisions.")

    # 5. Key System Workflows
    add_heading(doc, "5. Key System Workflows & Execution Matrices", level=1)
    
    wf_headers = ["Workflow Code & Title", "Core Actors Involved", "Architectural Invariant / Execution Rule", "Primary Outcome"]
    wf_widths = [1.8, 1.6, 2.2, 1.6]
    wf_data = [
        ["Workflow 5.1: Online Class Auto-Attendance", "Teacher, Student, LiveKit, Admin", "10-Minute WebRTC join rule; 3 consecutive absences trigger Red Alert.", "Automated attendance register + administrative triage task."],
        ["Workflow 5.2: SpeedGrader Inline Canvas", "Teacher, Student, S3 Vault, Outcomes", "In-browser canvas drawing; corrected file auto-replaces original upload.", "Instant student/parent feedback + Focus Table recommendation."],
        ["Workflow 5.3: PTM Closed-Loop Governance", "Parent, Teacher, DB Lock, Academics", "SELECT ... FOR UPDATE locks; cancellation protocol; attendance & summary notes.", "Zero double-bookings; meeting notes delivered to parent; audited by Academics."],
        ["Workflow 5.4: Dual-Signature Student Exit", "Parent, Principal, Library, Finance", "All dues verified; Parent Digital OTP + Principal Scanned Physical Seal.", "Tamper-evident digital TC issuance + permanent vault sealing."],
        ["Workflow 5.5: Batch Exam & Dynamic Admit Card", "Exam Coord, Accounts, Student, DB", "Atomic batch creation (batch_id, series_name); fee clearance gating.", "Dynamic admit card with hall name, seat number, and QR code."],
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
