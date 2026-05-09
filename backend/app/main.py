from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models import AnalyzeRequest,AnalysisResult
from app.scraper import scrape_article
from app.llm import analyze_with_llm

app = FastAPI(title="Media Framing Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze_article(request: AnalyzeRequest):
    try:
        if request.input_type == "url":
            scraped = await scrape_article(request.content)
            title = scraped["title"]
            text = scraped["text"]
        else:
            title = None
            text = request.content

        if len(text.split()) < 80:
            raise HTTPException(
                status_code=400,
                detail="Article text is too short to analyze."
            )

        result = await analyze_with_llm(title, text)
        result["title"] = title
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))