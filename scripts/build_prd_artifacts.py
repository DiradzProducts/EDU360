import os
import re
import markdown
import fitz

def generate_artifacts():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prd_dir = os.path.join(base_dir, "docs", "prd")
    md_path = os.path.join(prd_dir, "EDU360_MASTER_PRD_SPECIFICATION.md")
    html_path = os.path.join(prd_dir, "EDU360_MASTER_PRD_SPECIFICATION.html")
    pdf_path = os.path.join(prd_dir, "EDU360_MASTER_PRD_SPECIFICATION.pdf")

    print(f"Reading markdown from: {md_path}")
    with open(md_path, "r", encoding="utf-8") as f:
        md_content = f.read()

    # 1. Generate Browser HTML with Mermaid.js & Print Stylesheet
    html_body = markdown.markdown(md_content, extensions=["tables", "fenced_code", "nl2br"])
    html_body_browser = re.sub(
        r'<pre><code class="language-mermaid">(.*?)</code></pre>',
        r'<div class="mermaid">\1</div>',
        html_body,
        flags=re.DOTALL
    )

    browser_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>EDU360 — Master PRD & System Specification (v6.0)</title>
<style>
  :root {{
    --primary: #0284c7;
    --primary-dark: #0369a1;
    --text-main: #0f172a;
    --text-muted: #475569;
    --bg-page: #f8fafc;
    --card-bg: #ffffff;
    --border: #e2e8f0;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: var(--text-main);
    background-color: var(--bg-page);
    line-height: 1.6;
    margin: 0;
    padding: 0;
  }}
  .top-bar {{
    position: sticky;
    top: 0;
    z-index: 100;
    background: #0f172a;
    color: #ffffff;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  }}
  .top-bar .title {{
    font-weight: 700;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  .top-bar .meta {{
    font-size: 12px;
    color: #94a3b8;
  }}
  .btn-print {{
    background: #0284c7;
    color: #ffffff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.2s;
  }}
  .btn-print:hover {{ background: #0369a1; }}
  .container {{
    max-width: 980px;
    margin: 32px auto;
    background: var(--card-bg);
    padding: 48px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    border: 1px solid var(--border);
  }}
  h1 {{
    color: #0369a1;
    font-size: 26px;
    border-bottom: 3px solid #0284c7;
    padding-bottom: 8px;
    margin-top: 0;
  }}
  h2 {{
    color: #0f172a;
    font-size: 19px;
    margin-top: 36px;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 6px;
  }}
  h3 {{
    color: #1e293b;
    font-size: 16px;
    margin-top: 24px;
  }}
  h4 {{
    color: #334155;
    font-size: 14px;
    margin-top: 16px;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 13px;
  }}
  th, td {{
    border: 1px solid #cbd5e1;
    padding: 8px 12px;
    text-align: left;
  }}
  th {{
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 600;
  }}
  tr:nth-child(even) td {{
    background-color: #f8fafc;
  }}
  pre {{
    background-color: #0f172a;
    color: #f8fafc;
    padding: 14px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12px;
  }}
  code {{
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 12px;
    background-color: #f1f5f9;
    padding: 2px 5px;
    border-radius: 4px;
    color: #0284c7;
  }}
  pre code {{
    background: transparent;
    color: inherit;
    padding: 0;
  }}
  blockquote {{
    border-left: 4px solid #0284c7;
    background-color: #f0f9ff;
    padding: 12px 16px;
    margin: 16px 0;
    color: #0369a1;
    font-weight: 500;
    border-radius: 0 6px 6px 0;
  }}
  .mermaid {{
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 16px;
    border-radius: 8px;
    margin: 18px 0;
    display: flex;
    justify-content: center;
  }}
  @media print {{
    .top-bar {{ display: none; }}
    .container {{
      max-width: 100%;
      margin: 0;
      padding: 0;
      box-shadow: none;
      border: none;
    }}
    body {{ background: #ffffff; }}
    h2 {{ page-break-before: auto; }}
    pre, table {{ page-break-inside: avoid; }}
  }}
</style>
<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({{ startOnLoad: true, theme: 'neutral' }});
</script>
</head>
<body>
<div class="top-bar">
  <div class="title">
    <span>🎓</span>
    <span>EDU360 Online Academy — Master PRD Specification (v6.0)</span>
  </div>
  <div class="meta">Pure Online Schooling &bull; 8 Canonical Roles &bull; 13 AI Systems</div>
  <button class="btn-print" onclick="window.print()">🖨️ Print / Save to PDF</button>
</div>
<div class="container">
{html_body_browser}
</div>
</body>
</html>"""

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(browser_html)
    print(f"Generated HTML successfully: {html_path}")

    # 2. Generate PDF using PyMuPDF Story
    # For PDF Story rendering, clean up mermaid code blocks to styled structural pre blocks
    def clean_mermaid_for_pdf(match):
        code = match.group(1).strip()
        return f'<div class="workflow-box"><div class="wf-title">Workflow Logic Flowchart</div><pre>{code}</pre></div>'

    html_body_pdf = re.sub(
        r'<pre><code class="language-mermaid">(.*?)</code></pre>',
        clean_mermaid_for_pdf,
        html_body,
        flags=re.DOTALL
    )

    pdf_html = f"""<!DOCTYPE html>
<html>
<head>
<style>
  body {{
    font-family: sans-serif;
    font-size: 8.5pt;
    color: #1e293b;
    line-height: 1.45;
  }}
  h1 {{
    color: #0369a1;
    font-size: 16pt;
    font-weight: bold;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 4px;
    margin-top: 0;
    margin-bottom: 8px;
  }}
  h2 {{
    color: #0f172a;
    font-size: 12pt;
    font-weight: bold;
    margin-top: 18px;
    margin-bottom: 6px;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 3px;
  }}
  h3 {{
    color: #0284c7;
    font-size: 10pt;
    font-weight: bold;
    margin-top: 12px;
    margin-bottom: 4px;
  }}
  h4 {{
    color: #334155;
    font-size: 9pt;
    font-weight: bold;
    margin-top: 10px;
    margin-bottom: 3px;
  }}
  p {{
    margin: 4px 0 6px 0;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 12px 0;
    font-size: 7.5pt;
  }}
  th, td {{
    border: 0.5px solid #cbd5e1;
    padding: 4px 6px;
    text-align: left;
    vertical-align: top;
  }}
  th {{
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: bold;
  }}
  tr:nth-child(even) td {{
    background-color: #f8fafc;
  }}
  pre {{
    background-color: #f8fafc;
    border: 0.5px solid #cbd5e1;
    padding: 6px;
    font-family: monospace;
    font-size: 7pt;
    line-height: 1.3;
    margin: 6px 0;
  }}
  code {{
    font-family: monospace;
    font-size: 7.5pt;
    background-color: #f1f5f9;
    padding: 1px 3px;
    color: #0284c7;
  }}
  pre code {{
    background: transparent;
    color: #0f172a;
    padding: 0;
  }}
  blockquote {{
    border-left: 3px solid #0284c7;
    background-color: #f0f9ff;
    padding: 6px 10px;
    margin: 6px 0;
    color: #0369a1;
  }}
  .workflow-box {{
    background-color: #f8fafc;
    border: 0.5px solid #cbd5e1;
    padding: 8px;
    margin: 8px 0;
  }}
  .wf-title {{
    font-size: 8pt;
    font-weight: bold;
    color: #0284c7;
    margin-bottom: 4px;
  }}
</style>
</head>
<body>
{html_body_pdf}
</body>
</html>"""

    print("Building publication-grade PDF via PyMuPDF...")
    mediabox = fitz.paper_rect("a4")
    margin_x = 36
    margin_y = 36
    rect = fitz.Rect(margin_x, margin_y, mediabox.width - margin_x, mediabox.height - margin_y)

    story = fitz.Story(html=pdf_html)

    def rectfn(rect_num, filled):
        return mediabox, rect, None

    raw_temp_pdf = os.path.join(base_dir, "raw_temp_build.pdf")
    if os.path.exists(raw_temp_pdf):
        try: os.remove(raw_temp_pdf)
        except Exception: pass

    writer = fitz.DocumentWriter(raw_temp_pdf)
    story.write(writer, rectfn)
    writer.close()

    # Now add professional running headers and footers to the generated PDF
    doc = fitz.open(raw_temp_pdf)
    total_pages = len(doc)
    print(f"Base PDF written with {total_pages} pages. Adding running headers and footers...")

    for page_num in range(total_pages):
        page = doc[page_num]
        
        # Header (pages after page 1)
        if page_num > 0:
            header_text = "EDU360 Online Academy — Master PRD & System Specification (v6.0)"
            page.insert_text(
                fitz.Point(margin_x, 24),
                header_text,
                fontsize=7,
                fontname="helv",
                color=(0.4, 0.45, 0.5)
            )
            page.draw_line(
                fitz.Point(margin_x, 28),
                fitz.Point(mediabox.width - margin_x, 28),
                color=(0.8, 0.85, 0.9),
                width=0.5
            )

        # Footer on all pages
        footer_text = f"CONFIDENTIAL — FOR INTERNAL GOVERNANCE & AUDIT USE ONLY"
        page_str = f"Page {page_num + 1} of {total_pages}"
        
        page.draw_line(
            fitz.Point(margin_x, mediabox.height - 26),
            fitz.Point(mediabox.width - margin_x, mediabox.height - 26),
            color=(0.8, 0.85, 0.9),
            width=0.5
        )
        page.insert_text(
            fitz.Point(margin_x, mediabox.height - 16),
            footer_text,
            fontsize=6.5,
            fontname="helv",
            color=(0.5, 0.55, 0.6)
        )
        page.insert_text(
            fitz.Point(mediabox.width - margin_x - 55, mediabox.height - 16),
            page_str,
            fontsize=7,
            fontname="helv",
            color=(0.3, 0.35, 0.4)
        )

    # Save directly to final pdf_path
    if os.path.exists(pdf_path):
        try: os.remove(pdf_path)
        except Exception: pass

    doc.save(pdf_path)
    doc.close()

    if os.path.exists(raw_temp_pdf):
        try: os.remove(raw_temp_pdf)
        except Exception: pass

    pdf_size_kb = os.path.getsize(pdf_path) / 1024
    print(f"Final PDF successfully created at: {pdf_path}")
    print(f"Total Pages: {total_pages}, Size: {pdf_size_kb:.1f} KB")

if __name__ == "__main__":
    generate_artifacts()
