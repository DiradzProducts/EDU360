import os
import fitz

def build_2page_resume():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    output_pdf = os.path.join(base_dir, "Bhargava_Durga_Prasad_Gajula_SDE_Resume.pdf")
    artifact_dir = r"C:\Users\Bhargav\.gemini\antigravity\brain\040c0e45-c080-4fc5-9468-d66a193f22f6"
    artifact_pdf = os.path.join(artifact_dir, "Bhargava_Durga_Prasad_Gajula_SDE_Resume.pdf")
    p1_png = os.path.join(artifact_dir, "resume_preview_p1.png")
    p2_png = os.path.join(artifact_dir, "resume_preview_p2.png")

    html_content = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: a4;
    margin: 28pt 36pt;
  }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #0f172a;
    font-size: 9pt;
    line-height: 1.34;
    margin: 0;
    padding: 0;
  }
  
  /* Header */
  .header {
    text-align: center;
    margin-bottom: 5pt;
    border-bottom: 1.5pt solid #0f172a;
    padding-bottom: 5pt;
  }
  h1 {
    font-size: 18pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #0f172a;
    margin: 0 0 3pt 0;
  }
  .contact-bar {
    font-size: 8.8pt;
    color: #334155;
    margin: 0;
  }
  .contact-bar a {
    color: #0284c7;
    text-decoration: none;
    font-weight: 600;
  }
  .separator {
    color: #94a3b8;
    margin: 0 4pt;
  }

  /* Section Titles */
  .section-title {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #0f172a;
    border-bottom: 0.8pt solid #cbd5e1;
    padding-bottom: 2pt;
    margin-top: 7pt;
    margin-bottom: 3.5pt;
  }

  /* Professional Summary */
  .summary-text {
    font-size: 8.8pt;
    color: #1e293b;
    margin: 0 0 4pt 0;
    text-align: justify;
    line-height: 1.32;
  }

  /* Skills Table */
  .skills-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 4pt;
  }
  .skills-table td {
    padding: 1.2pt 0;
    font-size: 8.8pt;
    vertical-align: top;
  }
  .skill-category {
    font-weight: 700;
    color: #0f172a;
    width: 27%;
    padding-right: 8pt;
  }
  .skill-list {
    color: #334155;
    width: 73%;
  }

  /* 2-Column Item Table */
  .item-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 3pt;
  }
  .item-left {
    width: 72%;
    text-align: left;
    vertical-align: top;
  }
  .item-right {
    width: 28%;
    text-align: right;
    vertical-align: top;
  }
  
  .entry-title {
    font-size: 9.3pt;
    font-weight: 700;
    color: #0f172a;
  }
  .entry-company {
    font-size: 9.1pt;
    font-weight: 600;
    color: #0369a1;
  }
  .entry-date {
    font-size: 8.4pt;
    color: #475569;
    font-weight: 600;
  }
  .entry-location {
    font-size: 8.3pt;
    color: #64748b;
    font-style: italic;
  }
  .sub-tagline {
    font-size: 8.4pt;
    font-style: italic;
    color: #475569;
    margin-top: 1pt;
    margin-bottom: 2pt;
  }

  /* Bullets */
  ul.bullets {
    margin: 2pt 0 5pt 0;
    padding-left: 13pt;
  }
  ul.bullets li {
    font-size: 8.7pt;
    color: #1e293b;
    margin-bottom: 2.2pt;
    line-height: 1.30;
    text-align: justify;
  }
  ul.bullets li strong {
    color: #0f172a;
  }

  .cert-list {
    font-size: 8.7pt;
    color: #334155;
    margin: 2pt 0 0 0;
    line-height: 1.35;
  }

  .page-break {
    page-break-before: always;
    break-before: page;
  }
</style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->

  <!-- HEADER -->
  <div class="header">
    <h1>Bhargava Durga Prasad Gajula</h1>
    <div class="contact-bar">
      Hyderabad, India 
      <span class="separator">|</span> +91 9014966517 
      <span class="separator">|</span> <a href="mailto:bhargavagajula2003@gmail.com">bhargavagajula2003@gmail.com</a>
      <span class="separator">|</span> <a href="https://www.linkedin.com/in/bhargava-durga-prasad-gajula">LinkedIn</a>
      <span class="separator">|</span> <a href="https://github.com/bhargavagajula">GitHub</a>
    </div>
  </div>

  <!-- PROFESSIONAL SUMMARY -->
  <div class="section-title">Professional Summary</div>
  <div class="summary-text">
    <strong>Software Development Engineer (SDE)</strong> with comprehensive hands-on expertise in full-stack architecture, asynchronous backend microservices, RESTful API engineering, and real-time WebRTC media pipelines. Proficient in <strong>Python, FastAPI, Next.js, TypeScript, PostgreSQL, and AWS</strong>. Demonstrated engineering leadership by independently architecting, developing, and testing <strong>EDU360</strong> — an active intelligence virtual academy ecosystem with AI proctoring via Google MediaPipe. Proven capability in rigorous manual and API QA testing suites, building high-throughput relational database architectures, and solving 120+ Data Structures & Algorithms challenges.
  </div>

  <!-- TECHNICAL SKILLS -->
  <div class="section-title">Technical Skills</div>
  <table class="skills-table">
    <tr>
      <td class="skill-category">Programming Languages:</td>
      <td class="skill-list">Python, TypeScript, JavaScript, SQL (PostgreSQL, MySQL, SQLite), HTML5, CSS3</td>
    </tr>
    <tr>
      <td class="skill-category">Backend & Frameworks:</td>
      <td class="skill-list">FastAPI, Next.js 16 (App Router), React, RESTful APIs, Pydantic v2, SQLAlchemy 2.0 ORM, Uvicorn, WebSockets</td>
    </tr>
    <tr>
      <td class="skill-category">Real-Time & AI / ML:</td>
      <td class="skill-list">LiveKit, WebRTC Protocols, Google MediaPipe (Face Mesh & Gaze Tracking), Hugging Face Transformers, Scikit-learn</td>
    </tr>
    <tr>
      <td class="skill-category">Databases & Storage:</td>
      <td class="skill-list">PostgreSQL, SQLite, MySQL, Relational Schema Modeling, Query Optimization, ACID Transactions</td>
    </tr>
    <tr>
      <td class="skill-category">Cloud, DevOps & Tools:</td>
      <td class="skill-list">Amazon Web Services (AWS - EC2, S3, IAM basics), Postman, Git, GitHub, Linux/Bash, Antigravity AI Orchestration</td>
    </tr>
    <tr>
      <td class="skill-category">Testing & QA:</td>
      <td class="skill-list">Manual Testing, API Testing (Postman/cURL), Regression Testing, System Integration Testing, Agile/Scrum</td>
    </tr>
    <tr>
      <td class="skill-category">Core Computer Science:</td>
      <td class="skill-list">Data Structures & Algorithms (DSA), Object-Oriented Design (OOP), System Architecture, Role-Based Access Control (RBAC)</td>
    </tr>
  </table>

  <!-- WORK EXPERIENCE -->
  <div class="section-title">Professional Experience</div>

  <!-- Diradz Solutions -->
  <table class="item-table">
    <tr>
      <td class="item-left"><span class="entry-title">Software Engineer Intern</span> <span class="entry-company">— Diradz Solutions</span> (Hybrid)</td>
      <td class="item-right entry-date">Apr 2026 – Present</td>
    </tr>
    <tr>
      <td class="item-left sub-tagline">Flagship Product: <strong>EDU360</strong> — Online Academy Active Intelligence & AI Proctoring Platform</td>
      <td class="item-right entry-location">Bangalore / Guntur, India</td>
    </tr>
  </table>
  <ul class="bullets">
    <li><strong>Full-Stack Architecture & System Ownership:</strong> Single-handedly architected and engineered <strong>EDU360</strong> from concept to deployment using Next.js 16 (App Router), TypeScript, Python 3.11+ (FastAPI), and PostgreSQL/SQLite, building <strong>203 RESTful API endpoints</strong> across 8 canonical institutional portals (Admin, Academic, Exam, Accounts, Admissions, Teacher, Student, Parent).</li>
    <li><strong>Real-Time Video & WebRTC Infrastructure:</strong> Integrated LiveKit media server and WebRTC transport protocols, establishing sub-200ms latency video classrooms, automated 10-minute webhook attendance captures, and real-time teacher-student room coordination.</li>
    <li><strong>In-Browser AI Exam Proctoring Engine:</strong> Engineered a lightweight automated invigilation system using Google MediaPipe ML algorithms, processing candidate video feeds in real time to detect face presence, head pose deflection, gaze deviation, and multi-face intrusions with zero cloud inference cost.</li>
    <li><strong>Database Design & High-Performance ORM:</strong> Architected relational database schemas using SQLAlchemy 2.0 ORM and Pydantic v2 validation models, optimizing async connection pooling, indexing, and complex queries across high-throughput academic workflows.</li>
    <li><strong>Comprehensive API & Manual Testing Suites:</strong> Authored extensive test matrices and executed rigorous manual and automated API testing using Postman collections and custom Python test scripts, validating payload schemas, HTTP status codes, authorization headers, and edge-case exception handling across all 200+ endpoints.</li>
    <li><strong>Academic Outcomes & Governance Cockpit:</strong> Built dynamic Red/Orange/Green Priority Triage engines evaluating learning drops, consecutive student absences, and fee arrears every 60 seconds; implemented in-browser canvas SpeedGrader with digital red pen for streamlined teacher evaluations.</li>
    <li><strong>Cloud Infrastructure & Agentic Development:</strong> Configured AWS cloud resources (EC2 compute, S3 object storage for hall tickets/memos, IAM policy governance) and leveraged Antigravity AI agent workflows to conduct research, blueprint workflows, and accelerate sprint velocity.</li>
  </ul>

  <!-- PAGE BREAK TO PAGE 2 -->
  <div class="page-break"></div>

  <!-- ==================== PAGE 2 ==================== -->

  <!-- CONTINUED WORK EXPERIENCE -->
  <div class="section-title">Professional Experience (Continued)</div>

  <!-- Lurnexa Publications -->
  <table class="item-table">
    <tr>
      <td class="item-left"><span class="entry-title">Data Analyst Intern</span> <span class="entry-company">— Lurnexa Publications</span></td>
      <td class="item-right entry-date">Nov 2025 – Mar 2026</td>
    </tr>
    <tr>
      <td class="item-left sub-tagline">Data Ingestion Pipelines, Funnel Analytics & Reporting Automation</td>
      <td class="item-right entry-location">Hyderabad, India</td>
    </tr>
  </table>
  <ul class="bullets">
    <li><strong>Data Pipeline Engineering & Quality Control:</strong> Ingested, cleaned, and normalized 50,000+ customer and textbook purchase inquiry records using Python (Pandas, NumPy) and SQL, resolving structural inconsistencies and establishing standardized database tables.</li>
    <li><strong>Exploratory Data Analysis (EDA) & Behavior Modeling:</strong> Conducted comprehensive exploratory data analysis to evaluate buyer trends and user engagement patterns, identifying drop-off stages in the ordering funnel that informed targeted marketing strategies.</li>
    <li><strong>Acquisition Funnel Tracking:</strong> Configured Google Analytics 4 (GA4) custom event tracking across web properties to monitor user journey flows, measure traffic attribution channels, and optimize conversion pathways.</li>
    <li><strong>Dashboard Automation & Decision Support:</strong> Designed interactive business intelligence dashboards in Power BI and Excel, synthesizing key performance indicators (KPIs) and reducing recurring reporting cycles by 40% for cross-functional leadership.</li>
  </ul>

  <!-- KEY TECHNICAL PROJECTS -->
  <div class="section-title">Key Technical Projects</div>

  <!-- News Sentiment Analyzer -->
  <table class="item-table">
    <tr>
      <td class="item-left"><span class="entry-title">News Sentiment Analyzer & Regional Voice Engine</span></td>
      <td class="item-right entry-date">May 2025</td>
    </tr>
    <tr>
      <td class="item-left sub-tagline" colspan="2">Tech Stack: Python, FastAPI, Hugging Face Transformers, Streamlit, RESTful APIs</td>
    </tr>
  </table>
  <ul class="bullets">
    <li>Engineered an asynchronous NLP ingestion and classification pipeline utilizing pre-trained transformer models to categorize corporate and financial news articles with 90%+ classification accuracy.</li>
    <li>Designed modular REST API endpoints in FastAPI for batch article processing, sentiment scoring (positive, negative, neutral), and keyword trend extraction.</li>
    <li>Developed an interactive Streamlit web dashboard and integrated Telugu text-to-speech (TTS) voice synthesis, delivering accessible regional audio summaries for non-English speakers.</li>
  </ul>

  <!-- ASCEND Platform -->
  <table class="item-table">
    <tr>
      <td class="item-left"><span class="entry-title">ASCEND — AI-Driven Career Exploration Platform</span></td>
      <td class="item-right entry-date">Nov 2024 – Feb 2025</td>
    </tr>
    <tr>
      <td class="item-left sub-tagline" colspan="2">Tech Stack: Python, Flask, Scikit-learn, Word2Vec, SQLite, REST APIs</td>
    </tr>
  </table>
  <ul class="bullets">
    <li>Developed an intelligent career guidance recommendation engine matching student competencies and profiles against 1,000+ industry job descriptions using Word2Vec continuous bag-of-words and cosine similarity algorithms.</li>
    <li>Structured relational SQLite database schemas to index job role competencies, skill tags, and career trajectories, supporting sub-100ms recommendation query latency.</li>
    <li>Built responsive Flask backend services providing structured recommendation payloads to the client interface.</li>
  </ul>

  <!-- Retail Sales Insights -->
  <table class="item-table">
    <tr>
      <td class="item-left"><span class="entry-title">Retail Sales Insights & Performance Analytics Engine</span></td>
      <td class="item-right entry-date">Feb 2026</td>
    </tr>
    <tr>
      <td class="item-left sub-tagline" colspan="2">Tech Stack: SQL, Power BI, Python (Pandas), Excel, Data Modeling</td>
    </tr>
  </table>
  <ul class="bullets">
    <li>Analyzed 50,000+ retail sales records using advanced SQL queries (Common Table Expressions, window functions, aggregations) to uncover revenue velocity, regional growth patterns, and product profitability.</li>
    <li>Engineered star-schema data models and interactive Power BI executive dashboards displaying monthly sales KPIs, margin trends, and category performance.</li>
    <li>Automated data cleaning and transformation workflows, delivering actionable operational insights to optimize inventory allocation.</li>
  </ul>

  <!-- EDUCATION -->
  <div class="section-title">Education</div>
  <table class="item-table">
    <tr>
      <td class="item-left"><span class="entry-title">Vasireddy Venkatadri Institute of Technology (VVIT)</span></td>
      <td class="item-right entry-location">Guntur, Andhra Pradesh, India</td>
    </tr>
    <tr>
      <td class="item-left" style="font-size: 8.8pt; color: #1e293b;">Bachelor of Technology (B.Tech) in Artificial Intelligence & Machine Learning &nbsp;|&nbsp; <strong>GPA: 7.4 / 10.0</strong></td>
      <td class="item-right entry-date">Nov 2021 – Jun 2025</td>
    </tr>
  </table>
  <div style="font-size: 8.5pt; color: #475569; margin-top: 1.5pt;">
    <strong>Relevant Coursework:</strong> Data Structures & Algorithms, Object-Oriented Programming (Java/Python), Database Management Systems (DBMS), Operating Systems, Computer Networks, Software Engineering Principles.
  </div>

  <!-- CERTIFICATIONS & PROBLEM SOLVING -->
  <div class="section-title">Certifications & Problem Solving</div>
  <div class="cert-list">
    • <strong>Problem Solving:</strong> Solved <strong>120+ Data Structures & Algorithms and SQL</strong> challenges on LeetCode demonstrating solid computational logic and algorithmic complexity optimization.<br>
    • <strong>Machine Learning with Python</strong> — IBM &nbsp;|&nbsp; <strong>Python for Data Science</strong> — NPTEL<br>
    • <strong>Full-Stack Web & Databases (SQL, MongoDB, JavaScript)</strong> — Udemy &nbsp;|&nbsp; <strong>Generative AI Fundamentals</strong> — Google Skills Boost<br>
    • <strong>HTML5 & CSS3 Web Development</strong> — Infosys Springboard &nbsp;|&nbsp; <strong>Power BI & Business Analytics</strong> — Simplilearn
  </div>

</body>
</html>
"""

    mediabox = fitz.paper_rect("a4")
    margin_x = 32
    margin_y = 28
    rect = fitz.Rect(margin_x, margin_y, mediabox.width - margin_x, mediabox.height - margin_y)

    story = fitz.Story(html=html_content)

    def rectfn(rect_num, filled):
        return mediabox, rect, None

    writer = fitz.DocumentWriter(output_pdf)
    story.write(writer, rectfn)
    writer.close()

    doc = fitz.open(output_pdf)
    pages = len(doc)
    print(f"Generated PDF with {pages} page(s).")
    
    # Save preview images
    for i in range(pages):
        page = doc[i]
        pix = page.get_pixmap(dpi=150)
        img_out = p1_png if i == 0 else (p2_png if i == 1 else os.path.join(artifact_dir, f"resume_preview_p{i+1}.png"))
        pix.save(img_out)
        print(f"Saved preview page {i+1} to: {img_out}")

    # Save to artifact dir
    os.makedirs(artifact_dir, exist_ok=True)
    doc.save(artifact_pdf)
    doc.close()
    return pages

if __name__ == "__main__":
    build_2page_resume()
