"""
CV parser with two strategies:
  1. Claude API (accurate, needs ANTHROPIC_API_KEY env var)
  2. Regex fallback (free, offline, works best on well-structured CVs)

Both return the same dict shape so the frontend doesn't care which ran.
"""
import os
import re
import json
import pdfplumber


def extract_text(pdf_path: str) -> str:
    """Pull raw text from PDF. Returns empty string if extraction fails."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception as e:
        print(f"[cv_parser] PDF read failed: {e}")
        return ""


# ---------- Strategy 1: Claude ----------

PROMPT = """You are extracting structured data from an academic CV. Return ONLY valid JSON, no prose.

Schema:
{
  "name": "string or null",
  "title": "current job title — null if unclear",
  "department": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "office": "string or null",
  "tagline": "one-sentence research focus, under 200 chars",
  "bio": "2-3 sentence biography covering education and current role only — no awards, no list of memberships, no project lists",
  "research_areas": ["topic tags, max 5"],
  "personal_website_url": "string or null",
  "google_scholar_url": "string or null",
  "professional_profile": "MARKDOWN string. Include sections only if the CV has the content. Use ## for section headings. Use - for bullet items. See FORMAT below.",
  "publications": [
    {"title": "string", "year": number or null, "venue": "string or null",
     "authors": "string or null", "url": "string or null",
     "category": "Journal|Conference|Book|Other"}
  ],
  "courses": [
    {"code": "string or null", "name": "string", "semester": "string or null",
     "is_current": boolean}
  ],
  "awards": [
    {"title": "string", "year": number or null, "awarding_body": "string or null",
     "description": "string explaining what the award was for, or null",
     "primary_url": "string or null — the official award page if mentioned",
     "media_links": [
       {"label": "short description like 'IND Today coverage'", "url": "string"}
     ]}
  ]
}

FORMAT for professional_profile (markdown):

## Professional Society Memberships
- IEEE Senior Member
- IAPR member through Indian Unit of IAPR
- Fellow of IETE

## Volunteer & Leadership Roles
- Chairman, IEEE Hyderabad Section (2012-13, 2022-23)
- Vice Chair Educational Activities, IEEE India Council (2017-18)
- Vice Chair Technical Activities, IEEE India Council (2021-22)

## Editorial Roles
- Associate Editor, Springer-Nature Computer Science
- Program Chair / General Chair for various IEEE and Springer conferences

## Funded Research Projects
- Principal Investigator, Robust OCR Project (DIT)
- Co-investigator, Indian Language Resource Center (Telugu) — DIT
- Co-investigator, projects from ISRO and MHA
- Currently associated with 100 5G Labs project (DoT, Govt. of India)

## Research Mentorship
- 12 doctoral dissertations guided, several others mentored
- ~100 M.Tech dissertations supervised

## Research Impact
- 150+ peer-reviewed publications, 2000+ citations
- Notable contributions to Telugu OCR and Handwriting Recognition

Rules:
- Do not invent data. If a section has no content in the CV, omit the section entirely from the markdown.
- Keep bio short (2-3 sentences max) — education + current role. Move everything else to professional_profile.
- For awards: extract every award mentioned. If the CV has URLs about an award (e.g., news articles, newsletter mentions), capture them as media_links.
- For media_links labels, use short descriptive phrases inferred from the URL or surrounding text — e.g., "IND Today article", "IEEE R10 Personality of the Month".
- Extract at most 5 publications (the CV may have many; pick the most representative).
- Categories for publications: Journal, Conference, Book, Workshop, Preprint, Other.

CV TEXT:
---
{cv_text}
---
"""

# ----strategy 1: Gemini ----------
def parse_with_gemini(cv_text: str) -> dict | None:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None

    import time
    last_error = None
    for attempt in range(3):
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=PROMPT.replace("{cv_text}", cv_text[:15000]),
                config={
                    "response_mime_type": "application/json",
                    "temperature": 0.1,
                },
            )
            return json.loads(response.text)
        except Exception as e:
            last_error = e
            err_str = str(e)
            # Retry on transient errors only
            if '503' in err_str or 'UNAVAILABLE' in err_str or '429' in err_str:
                wait = 2 ** attempt  # 1s, 2s, 4s
                print(f"[cv_parser] Gemini transient error (attempt {attempt+1}/3), retrying in {wait}s...")
                time.sleep(wait)
                continue
            # Non-transient error, fail immediately
            print(f"[cv_parser] Gemini parse failed: {e}")
            return None

    print(f"[cv_parser] Gemini failed after 3 attempts: {last_error}")
    return None


# ---------- Strategy 2: Regex fallback ----------

def parse_with_regex(cv_text: str) -> dict:
    """Best-effort regex extraction. Everything it can't find is null/empty."""
    out = {
        "name": None, "title": None, "department": None,
        "email": None, "phone": None, "office": None,
        "tagline": None, "bio": None,
        "research_areas": [], "personal_website_url": None,
        "publications": [], "courses": [],
    }
    if not cv_text:
        return out

    # Email
    m = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", cv_text)
    if m: out["email"] = m.group(0)

    # Phone (rough — Indian/international formats)
    m = re.search(r"(\+?\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}", cv_text)
    if m: out["phone"] = m.group(0).strip()

    # Website
    m = re.search(r"https?://[^\s]+", cv_text)
    if m and "mailto:" not in m.group(0):
        out["personal_website_url"] = m.group(0).rstrip(".,;)")

    # Name — usually first non-empty line
    for line in cv_text.splitlines():
        line = line.strip()
        if line and len(line) < 80 and not any(c.isdigit() for c in line):
            out["name"] = line
            break

    # Title — look for common academic titles near the top
    title_match = re.search(
        r"\b(Professor|Associate Professor|Assistant Professor|Lecturer|Senior Lecturer|Research Scientist|Postdoctoral (?:Fellow|Researcher))\b",
        cv_text[:1500], re.IGNORECASE)
    if title_match: out["title"] = title_match.group(0).title()

    # Research areas — look for a "Research Interests" or "Areas" section
    m = re.search(r"(?:Research Interests|Research Areas|Areas of Interest)[:\s]*\n?(.+?)(?:\n\n|\nEducation|\nExperience|$)",
                  cv_text, re.IGNORECASE | re.DOTALL)
    if m:
        raw = m.group(1).replace("\n", " ")
        areas = [a.strip() for a in re.split(r"[,;•·]", raw) if 3 < len(a.strip()) < 50]
        out["research_areas"] = areas[:5]

    # Publications — lines that contain a 4-digit year and look like citations
    pub_section = re.search(r"(?:Publications|Selected Publications|Journal Articles)[:\s]*\n(.+?)(?:\n[A-Z][a-z]+\s*\n|\Z)",
                            cv_text, re.IGNORECASE | re.DOTALL)
    search_text = pub_section.group(1) if pub_section else cv_text
    for line in search_text.splitlines():
        line = line.strip()
        y = re.search(r"\b(19|20)\d{2}\b", line)
        if y and len(line) > 40 and len(line) < 400:
            out["publications"].append({
                "title": line[:200],
                "venue": None, "authors": None,
                "year": int(y.group(0)),
                "category": "Journal",
            })
        if len(out["publications"]) >= 10:
            break

    # Courses — lines that look like "CS 601: Something" or "ENG-412 Course Name"
    for line in cv_text.splitlines():
        cm = re.match(r"([A-Z]{2,4}[\s-]?\d{3,4})[:\s-]+(.{5,120})", line.strip())
        if cm:
            out["courses"].append({
                "code": cm.group(1).strip(),
                "name": cm.group(2).strip(),
                "semester": None,
            })
        if len(out["courses"]) >= 8:
            break

    return out


# ---------- Public entry point ----------

def parse_cv(pdf_path: str) -> dict:
    """Try Gemini first; fall back to regex. Returns dict + which strategy ran."""
    text = extract_text(pdf_path)
    if not text:
        return {"_strategy": "failed", "_error": "Could not extract text from PDF"}

    parsed = parse_with_gemini(text)
    if parsed is not None:
        parsed["_strategy"] = "gemini"
        return parsed

    parsed = parse_with_regex(text)
    parsed["_strategy"] = "regex"
    return parsed