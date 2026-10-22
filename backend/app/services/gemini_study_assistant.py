import os
import json
import re
import logging
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings, get_current_gemini_key, get_current_gemini_model

logger = logging.getLogger("edu360.ai_study_assistant")


def get_fallback_guidance(
    subject: str,
    misconception: str,
    score: str,
    active_day: str,
    has_backlog: bool,
    backlog_count: int,
    backlog_summary: str = ""
) -> Dict[str, Any]:
    """
    Verified, pedagogically calibrated fallback responses for when GEMINI_API_KEY
    is not set or the remote AI API call is unavailable.
    Guarantees the Parent Portal UI always renders instantly and reliably.
    """
    subj_lower = (subject or "").lower()
    
    # Backlog note to gently integrate if child is behind on homework
    backlog_note = ""
    if has_backlog and backlog_count > 0:
        backlog_note = f" (Also: {backlog_count} pending homework task noted—completing this 10-minute review covers it!)"

    if "math" in subj_lower:
        return {
            "plain_english_translation": (
                f"In {subject}, your child understands the core formulas and steps, but tends to drop or mix up minus signs "
                f"when expanding brackets across multiple terms. Think of it like baking a great cake but forgetting "
                f"the pinch of salt at the end—a small oversight that is very easy to fix once noticed!"
            ),
            "tonight_action": (
                f"Open their rough notebook to tonight's {active_day} practice. Ask them to solve '-(3x - 5)' out loud and explain "
                f"what happens to the minus sign. Check that they write '-3x + 5' instead of '-3x - 5'.{backlog_note}"
            ),
            "child_motivation_tip": (
                "You've already mastered the hard algebraic steps—now we're just training our eyes like a detective "
                "for those sneaky minus signs. You're doing great, let's nail this together!"
            ),
            "suggested_teacher_question": (
                f"Dear Teacher, we reviewed Aarav's bracket sign distribution in his rough notebook tonight. "
                f"Could you please glance at his {active_day} solution tomorrow to verify if his sign handling is improving?"
            ),
            "has_backlog": has_backlog,
            "backlog_count": backlog_count,
            "source": "fallback",
            "model_used": settings.GEMINI_MODEL
        }
    elif "physic" in subj_lower:
        return {
            "plain_english_translation": (
                f"In {subject}, your child grasps how pushes and pulls work, but gets confused about action-reaction force pairs. "
                f"They sometimes think the forces cancel each other out on the same object, rather than acting on two different bodies."
            ),
            "tonight_action": (
                f"Have your child gently press their palms against a wall. Ask: 'Is the wall pushing back on your hands, "
                f"and why don't you crash through it?' Check if they can explain equal and opposite forces on different objects.{backlog_note}"
            ),
            "child_motivation_tip": (
                "Physics is all about how the universe actually moves. You ask brilliant questions, and connecting "
                "the real world to the formulas is your superpower!"
            ),
            "suggested_teacher_question": (
                f"Dear Teacher, we walked through Newton's 3rd law examples together at home. "
                f"Could you check Aarav's free-body diagram on his {active_day} sheet tomorrow?"
            ),
            "has_backlog": has_backlog,
            "backlog_count": backlog_count,
            "source": "fallback",
            "model_used": settings.GEMINI_MODEL
        }
    elif "chem" in subj_lower:
        return {
            "plain_english_translation": (
                f"In {subject}, your child understands chemical formulas, but loses track of atom counts "
                f"when parentheses are involved in polyatomic groups (like sulfate or nitrate)."
            ),
            "tonight_action": (
                f"Pick one chemical formula from tonight's {active_day} notebook (e.g., Al₂(SO₄)₃) and count the oxygen atoms together. "
                f"Remind them to multiply the outside subscript 3 by the inside 4 (3 × 4 = 12).{backlog_note}"
            ),
            "child_motivation_tip": (
                "Balancing chemical equations is just a fun puzzle. Once you crack the parentheses rule, "
                "you'll solve them faster than anyone in class!"
            ),
            "suggested_teacher_question": (
                f"Dear Teacher, Aarav practiced counting polyatomic atoms tonight. "
                f"Could you check his equation balancing during tomorrow's practical session?"
            ),
            "has_backlog": has_backlog,
            "backlog_count": backlog_count,
            "source": "fallback",
            "model_used": settings.GEMINI_MODEL
        }
    else:
        clean_misc = misconception or "key foundational concepts"
        return {
            "plain_english_translation": (
                f"In {subject}, your child understands the big picture, but is currently getting tripped up by: "
                f"'{clean_misc}'. Breaking this down into 1-2 small daily habits will quickly restore their confidence."
            ),
            "tonight_action": (
                f"Review their {active_day} notebook for 10 minutes. Ask them to explain the main concept in their own words, "
                f"and check that their rough work steps are clearly written out.{backlog_note}"
            ),
            "child_motivation_tip": (
                f"Every expert was once a beginner who didn't give up. You are making steady progress in {subject}, "
                f"and I'm proud of your effort every day!"
            ),
            "suggested_teacher_question": (
                f"Dear Teacher, we spent 10 minutes reviewing {subject} at home tonight. "
                f"Is there a specific practice question from {active_day} you would recommend focusing on next?"
            ),
            "has_backlog": has_backlog,
            "backlog_count": backlog_count,
            "source": "fallback",
            "model_used": settings.GEMINI_MODEL
        }

async def consult_gemini_study_assistant(
    student_id: int,
    subject: str,
    exam_score: str,
    misconception: str,
    active_day: str,
    has_backlog: bool = False,
    backlog_count: int = 0,
    backlog_summary: str = ""
) -> Dict[str, Any]:
    """
    Asynchronously queries Google Gemini API to translate academic diagnostic data
    into simple, actionable home guidance for parents.
    Falls back gracefully if key is missing or API errors occur.
    """
    api_key = get_current_gemini_key()
    model = get_current_gemini_model()


    # If no API key configured, return verified fallback immediately
    if not api_key:
        logger.info("GEMINI_API_KEY not configured. Returning verified pedagogical fallback.")
        return get_fallback_guidance(
            subject=subject,
            misconception=misconception,
            score=exam_score,
            active_day=active_day,
            has_backlog=has_backlog,
            backlog_count=backlog_count,
            backlog_summary=backlog_summary
        )

    # Construct prompt
    backlog_desc = (
        f"Student has {backlog_count} pending homework backlog ({backlog_summary}). Mention how finishing tonight's 10-minute check directly resolves this backlog."
        if has_backlog and backlog_count > 0
        else "No pending backlogs; student homework is up to date."
    )

    prompt = f"""You are an empathetic expert pedagogical counselor in the EDU360 K-12 platform.
A parent is looking at their child's Focus Table. Non-technical parents get intimidated and confused by teacher diagnostic jargon like "Drops negative signs during LCM expansion across multiple terms."

Your job: Translate this diagnostic data into warm, encouraging, 10-minute home study guidance that any non-technical parent can understand and execute tonight.

Child Diagnostic Information:
- Subject: {subject}
- Current Exam Score: {exam_score}
- Active Sprint Day: {active_day}
- Teacher Diagnosed Misconception: {misconception}
- Homework Backlog Status: {backlog_desc}

You must respond with a STRICT JSON OBJECT containing EXACTLY these 4 keys:
1. "plain_english_translation": A warm, non-judgmental 2-3 sentence explanation of what the child is struggling with, using everyday analogies (no pedagogical jargon).
2. "tonight_action": 1 or 2 specific, 10-minute checks or quick questions the parent should review in the child's rough notebook tonight.
3. "child_motivation_tip": A positive, confidence-boosting sentence the parent can say to motivate the child without exam pressure.
4. "suggested_teacher_question": A polite, pre-written note or question the parent can copy and send to the subject teacher on WhatsApp or during PTM.

JSON Schema:
{{
  "plain_english_translation": "...",
  "tonight_action": "...",
  "child_motivation_tip": "...",
  "suggested_teacher_question": "..."
}}
"""

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "response_mime_type": "application/json"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.post(
                gemini_url,
                headers={"Content-Type": "application/json"},
                json=payload
            )
            
            if resp.status_code != 200:
                logger.warning(f"Gemini API returned status {resp.status_code}: {resp.text[:200]}")
                return get_fallback_guidance(
                    subject=subject,
                    misconception=misconception,
                    score=exam_score,
                    active_day=active_day,
                    has_backlog=has_backlog,
                    backlog_count=backlog_count,
                    backlog_summary=backlog_summary
                )

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                logger.warning("Gemini API returned no candidates.")
                return get_fallback_guidance(
                    subject=subject,
                    misconception=misconception,
                    score=exam_score,
                    active_day=active_day,
                    has_backlog=has_backlog,
                    backlog_count=backlog_count,
                    backlog_summary=backlog_summary
                )

            raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            
            # Clean possible markdown block wrappers
            cleaned_text = re.sub(r"^```(?:json)?\s*", "", raw_text.strip(), flags=re.MULTILINE)
            cleaned_text = re.sub(r"\s*```$", "", cleaned_text.strip(), flags=re.MULTILINE)

            parsed = json.loads(cleaned_text)

            # Validate all 4 keys exist and are non-empty
            required_keys = [
                "plain_english_translation",
                "tonight_action",
                "child_motivation_tip",
                "suggested_teacher_question"
            ]
            if not all(isinstance(parsed.get(k), str) and parsed.get(k).strip() for k in required_keys):
                logger.warning("Gemini JSON was missing one or more required keys.")
                return get_fallback_guidance(
                    subject=subject,
                    misconception=misconception,
                    score=exam_score,
                    active_day=active_day,
                    has_backlog=has_backlog,
                    backlog_count=backlog_count,
                    backlog_summary=backlog_summary
                )

            return {
                "plain_english_translation": parsed["plain_english_translation"],
                "tonight_action": parsed["tonight_action"],
                "child_motivation_tip": parsed["child_motivation_tip"],
                "suggested_teacher_question": parsed["suggested_teacher_question"],
                "has_backlog": has_backlog,
                "backlog_count": backlog_count,
                "source": "gemini",
                "model_used": model
            }

    except Exception as e:
        logger.error(f"Error querying Gemini API: {e}. Gracefully reverting to verified fallback.")
        return get_fallback_guidance(
            subject=subject,
            misconception=misconception,
            score=exam_score,
            active_day=active_day,
            has_backlog=has_backlog,
            backlog_count=backlog_count,
            backlog_summary=backlog_summary
        )
