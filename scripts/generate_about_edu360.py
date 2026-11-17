"""
Generate ABOUT_EDU360.docx and ABOUT_EDU360.md
Full Master PRD with exact template, scenario workflows, permission matrix,
and technical specifications.
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
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        for r in p.runs:
            r.font.name = 'Calibri'
            r.font.size = Pt(9.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
            
    for r_idx, row_data in enumerate(data):
        row_cells = table.add_row().cells
        bg_color = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            row_cells[c_idx].text = str(val)
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=110, right=110)
            p = row_cells[c_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Calibri'
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
                
    for row in table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = Inches(width)
            tcPr = row.cells[idx]._tc.get_or_add_tcPr()
            b = parse_xml(
                f'<w:tcBorders {nsdecls("w")}>'
                f'<w:top w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                f'<w:left w:val="none"/>'
                f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                f'<w:right w:val="none"/>'
                f'</w:tcBorders>'
            )
            tcPr.append(b)

def add_bullet(doc, title, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(2)
    r1 = p.add_run(f"{title}: ")
    r1.bold = True
    r1.font.name = 'Calibri'
    r1.font.size = Pt(10)
    r1.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
    
    r2 = p.add_run(text)
    r2.font.name = 'Calibri'
    r2.font.size = Pt(10)
    r2.font.color.rgb = RGBColor(0x33, 0x41, 0x55)

def add_ascii_diagram(doc, title, diagram_lines):
    add_heading(doc, title, level=3)
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "0F172A")
    set_cell_margins(cell, top=130, bottom=130, left=160, right=160)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run("\n".join(diagram_lines))
    r.font.name = 'Consolas'
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(0x38, 0xBD, 0xF8)
    doc.add_paragraph().paragraph_format.space_after = Pt(3)

def generate_about_edu360():
    doc = docx.Document()
    for s in doc.sections:
        s.top_margin = Inches(0.75)
        s.bottom_margin = Inches(0.75)
        s.left_margin = Inches(0.75)
        s.right_margin = Inches(0.75)

    # Document Header
    top_p = doc.add_paragraph()
    top_p.paragraph_format.space_before = Pt(10)
    top_p.paragraph_format.space_after = Pt(4)
    r_hdr = top_p.add_run("PRODUCT REQUIREMENTS DOCUMENT (PRD)\n")
    r_hdr.font.name = 'Calibri'
    r_hdr.font.size = Pt(11)
    r_hdr.font.bold = True
    r_hdr.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

    r_title = top_p.add_run("ABOUT EDU360 — K–12 School Management & Student Outcomes Platform")
    r_title.font.name = 'Calibri'
    r_title.font.size = Pt(20)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(12)
    r_sub = sub_p.add_run("Version: 7.0 Production Master | Target Segment: K–12 (Nursery to Class 12) | Platforms: Web App & Mobile App")
    r_sub.font.name = 'Calibri'
    r_sub.font.size = Pt(10.5)
    r_sub.font.color.rgb = RGBColor(0x64, 0x74, 0x8B)

    # 1. Executive Summary
    add_heading(doc, "1. Executive Summary & Product Vision", level=1)
    p = doc.add_paragraph()
    p.add_run(
        "EDU360 is a next-generation School Management and Student Outcomes Platform designed for K–12 schools. "
        "While traditional School ERPs act only as digital registers that store records and send repetitive notifications, "
        "EDU360 acts as an Action & Intelligence System that connects Administration, Teachers, Parents, and Students around three core principles:"
    )

    add_bullet(doc, "1. Actionable Management Intelligence", "Instead of forcing school management to search through dozens of static reports, EDU360 highlights what needs attention today, why it matters, and who needs to take action using a Red / Orange / Green Priority Engine.")
    add_bullet(doc, "2. Outcome-Oriented Parent Involvement", "Instead of spamming parents with 15 notifications a day, EDU360 uses a moving-slider banner on the home screen for routine updates and a shared Student Focus Table so teachers and parents work together to improve a child's weak subjects.")
    add_bullet(doc, "3. Zero Extra Burden for Teachers", "Automates routine work like online class attendance (via a 10-minute join rule), allows teachers to correct and remark on uploaded homework directly inside the browser canvas without downloading or re-uploading files, and auto-resolves proxy timetable gaps.")

    # 2. Platform Strategy
    add_heading(doc, "2. Platform Strategy (Web vs. Mobile Usage)", level=1)
    p = doc.add_paragraph()
    p.add_run("Based on how school stakeholders work every day, EDU360 follows a Role-Optimized Platform Strategy:")

    plat_headers = ["User Role", "Primary Platform", "Secondary Platform", "Why This Fits Daily Workflow"]
    plat_widths = [1.6, 1.8, 1.8, 2.0]
    plat_data = [
        ["Administration / Management", "Web App (Desktop/Laptop)", "Mobile Web / App (Quick Alerts)", "Needs a large screen for priority triage, admissions CRM, fee milestones, inventory, staff salaries, and event/vendor tracking."],
        ["Coordinators (Academic, Exam, Accounts)", "Web App (Desktop)", "Tablet Web", "Wide master timetable grids, vacancy proxy matching, exam seat allocation maps, and payroll disbursement runs."],
        ["Teachers", "Web App (Desktop/Tablet)", "Mobile App (Leave & Quick Chat)", "Needs a comfortable screen to host live classes, annotate and correct student homework inline, and manage Student Focus Tables."],
        ["Students (Senior)", "Web App (Desktop/Tablet)", "Mobile App (Timetable & Alerts)", "Needs a larger screen to attend live online classes, watch class recordings, take online exams, and upload homework/achievements."],
        ["Students (Junior K–5)", "Web App / Tablet App", "Mobile (Parent-Guided)", "Engaging gamified environment featuring the Adventure Timetable, Daily Quests, and Magic Booster Chests."],
        ["Parents", "Mobile App (Android & iOS)", "Web Portal (Optional)", "Parents check updates on the go—viewing moving dashboard sliders, tracking the school bus via GPS, paying fees, and checking the Focus Table."]
    ]
    t = doc.add_table(rows=1, cols=4)
    format_table(t, plat_widths, plat_headers, plat_data, header_bg="1E3A8A")

    # 3. User Roles & Permission Matrix
    add_heading(doc, "3. User Roles & Permission Matrix", level=1)
    add_callout(
        doc,
        "IMPORTANT — Strict Document Security Rule",
        "Official student documents in the Student Information System (SIS) can ONLY be uploaded, edited, or replaced by Administration. Teachers, Parents, and Students have strictly View/Download-Only access.",
        bg_hex="FEF2F2", border_hex="EF4444"
    )

    perm_headers = ["Module / Capability", "Administration", "Coordinators", "Teacher", "Parent", "Student"]
    perm_widths = [1.8, 1.3, 1.3, 1.2, 1.2, 1.2]
    perm_data = [
        ["SIS Official Documents", "Create / Edit / Delete", "View / Audit", "View Only", "View Only", "View Only"],
        ["Student SIS Profile & Analytics", "Full Access", "Department Scope", "Assigned Students", "View Own Child", "View Own Profile"],
        ["Live Online Classes & Recordings", "Monitor / View", "Supervise", "Host & Record", "View Schedule", "Join Class & Watch"],
        ["Attendance", "Full Access + Override", "Department View", "Auto-Capture + Edit", "View + Submit Leave", "View Own Attendance"],
        ["Homework & Assignments", "View / Audit", "Audit Sample", "Create + Canvas Mark", "View Remarks & Status", "Upload Work + View"],
        ["Student 'Focus Table'", "View All", "Department View", "Create / Edit / Track", "View / Co-Track", "View Study Plan"],
        ["Exams & Marks", "Publish + Seal", "Manage Blueprint", "Enter / Upload Marks", "View + Email Receipt", "Attend Exam + Results"],
        ["Fees & Receipts", "Set & Reconcile", "Clearance Sync", "Context Only", "Pay Online + PDF", "View Status"],
        ["Staff, Salaries & Vendors", "Full Access", "Department Lead", "Own Profile / Leave", "No Access", "No Access"],
        ["Inventory & School Assets", "Full Access", "PO / Asset Track", "Request / Assigned", "No Access", "No Access"],
        ["Timetable & Substitution", "Audit Only", "Full Assign (Locks)", "Accept Cover", "View Schedule", "View Schedule"],
        ["Entry/Exit & TC Clearance", "Full Control + Verify", "Checklist Clearance", "No Access", "Digital Sign-Off", "View Status"]
    ]
    t = doc.add_table(rows=1, cols=6)
    format_table(t, perm_widths, perm_headers, perm_data, header_bg="1E3A8A")

    # 4. Detailed Functional Requirements by Role
    add_heading(doc, "4. Detailed Functional Requirements by Role", level=1)

    add_heading(doc, "4.1 Role 1: Student Portal (Web-First)", level=2)
    add_bullet(doc, "1. Class Dashboard & Recordings (LMS Layer)", "Students see their daily live class schedule and join online classes with 1 click via built-in LiveKit WebRTC video. Past recorded classes are organized by Subject, Chapter, and Date.")
    add_bullet(doc, "2. Student Information System (SIS — Global Profile)", "Connected across all modules. Displays complete exam results, attendance trends, applied leaves, performance analytics charts, and View-Only official documents.")
    add_bullet(doc, "3. Attendance & Leave History", "Displays daily and subject-wise attendance status (Present, Absent, Late, Approved Leave) and monthly percentage.")
    add_bullet(doc, "4. Homework Module (Upload & Corrected Canvas)", "Students view daily homework, upload completed homework (PDF/images), and view the teacher-corrected document with inline remarks.")
    add_bullet(doc, "5. Exams & Assignments (Online & Offline)", "Attend online timed quizzes/exams directly in the portal and view offline exam schedules, seating plans, and published marks.")
    add_bullet(doc, "6. Participations & Achievements (Side-by-Side Portfolio)", "Left Section (Participations) lists school events and sports joined; Right Section (Achievements) lets students upload certificates and awards earned.")
    add_bullet(doc, "7. Junior K–5 Gamification", "Elementary mode featuring Adventure Timetable, daily quests, Magic Booster Chest unlocks, sound effects, and live bus radar tracking.")

    add_heading(doc, "4.2 Role 2: Teacher Portal (Web-First)", level=2)
    add_callout(
        doc,
        "Zero-Burden Design Rule for Teachers",
        "Every teacher workflow must minimize manual data entry. Attendance in online classes is captured automatically, homework is corrected inline without downloading files, and marks can be bulk-uploaded or auto-graded.",
        bg_hex="F0F9FF", border_hex="0284C7"
    )
    add_bullet(doc, "1. Teacher Dashboard & Personal Roster", "Displays today's classes, pending homework submissions to grade, student leave requests, personal attendance/salary details, and assigned event duties.")
    add_bullet(doc, "2. Class Dashboard & 10-Minute Auto-Attendance Rule", "Teachers initiate live online classes from their dashboard. Students joining within the first 10 minutes are auto-marked PRESENT. Students joining between 10-25 minutes flagged as LATE (1-click approve); >25m ABSENT.")
    add_bullet(doc, "3. Inline Homework Correction & Remarks Canvas", "Teachers open student-uploaded homework directly inside the browser canvas, draw corrections, write remarks, and save. The corrected file automatically updates for student and parent.")
    add_bullet(doc, "4. Per-Student 'Focus Table' (1-Week Remedial Intelligence)", "Based on exam performance (<=70% threshold), a personalized Focus Timetable highlights weak concepts with 7-day practice questions and rough-work verification.")
    add_bullet(doc, "5. Faculty Personal Schedule & Proxy Covers", "Live period tracker displaying assigned teaching periods alongside injected proxy covers with absent teacher context.")
    add_bullet(doc, "6. PTM Calendar Slot Governance", "Teachers publish, block, or cancel 15-minute conference windows with parent notification triggers and snapshot undo restoration.")

    add_heading(doc, "4.3 Role 3: Parent Application (Mobile-First)", level=2)
    add_bullet(doc, "1. Anti-Spam 'Moving Slider' Dashboard", "Routine school updates ('Results Are Out', 'Annual Day in 1 Week', 'Holiday Notice') appear as interactive moving slides at the top of the Parent App. Parents are onboarded to open the app once daily.")
    add_bullet(doc, "2. High-Signal Push Notifications Only", "Phone push notifications strictly reserved for urgent items: Teacher Remarks, Focus Table updates, consecutive absence alerts, and fee reminders.")
    add_bullet(doc, "3. Automated Email Delivery for Marks & Receipts", "Exam report cards and fee payment receipts are automatically sent as formatted PDFs to the parent's registered email.")
    add_bullet(doc, "4. Closed-Loop PTM Booking", "Parents self-book 15-minute consultation slots with homeroom/subject teachers, pre-selecting Focus Table weak topics as mandatory discussion agendas.")
    add_bullet(doc, "5. Live Bus GPS Tracking", "Parents track their child's assigned school bus route and live GPS location on the map during pickup and drop-off hours.")

    add_heading(doc, "4.4 Role 4: Administration & Coordinator Cockpits (Web-First)", level=2)
    add_bullet(doc, "1. Priority Triage Command Center", "Autonomous Red/Orange/Green Action Engine highlighting top issues (e.g. 20 students absent, 18% mark drop, 30 fee arrears) with recommended next actions.")
    add_bullet(doc, "2. Admissions CRM & 1-Click SIS Conversion", "Visual Kanban tracking leads from enquiry to tour, with 1-click atomic conversion into active SIS student profiles with roll numbers and invoices.")
    add_bullet(doc, "3. Timetable Proxy Governor with Row Locks", "Algorithmic solver matching absent teacher periods with available qualified faculty using PostgreSQL pessimistic row-locks (.with_for_update()).")
    add_bullet(doc, "4. Accounts Aging Ledger & Staff Payroll", "Classifies arrears into 0-15d, 16-30d, 30+d buckets with WhatsApp dispatch, gateway reconciliation, and staff payroll generation.")
    add_bullet(doc, "5. Entry/Exit Management & Dual-Signature TC Clearance", "Records parent digital OTP sign-off + scanned copy of physical signature locked permanently in the SIS vault.")

    # 5. Key System Workflows & Flow Diagrams
    add_heading(doc, "5. Key System Workflows & Flow Diagrams", level=1)

    # 5.1
    w1_lines = [
        "+-----------------------------------------------------------------------------------------+",
        "|                 WORKFLOW 5.1: 10-MINUTE AUTO-ATTENDANCE & ADMIN TRIAGE                  |",
        "+-----------------------------------------------------------------------------------------+",
        "  [1. Teacher Starts Online Class at T = 0 (LiveKit WebRTC Active)]                       ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  [2. System Checks Student Join Timestamp]                                                ",
        "              |                                                                            ",
        "      +-------+-------+-------------------------+                                          ",
        "      |               |                         |                                          ",
        "  (delta_t <= 10m)    (10m < delta_t <= 25m)    (delta_t > 25m / No Join)                  ",
        "      |               |                         |                                          ",
        "      v               v                         v                                          ",
        "  [Auto: PRESENT]     [Flagged: LATE]           [Auto: ABSENT]                             ",
        "  (Updated in SIS)    (1-Click Teacher Action)  (Logged in Central SIS)                    ",
        "                                                        |                                  ",
        "                                                        v                                  ",
        "                                        [Absent 3+ Consecutive Days?]                      ",
        "                                                        |                                  ",
        "                                                +-------+-------+                          ",
        "                                                |               |                          ",
        "                                            (No < 3d)       (Yes 3+d)                      ",
        "                                                |               |                          ",
        "                                                v               v                          ",
        "                                          [Standard Notice] [RED ALERT on Admin Dashboard] "
    ]
    add_ascii_diagram(doc, "Workflow 5.1: Online Class 10-Minute Auto-Attendance & Admin Triage", w1_lines)

    step_headers = ["Step", "Actor / System", "Rule / Action", "System Output"]
    step_widths = [1.2, 1.6, 2.2, 2.2]
    step_data_1 = [
        ["Step 1", "Teacher", "Starts live online class from Class Dashboard at T = 0.", "Video room opens; attendance webhook listener starts."],
        ["Step 2", "System (Auto)", "Checks student join time against 10-minute rule.", "0–10 mins = PRESENT | >10 mins = LATE | No join = ABSENT."],
        ["Step 3", "System (Auto)", "Checks if absent student has 3+ consecutive absences.", "If Yes: Raises RED Alert on Admin Dashboard + Push Alert to Parent."]
    ]
    t = doc.add_table(rows=1, cols=4)
    format_table(t, step_widths, step_headers, step_data_1, header_bg="0284C7")

    # 5.2
    w2_lines = [
        "+-----------------------------------------------------------------------------------------+",
        "|             WORKFLOW 5.2: INLINE HOMEWORK GRADING & SHARED FOCUS TABLE                  |",
        "+-----------------------------------------------------------------------------------------+",
        "  [1. Student Uploads Homework Worksheet (PDF/Image) in Student Portal]                    ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  [2. Teacher Opens File Inline in Browser Canvas (No Download Required)]                   ",
        "  Draws corrections, annotates calculation skips, and writes rubric remarks                ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  [3. Cloud Document Auto-Updated & Versioned in Database]                                  ",
        "              |                                                                            ",
        "      +-------+-------+                                                                    ",
        "      |               |                                                                    ",
        "      v               v                                                                    ",
        "  [4A. High-Signal Alert] [4B. Updates Shared Student Focus Table]                         ",
        "  Parent receives remark   Weekly study timetable adjusts; Teacher & Parent                ",
        "  notification directly    co-track weak concepts together                                 "
    ]
    add_ascii_diagram(doc, "Workflow 5.2: Homework Submission, Inline Correction & Focus Table", w2_lines)

    step_data_2 = [
        ["Step 1", "Student", "Uploads completed homework (PDF/Image) in Student Portal.", "File saved in database/storage and added to Teacher grading queue."],
        ["Step 2", "Teacher", "Opens file inline in browser canvas, draws corrections & remarks.", "Annotated file replaces/versions original homework document."],
        ["Step 3", "System + Parent", "Sends high-priority notification & updates Focus Table.", "Parent & Teacher co-track weak concepts on shared Focus Table."]
    ]
    t = doc.add_table(rows=1, cols=4)
    format_table(t, step_widths, step_headers, step_data_2, header_bg="0284C7")

    # 5.3
    w3_lines = [
        "+-----------------------------------------------------------------------------------------+",
        "|             WORKFLOW 5.3: STUDENT SCHOOL EXIT & DUAL-SIGNATURE CLEARANCE                 |",
        "+-----------------------------------------------------------------------------------------+",
        "  [1. Exit / TC Request Initiated by Departing Student]                                    ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  [2. Automated Dues Check: Fee Milestones, Library Books & School Assets Cleared]         ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  [3. Official Certificates Prepared: TC, Marks Memo & Conduct Certificate]                ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  [4. Parent Digital Approval: Confirms All Originals Received via App / OTP]               ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  [5. Physical Signature Scan: Admin Uploads Signed Physical Handover Sheet]               ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  [6. Permanent Legal Archive in SIS Vault: Both Proofs Locked (Zero Future Disputes)]     "
    ]
    add_ascii_diagram(doc, "Workflow 5.3: Student School Exit & Dual-Signature Legal Clearance", w3_lines)

    step_data_3 = [
        ["Step 1", "Admin + System", "Initiates student exit and verifies zero pending fee/library dues.", "Clearance checklist unlocked; original TC & certificates prepared."],
        ["Step 2", "Parent", "Reviews original certificates and provides Digital Approval (App/OTP).", "Timestamped digital acknowledgment recorded in SIS."],
        ["Step 3", "Admin", "Uploads scanned copy of physically signed handover form.", "Digital + Physical proofs permanently locked to prevent future disputes."]
    ]
    t = doc.add_table(rows=1, cols=4)
    format_table(t, step_widths, step_headers, step_data_3, header_bg="0284C7")

    # 5.4 - New Concurrency Workflow
    w4_lines = [
        "+-----------------------------------------------------------------------------------------+",
        "|       WORKFLOW 5.4: TIMETABLE PROXY SUBSTITUTION & CONCURRENCY ROW LOCKING               |",
        "+-----------------------------------------------------------------------------------------+",
        "  [Teacher Absence Approved] -> [Unassigned SubstitutionSlot Created in DB]                ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  [Academic Coordinator Selects Proxy Faculty from Available Roster]                       ",
        "              |                                                                            ",
        "              v                                                                            ",
        "  >>> SELECT * FROM substitution_slots WHERE id = slot_id FOR UPDATE (Row Lock)            ",
        "              |                                                                            ",
        "      +-------+-------+                                                                    ",
        "      |               |                                                                    ",
        "  (No Period Clash)   (Faculty Busy in Same Period)                                        ",
        "      |               |                                                                    ",
        "      v               v                                                                    ",
        "  [Status = Assigned] [HTTP 409 Conflict: Blocked with human explanation toast]             ",
        "      |                                                                                    ",
        "      v                                                                                    ",
        "  [Period Badge Injected into Proxy Teacher's Personal Schedule]                           "
    ]
    add_ascii_diagram(doc, "Workflow 5.4: Timetable Proxy Substitution & Concurrency Row Locking", w4_lines)

    # 6. UI/UX Screen Checklist
    add_heading(doc, "6. UI/UX Screen Checklist (For Design & Frontend Teams)", level=1)
    
    scr_headers = ["Role / Portal", "Primary Device", "Core Screens Required in Figma"]
    scr_widths = [1.6, 1.6, 4.0]
    scr_data = [
        [
            "Administration Portal",
            "Web (Desktop)",
            "1. Priority Command Center (Red/Orange/Green Triage + Tasks)\n"
            "2. Admissions CRM (Kanban Pipeline, Lead Table, Call Outcome Logger)\n"
            "3. SIS Directory & Document Vault (Admin-Only Edit Lock)\n"
            "4. Fee Milestone Manager & Arrears Aging Analytics\n"
            "5. Staff Directory, Payroll Batches & Salary Inquiries\n"
            "6. Timetable Substitution & Vacancy Matrix\n"
            "7. Entry/Exit Gate Log & Dual-Signature TC Clearance Modal"
        ],
        [
            "Teacher Portal",
            "Web (Desktop/Tablet)",
            "1. Teacher Home Dashboard (Today's Classes, Pending Homework, Duties)\n"
            "2. Live Class Host Studio + 10-Min Auto-Attendance Roster\n"
            "3. Split-Screen Inline Homework Grader & Remark Canvas\n"
            "4. My Students List & 360° Student Analytics Drill-Down\n"
            "5. Shared Student 'Focus Table' Builder\n"
            "6. Parental Connection Hub (1-on-1 Chat, Online PTM, Student Leave)"
        ],
        [
            "Student Portal",
            "Web (Desktop/Tablet)",
            "1. Senior Home Dashboard (Live Class Schedule, Backlog Radar)\n"
            "2. Live Class WebRTC Room & Recorded Classes Library\n"
            "3. Homework Upload & Teacher-Corrected Document Viewer\n"
            "4. Online Exam Interface & Results Analytics\n"
            "5. Side-by-Side Participations & Achievements Portfolio\n"
            "6. Junior K–5 Adventure Timetable, Quests & Booster Chests"
        ],
        [
            "Parent Application",
            "Mobile App (Android & iOS)",
            "1. Parent Home with Top Moving Banner Carousel (Sliders) & Child Vitals\n"
            "2. Shared Student 'Focus Table' & Teacher Remarks Viewer\n"
            "3. 1-Click PTM Conference Slot Hold & Booking Modal\n"
            "4. Fee Milestones Online Payment (UPI/Cards) & Instant Receipt\n"
            "5. Live School Bus GPS Route Tracker & Digital TC Sign-Off"
        ]
    ]
    t = doc.add_table(rows=1, cols=3)
    format_table(t, scr_widths, scr_headers, scr_data, header_bg="1E3A8A")

    # 7. Recommended Technology Stack
    add_heading(doc, "7. Recommended Technology Stack & Architecture", level=1)
    
    tech_headers = ["Architecture Layer", "Production Technology", "Operational Role & Justification"]
    tech_widths = [1.8, 2.2, 3.2]
    tech_data = [
        ["Web Frontend", "Next.js 14.2.15 (React 18)", "Server-Side Rendering (SSR) for fast loads + Client components for interactive dashboards."],
        ["Language & Typing", "TypeScript (Strict Mode)", "Complete compile-time type safety across all 8 portals (0 errors on tsc --noEmit)."],
        ["Styling & Design", "Tailwind CSS + Lucide React", "Institutional design system with responsive layouts, themes, and micro-interactions."],
        ["Backend API", "FastAPI (Python 3.11+)", "High-throughput asynchronous ASGI runtime handling all SIS, Attendance, and Fees endpoints."],
        ["Primary Database", "PostgreSQL 15+ (asyncpg)", "Enterprise relational database with ACID compliance, JSON column indexing, and foreign keys."],
        ["ORM & Concurrency", "SQLAlchemy 2.0 Async", "Single-pass OUTER JOIN queries + Pessimistic Row Locking (SELECT ... FOR UPDATE)."],
        ["Live Video & Audio", "LiveKit WebRTC Server & SDK", "Embedded in-browser live classes, auto-recording, and join/leave attendance webhooks."],
        ["Security & Auth", "HMAC-SHA256 Signed Tokens", "Dual-mode authentication (Bearer Tokens + Scoped Role Headers) with zero bypasses."],
        ["Artificial Intelligence", "Google Gemini 1.5/2.0 Flash API", "Multimodal remedial sprint generation, rough notebook OCR inspection, and Socratic doubt solving."],
        ["Dynamic Timekeeping", "Centralized ClockProvider", "Decouples time calculations from physical server clock for deterministic testing."]
    ]
    t = doc.add_table(rows=1, cols=3)
    format_table(t, tech_widths, tech_headers, tech_data, header_bg="0284C7")

    # 8. Phased Implementation Roadmap
    add_heading(doc, "8. Phased Implementation Roadmap", level=1)
    
    road_headers = ["Phase / Milestone", "Timeline", "Core Deliverables"]
    road_widths = [1.8, 1.4, 4.0]
    road_data = [
        ["Milestone 1: Core SIS & Governance", "Weeks 1–5 (Completed)", "Role-Based Auth (HMAC tokens + scoped guards), Central SIS Profile, Admin-Only Document Vault lock, Admissions Enquiry CRM, Fee Milestones with receipts, Staff/Payroll, and Dual-Signature Exit/TC Clearance."],
        ["Milestone 2: Classroom, Grading & App", "Weeks 6–10 (Completed)", "Live Online Classes via LiveKit WebRTC, 10-Minute Auto-Attendance Engine, Student Homework Upload + SpeedGrader Canvas, Side-by-Side Portfolio, Parent App Moving Sliders, and PTM Slot Concurrency Row Locks."],
        ["Milestone 3: Intelligence & Pilot", "Weeks 11–14 (Active)", "Admin Red/Orange/Green Priority Triage Engine, Urgent Tasks Manager, Shared Student Focus Table Generator, Dynamic ClockProvider, Live Bus Radar Tracking, and Pilot School Deployment."]
    ]
    t = doc.add_table(rows=1, cols=3)
    format_table(t, road_widths, road_headers, road_data, header_bg="1E3A8A")

    # Save to both paths
    out_docx_1 = os.path.abspath("docs/ABOUT_EDU360.docx")
    out_docx_2 = os.path.abspath("docs/prd/ABOUT_EDU360.docx")
    os.makedirs(os.path.dirname(out_docx_1), exist_ok=True)
    os.makedirs(os.path.dirname(out_docx_2), exist_ok=True)
    doc.save(out_docx_1)
    doc.save(out_docx_2)
    print(f"Generated DOCX: {out_docx_1} and {out_docx_2}")

if __name__ == "__main__":
    generate_about_edu360()
