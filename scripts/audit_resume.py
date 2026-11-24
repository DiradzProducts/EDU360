import re
from bs4 import BeautifulSoup

def audit():
    with open(r"e:\Diradz\EDU360\scripts\generate_both_resumes.py", "r", encoding="utf-8") as f:
        text = f.read()

    start = text.find('html_1page = """') + len('html_1page = """')
    end = text.find('"""', start)
    html = text[start:end]

    soup = BeautifulSoup(html, "html.parser")
    bullets = soup.find_all("li")

    print(f"Total bullets: {len(bullets)}\n")
    leading_verbs = []
    for i, b in enumerate(bullets, 1):
        txt = b.get_text().strip()
        # Remove bold prefix if any e.g. "Full-Stack Architecture & Delivery: "
        if ":" in txt and len(txt.split(":")[0].split()) <= 6:
            body = txt.split(":", 1)[1].strip()
        else:
            body = txt
        words = body.split()
        first_word = words[0] if words else ""
        leading_verbs.append(first_word)
        has_metric = bool(re.search(r'\b(?:\d+[%+kKmsMS]*|\bzero\b)\b', body, re.IGNORECASE))
        print(f"[{i}] Words: {len(words)} | Metric: {has_metric} | Verb: '{first_word}'")
        print(f"    Body: {body[:100]}...\n")

    print("Verb frequency:", {v: leading_verbs.count(v) for v in set(leading_verbs)})

if __name__ == "__main__":
    audit()
