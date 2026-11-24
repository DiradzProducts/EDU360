import os
import fitz
import re

def build_perfect_resume():
    base_dir = r"e:\Diradz\EDU360"
    artifact_dir = r"C:\Users\Bhargav\.gemini\antigravity\brain\040c0e45-c080-4fc5-9468-d66a193f22f6"
    out_pdf = os.path.join(base_dir, "Bhargava_Durga_Prasad_Gajula_SDE_Resume.pdf")
    out_artifact = os.path.join(artifact_dir, "Bhargava_Durga_Prasad_Gajula_SDE_Resume.pdf")
    out_png = os.path.join(artifact_dir, "resume_preview_fixed_dates.png")

    # 100% Zero-Buzzwords, ASCII Hyphens, Explicit Consistent Date Ranges
    html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: a4;
    margin: 20pt 28pt;
  }
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #0f172a;
    font-size: 8.0pt;
    line-height: 1.23;
    margin: 0;
    padding: 0;
  }
  .header {
    text-align: center;
    margin-bottom: 2.5pt;
    border-bottom: 1.2pt solid #0f172a;
    padding-bottom: 2.5pt;
  }
  h1 {
    font-size: 15.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #0f172a;
    margin: 0 0 1.5pt 0;
  }
  .contact-bar {
    font-size: 7.8pt;
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
    margin: 0 3pt;
  }
  .section-title {
    font-size: 8.6pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #0f172a;
    border-bottom: 0.6pt solid #cbd5e1;
    padding-bottom: 1pt;
    margin-top: 3pt;
    margin-bottom: 1.5pt;
  }
  .summary-text {
    font-size: 7.8pt;
    color: #1e293b;
    margin: 0 0 2pt 0;
    text-align: justify;
    line-height: 1.22;
  }
  .skills-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5pt;
  }
  .skills-table td {
    padding: 0.6pt 0;
    font-size: 7.8pt;
    vertical-align: top;
  }
  .skill-category {
    font-weight: 700;
    color: #0f172a;
    width: 24%;
    padding-right: 6pt;
  }
  .skill-list {
    color: #334155;
    width: 76%;
  }
  .item-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1.5pt;
  }
  .entry-title {
    font-size: 8.3pt;
    font-weight: 700;
    color: #0f172a;
  }
  .entry-company {
    font-size: 8.1pt;
    font-weight: 600;
    color: #0369a1;
  }
  .entry-date {
    font-size: 7.6pt;
    color: #475569;
    font-weight: 600;
  }
  .entry-location {
    font-size: 7.5pt;
    color: #64748b;
    font-style: italic;
  }
  .sub-tagline {
    font-size: 7.5pt;
    font-style: italic;
    color: #475569;
    margin-top: 0.5pt;
    margin-bottom: 1pt;
  }
  ul.bullets {
    margin: 1pt 0 2pt 0;
    padding-left: 11pt;
  }
  ul.bullets li {
    font-size: 7.8pt;
    color: #1e293b;
    margin-bottom: 1.1pt;
    line-height: 1.21;
    text-align: justify;
  }
  ul.bullets li strong {
    color: #0f172a;
  }
  .cert-list {
    font-size: 7.7pt;
    color: #334155;
    margin: 1pt 0 0 0;
    line-height: 1.24;
  }
</style>
</head>
<body>

  <!-- HEADER -->
  <div class="header">
    <h1>Bhargava Durga Prasad Gajula</h1>
    <div class="contact-bar">
      Hyderabad, India <span class="separator">|</span> +91 9014966517 <span class="separator">|</span> <a href="mailto:bhargavagajula2003@gmail.com">bhargavagajula2003@gmail.com</a> <span class="separator">|</span> <a href="https://www.linkedin.com/in/bhargava-durga-prasad-gajula">linkedin.com/in/bhargava-gajula</a> <span class="separator">|</span> <a href="https://github.com/bhargavagajula">github.com/bhargavagajula</a>
    </div>
  </div>

  <!-- PROFESSIONAL SUMMARY (100% BUZZWORD FREE) -->
  <div class="section-title">Professional Summary</div>
  <div class="summary-text">
    <strong>Software Development Engineer (SDE)</strong> with production experience in full-stack web platforms, asynchronous backend APIs, and real-time WebRTC media streaming. Architected and deployed <strong>EDU360</strong>, a virtual academy platform using Next.js 16, TypeScript, Python (FastAPI), and PostgreSQL with automated MediaPipe AI exam proctoring. Proficient in Postman API testing suites, relational schema design, AWS cloud deployments, and solving 120+ LeetCode Data Structures and Algorithms problems.
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
      <td class="skill-list">FastAPI, Next.js 16 (App Router), React, RESTful APIs, Pydantic v2, SQLAlchemy 2.0 ORM, WebSockets, Uvicorn</td>
    </tr>
    <tr>
      <td class="skill-category">Real-Time & AI / ML:</td>
      <td class="skill-list">LiveKit, WebRTC Protocols, Google MediaPipe (Face Mesh & Gaze Tracking), Hugging Face Transformers, Scikit-learn</td>
    </tr>
    <tr>
      <td class="skill-category">Cloud, DevOps & Tools:</td>
      <td class="skill-list">Amazon Web Services (AWS - EC2, S3, IAM basics), Postman, Git, GitHub, Linux/Bash, Antigravity AI Orchestration</td>
    </tr>
    <tr>
      <td class="skill-category">Testing & QA:</td>
      <td class="skill-list">Manual Testing, API Testing (Postman/cURL), Regression Testing, System Integration Testing, Agile/Scrum</td>
    </tr>
  </table>

  <!-- PROFESSIONAL EXPERIENCE -->
  <div class="section-title">Professional Experience</div>

  <!-- Diradz Solutions -->
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;"><span class="entry-title">Software Engineer Intern</span> <span class="entry-company">— Diradz Solutions</span> (Hybrid)</td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Apr 2026 - Present</td>
    </tr>
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;" class="sub-tagline">Flagship Project: <strong>EDU360</strong> — Online Academy Management & AI Proctoring Platform</td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-location">Bangalore / Guntur, India</td>
    </tr>
  </table>
  <ul class="bullets">
    <li><strong>Full-Stack Architecture & Delivery:</strong> Architected and deployed <strong>EDU360</strong> using Next.js 16 (App Router), TypeScript, Python 3.11+ (FastAPI), and PostgreSQL, delivering <strong>203 RESTful API endpoints</strong> across 8 distinct institutional role portals.</li>
    <li><strong>Real-Time WebRTC Media Streaming:</strong> Integrated LiveKit media engine and WebRTC transport protocols, achieving sub-200ms latency video classrooms with automated 10-minute webhook attendance captures.</li>
    <li><strong>AI Exam Proctoring Engine:</strong> Engineered an in-browser exam proctoring system with Google MediaPipe ML algorithms, processing 30 FPS video streams in real time to detect gaze deviation, head pose deflection, and multi-face intrusions.</li>
    <li><strong>Database Design & ORM Modeling:</strong> Designed 20+ normalized relational tables using SQLAlchemy 2.0 ORM and Pydantic v2 validation, achieving sub-50ms async query execution and ACID transaction boundaries.</li>
    <li><strong>API & Manual Testing Suites:</strong> Authored test matrices and executed API test suites using Postman and Python scripts, achieving 100% endpoint test coverage across 203 endpoints and reducing regression defects by 35%.</li>
    <li><strong>Cloud & Infrastructure:</strong> Configured AWS cloud infrastructure (EC2, S3, IAM) for compute and storage, achieving 99.9% service availability during staging stress tests.</li>
  </ul>

  <!-- Lurnexa Publications -->
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;"><span class="entry-title">Data Analyst Intern</span> <span class="entry-company">— Lurnexa Publications</span></td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Nov 2025 - Mar 2026</td>
    </tr>
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;" class="sub-tagline">Data Ingestion Pipelines, Funnel Analytics & Reporting Automation</td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-location">Hyderabad, India</td>
    </tr>
  </table>
  <ul class="bullets">
    <li><strong>Data Pipeline Engineering:</strong> Ingested, cleaned, and normalized 50,000+ customer records using Python (Pandas) and SQL, achieving 99.5% data consistency across structured reporting tables.</li>
    <li><strong>Funnel Analysis & Conversion:</strong> Analyzed customer acquisition funnels using Python (EDA) across 50,000+ order records, identifying drop-off friction points to increase order conversion rates by 15%.</li>
    <li><strong>Analytics & Dashboard Automation:</strong> Implemented Google Analytics 4 (GA4) event tracking across 5+ web funnels and automated Power BI KPI dashboards, reducing recurring reporting time by 40%.</li>
  </ul>

  <!-- KEY TECHNICAL PROJECTS (CONSISTENT DATES) -->
  <div class="section-title">Key Technical Projects</div>

  <!-- News Sentiment Analyzer -->
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;">
        <span class="entry-title">News Sentiment Analyzer & Regional Voice Engine</span><br>
        <span class="sub-tagline">Python, FastAPI, Hugging Face Transformers, Streamlit, RESTful APIs</span>
      </td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Apr 2025 - May 2025</td>
    </tr>
  </table>
  <ul class="bullets">
    <li>Built an asynchronous NLP pipeline using Hugging Face transformer models to classify sentiment across financial news articles with 90%+ accuracy, processing 500+ articles per minute via FastAPI endpoints.</li>
    <li>Engineered an interactive Streamlit dashboard integrating Telugu text-to-speech (TTS) voice synthesis, converting 50+ news summaries daily into regional audio for local stakeholders.</li>
  </ul>

  <!-- ASCEND Platform -->
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;">
        <span class="entry-title">ASCEND — Career Exploration & Recommendation Platform</span><br>
        <span class="sub-tagline">Python, Flask, Scikit-learn, Word2Vec, SQLite, REST APIs</span>
      </td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Nov 2024 - Feb 2025</td>
    </tr>
  </table>
  <ul class="bullets">
    <li>Developed an AI career recommendation service matching student profiles against 1,000+ job descriptions using Word2Vec embeddings and cosine similarity scoring, achieving sub-100ms API query latency.</li>
    <li>Structured relational SQLite schemas indexing 50+ career pathways and built modular Flask REST endpoints to deliver low-latency recommendation payloads.</li>
  </ul>

  <!-- Retail Sales Insights -->
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;">
        <span class="entry-title">Retail Sales Insights & Performance Analytics Engine</span><br>
        <span class="sub-tagline">SQL, Power BI, Python (Pandas), Excel, Data Modeling</span>
      </td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Jan 2026 - Feb 2026</td>
    </tr>
  </table>
  <ul class="bullets">
    <li>Queried 50,000+ retail sales transactions using advanced SQL queries (CTEs, window functions) to evaluate regional margins and built Power BI dashboards identifying top product categories to increase profitability by 18%.</li>
  </ul>

  <!-- EDUCATION -->
  <div class="section-title">Education</div>
  <table class="item-table">
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;"><span class="entry-title">Vasireddy Venkatadri Institute of Technology (VVIT)</span></td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-location">Guntur, Andhra Pradesh, India</td>
    </tr>
    <tr>
      <td style="width: 72%; text-align: left; vertical-align: top;" style="font-size: 7.8pt; color: #1e293b;">B.Tech in Artificial Intelligence & Machine Learning &nbsp;|&nbsp; <strong>GPA: 7.4 / 10.0</strong></td>
      <td style="width: 28%; text-align: right; vertical-align: top;" class="entry-date">Nov 2021 - Jun 2025</td>
    </tr>
  </table>

  <!-- CERTIFICATIONS & PROBLEM SOLVING -->
  <div class="section-title">Certifications & Problem Solving</div>
  <div class="cert-list">
    • <strong>Problem Solving:</strong> Solved <strong>120+ Data Structures and Algorithms (DSA) and SQL</strong> challenges on LeetCode.<br>
    • <strong>Certifications:</strong> Machine Learning with Python (IBM) &nbsp;|&nbsp; Python for Data Science (NPTEL) &nbsp;|&nbsp; SQL, MongoDB & JavaScript (Udemy) &nbsp;|&nbsp; Generative AI Fundamentals (Google Cloud) &nbsp;|&nbsp; HTML & CSS (Infosys Springboard) &nbsp;|&nbsp; Power BI (Simplilearn).
  </div>

</body>
</html>
"""

    mediabox = fitz.paper_rect("a4")
    margin_x = 28
    margin_y = 20
    rect = fitz.Rect(margin_x, margin_y, mediabox.width - margin_x, mediabox.height - margin_y)

    story = fitz.Story(html=html)

    def rectfn(rect_num, filled):
        return mediabox, rect, None

    writer = fitz.DocumentWriter(out_pdf)
    story.write(writer, rectfn)
    writer.close()

    doc = fitz.open(out_pdf)
    pages = len(doc)
    doc.save(out_artifact)
    
    # Save preview image
    pix = doc[0].get_pixmap(dpi=150)
    pix.save(out_png)
    
    text = doc[0].get_text()
    doc.close()

    print(f"Build complete! Page count: {pages}")
    
    # Run buzzword scan on final text
    buzzwords = [
        'specializing in', 'scalable', 'driven', 'boost', 'lift', 'constructed', 
        'active', 'various', 'several', 'successfully', 'extensive', 'effective', 
        'seasoned', 'passionate', 'detail-oriented', 'track record', 'cutting-edge', 
        'state-of-the-art', 'world-class', 'go-to', 'expert', 'dynamic', 'synergy', 
        'innovative', 'thought leader', 'fast-paced', 'hard-working', 'team player',
        'self-starter', 'results-driven', 'motivated', 'strategic', 'streamlined',
        'robust', 'utilize', 'utilized', 'leveraged', 'experienced in'
    ]

    found = []
    for bw in buzzwords:
        matches = re.findall(rf'\b{re.escape(bw)}\b', text, re.IGNORECASE)
        if matches:
            found.append((bw, len(matches)))

    print("Remaining buzzwords found:", found)
    return pages

if __name__ == "__main__":
    build_perfect_resume()
