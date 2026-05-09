import os

from dotenv import load_dotenv
from openai import AsyncOpenAI, OpenAIError

from app.models import AnalysisResult
from app.prompts import ANALYSIS_SYSTEM_PROMPT, build_analysis_user_prompt


load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

if not OPENAI_API_KEY:
    raise RuntimeError(
        "Missing OPENAI_API_KEY. Add it to backend/.env or your deployment environment variables."
    )

client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def analyze_with_llm(title: str | None, text: str) -> dict:
    """
    Sends an article to the OpenAI API and returns a validated analysis dict.

    The response is parsed into the AnalysisResult Pydantic model, so the backend
    receives predictable structured data for the frontend dashboard.
    """

    cleaned_text = text.strip()

    if not cleaned_text:
        raise ValueError("Cannot analyze empty article text.")

    # Keep the request reasonably small for cost, latency, and context-size safety.
    trimmed_text = cleaned_text[:12000]

    try:
        completion = await client.beta.chat.completions.parse(
            model=OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": ANALYSIS_SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": build_analysis_user_prompt(title, trimmed_text),
                },
            ],
            response_format=AnalysisResult,
            temperature=0.2,
        )

        message = completion.choices[0].message

        if message.refusal:
            raise ValueError(f"OpenAI refused the request: {message.refusal}")

        if not message.parsed:
            raise ValueError("OpenAI returned an empty or unparseable response.")

        analysis: AnalysisResult = message.parsed

        # Keep the backend's scraped title as source of truth.
        analysis.title = title

        return analysis.model_dump()

    except OpenAIError as e:
        raise RuntimeError(f"OpenAI API error: {str(e)}") from e

    except Exception as e:
        raise RuntimeError(f"LLM analysis failed: {str(e)}") from e