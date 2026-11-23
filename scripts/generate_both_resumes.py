import os
import fitz

def generate_both():
    base_dir = r"e:\Diradz\EDU360"
    artifact_dir = r"C:\Users\Bhargav\.gemini\antigravity\brain\040c0e45-c080-4fc5-9468-d66a193f22f6"
    
    # -------------------------------------------------------------
    # 1. GENERATE 1-PAGE VERSION (Primary for ATS Checkers / 90+ Score)
    # -------------------------------------------------------------
    with open(os.path.join(base_dir, "scripts", "generate_both_resumes.py"), "r", encoding="utf-8") as f:
        code = f.read()

    # Build 2-page version as well with zero buzzwords
    html_2page = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: a4;
    margin: 28pt 34pt;
  }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #0f172a;
    font-size: 8.9pt;
    line-height: 1.33;
    margin: 0;
    padding: 0;
  }
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
  .summary-text {
    font-size: 8.8pt;
    color: #1e293b;
    margin: 0 0 4pt 0;
    text-align: justify;
    line-height: 1.32;
  }
  .skills-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 4pt;
  }
  .skills-table td {
    padding: 1.4pt 0;
    font-size: 8.8pt;
    vertical-align: top;
  }
  .skill-category {
    font-weight: 700;
    color: #0f172a;
    width: 26%;
    padding-right: 8pt;
  }
  .skill-list {
    color: #334155;
    width: 74%;
  }
  .item-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 3pt;
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

  <!-- SUMMARY (ZERO BUZZWORDS) -->
  <div class="section-title">Professional Summary</div>
  <div class="summary-text">
    <strong>Software Development Engineer (SDE)</strong> specializing in full-stack web platforms, asynchronous backend APIs, and real-time WebRTC media streaming. Built and deployed <strong>EDU360</strong>, a production virtual academy platform using Next.js 16, TypeScript, Python (FastAPI), and PostgreSQL with automated MediaPipe AI exam proctoring. Experienced in end-to-end API testing via Postman, relational schema design, AWS cloud deployments, and solving 120+ Data Structures and Algorithms problems on LeetCode.
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
      <td style="width: 72%; text-align: left; vertical-align: top;"><span class="entry-title">Software Engineer Intern</span> <span class="entry-company">— Diradz Solutions</span> (Hybrid)</td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Apr 2026 – Present</td>
    </tr>
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;" class="sub-tagline">Flagship Product: <strong>EDU360</strong> — Online Academy Active Intelligence & AI Proctoring Platform</td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-location">Bangalore / Guntur, India</td>
    </tr>
  </table>
  <ul class="bullets">
    <li><strong>Full-Stack Architecture & Delivery:</strong> Architected and deployed <strong>EDU360</strong> using Next.js 16 (App Router), TypeScript, Python 3.11+ (FastAPI), and PostgreSQL/SQLite, building <strong>203 RESTful API endpoints</strong> across 8 canonical institutional portals (Admin, Academic, Exam, Accounts, Admissions, Teacher, Student, Parent).</li>
    <li><strong>Real-Time Video & WebRTC Infrastructure:</strong> Integrated LiveKit media engine and WebRTC transport protocols, achieving sub-200ms latency video classrooms with automated 10-minute webhook attendance captures.</li>
    <li><strong>AI Exam Proctoring Engine:</strong> Engineered an in-browser exam proctoring system with Google MediaPipe ML algorithms, processing client video streams in real time to detect face presence, head pose angles, gaze deviation, and multi-face intrusions.</li>
    <li><strong>Database Design & ORM Modeling:</strong> Designed normalized relational database schemas using SQLAlchemy 2.0 ORM and Pydantic v2 validation, implementing async query execution, indexing, and ACID transaction boundaries.</li>
    <li><strong>API & Manual Testing Suites:</strong> Authored test matrices and executed manual and API test suites using Postman collections and custom Python test scripts, validating payload schemas, HTTP status codes, and error handling across 203 endpoints.</li>
    <li><strong>Academic Governance Engine:</strong> Programmed triage engines evaluating student grade drops, consecutive absences, and fee arrears; built an in-browser canvas SpeedGrader tool for inline assignment grading.</li>
    <li><strong>Cloud & Infrastructure:</strong> Configured AWS cloud infrastructure (EC2, S3, IAM) for file storage and compute; integrated Antigravity AI workflows for automated pipeline validation.</li>
  </ul>

  <!-- PAGE BREAK TO PAGE 2 -->
  <div class="page-break"></div>

  <!-- ==================== PAGE 2 ==================== -->

  <!-- CONTINUED WORK EXPERIENCE -->
  <div class="section-title">Professional Experience (Continued)</div>

  <!-- Lurnexa Publications -->
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;"><span class="entry-title">Data Analyst Intern</span> <span class="entry-company">— Lurnexa Publications</span></td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Nov 2025 – Mar 2026</td>
    </tr>
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;" class="sub-tagline">Data Ingestion Pipelines, Funnel Analytics & Reporting Automation</td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-location">Hyderabad, India</td>
    </tr>
  </table>
  <ul class="bullets">
    <li><strong>Data Pipelines & Hygiene:</strong> Ingested, cleaned, and normalized 50,000+ customer and book inquiry records using Python (Pandas) and SQL, eliminating data processing anomalies and establishing structured staging tables.</li>
    <li><strong>Funnel Optimization:</strong> Performed exploratory data analysis (EDA) using Python to analyze buyer trends and customer conversion funnels, identifying drop-off stages in textbook orders.</li>
    <li><strong>Acquisition Tracking:</strong> Configured Google Analytics 4 (GA4) custom event tracking across web properties to monitor user journey flows and optimize conversion pathways.</li>
    <li><strong>Reporting Automation:</strong> Built automated Power BI and Excel dashboards tracking marketing and sales KPIs, reducing recurring reporting time by 40%.</li>
  </ul>

  <!-- KEY TECHNICAL PROJECTS -->
  <div class="section-title">Key Technical Projects</div>

  <!-- News Sentiment Analyzer -->
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;"><span class="entry-title">News Sentiment Analyzer & Regional Voice Engine</span></td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">May 2025</td>
    </tr>
    <tr>
      <td style="width: 100%; text-align: left; vertical-align: top;" class="sub-tagline" colspan="2">Tech Stack: Python, FastAPI, Hugging Face Transformers, Streamlit, RESTful APIs</td>
    </tr>
  </table>
  <ul class="bullets">
    <li>Engineered an asynchronous NLP pipeline using Hugging Face transformer models to classify sentiment across corporate news articles into positive, negative, and neutral categories with 90%+ accuracy.</li>
    <li>Designed modular REST API endpoints in FastAPI for batch article processing, sentiment scoring, and keyword trend extraction.</li>
    <li>Developed an interactive Streamlit web dashboard and integrated Telugu text-to-speech (TTS) voice synthesis to convert summaries into regional audio.</li>
  </ul>

  <!-- ASCEND Platform -->
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;"><span class="entry-title">ASCEND — AI-Driven Career Exploration Platform</span></td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Nov 2024 – Feb 2025</td>
    </tr>
    <tr>
      <td style="width: 100%; text-align: left; vertical-align: top;" class="sub-tagline" colspan="2">Tech Stack: Python, Flask, Scikit-learn, Word2Vec, SQLite, REST APIs</td>
    </tr>
  </table>
  <ul class="bullets">
    <li>Developed an AI career recommendation service matching student profiles against 1,000+ job descriptions using Word2Vec embeddings and cosine similarity scoring.</li>
    <li>Structured relational SQLite database schemas to index job role competencies, skill tags, and career trajectories, achieving sub-100ms recommendation query latency.</li>
    <li>Built responsive Flask backend services providing structured recommendation payloads to the client interface.</li>
  </ul>

  <!-- Retail Sales Insights -->
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;"><span class="entry-title">Retail Sales Insights & Performance Analytics Engine</span></td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Feb 2026</td>
    </tr>
    <tr>
      <td style="width: 100%; text-align: left; vertical-align: top;" class="sub-tagline" colspan="2">Tech Stack: SQL, Power BI, Python (Pandas), Excel, Data Modeling</td>
    </tr>
  </table>
  <ul class="bullets">
    <li>Analyzed 50,000+ retail sales transactions using advanced SQL queries (CTEs, window functions) to evaluate regional revenue trends.</li>
    <li>Engineered star-schema data models and interactive Power BI executive dashboards displaying monthly sales KPIs, margin trends, and category performance.</li>
    <li>Automated data cleaning and transformation workflows, identifying high-margin product categories to optimize inventory distribution.</li>
  </ul>

  <!-- EDUCATION -->
  <div class="section-title">Education</div>
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;"><span class="entry-title">Vasireddy Venkatadri Institute of Technology (VVIT)</span></td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-location">Guntur, Andhra Pradesh, India</td>
    </tr>
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;" style="font-size: 8.8pt; color: #1e293b;">Bachelor of Technology (B.Tech) in Artificial Intelligence & Machine Learning &nbsp;|&nbsp; <strong>GPA: 7.4 / 10.0</strong></td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Nov 2021 – Jun 2025</td>
    </tr>
  </table>
  <div style="font-size: 8.5pt; color: #475569; margin-top: 1.5pt;">
    <strong>Relevant Coursework:</strong> Data Structures & Algorithms, Object-Oriented Programming (Java/Python), Database Management Systems (DBMS), Operating Systems, Computer Networks, Software Engineering Principles.
  </div>

  <!-- CERTIFICATIONS & PROBLEM SOLVING -->
  <div class="section-title">Certifications & Problem Solving</div>
  <div class="cert-list">
    • <strong>Problem Solving:</strong> Solved <strong>120+ Data Structures and Algorithms (DSA) and SQL</strong> challenges on LeetCode.<br>
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
    story2 = fitz.Story(html=html_2page)
    def rectfn(rect_num, filled):
        return mediabox, rect, None

    output_pdf_2p = os.path.join(base_dir, "Bhargava_Durga_Prasad_Gajula_SDE_Resume_2Page.pdf")
    writer = fitz.DocumentWriter(output_pdf_2p)
    story2.write(writer, rectfn)
    writer.close()

    doc2 = fitz.open(output_pdf_2p)
    doc2.save(os.path.join(artifact_dir, "Bhargava_Durga_Prasad_Gajula_SDE_Resume_2Page.pdf"))
    p_count2 = len(doc2)
    doc2.close()
    print(f"2-Page PDF generated: {p_count2} page(s)")

if __name__ == "__main__":
    generate_both()
