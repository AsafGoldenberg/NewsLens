from typing import List, Literal, Optional
from pydantic import BaseModel, Field

PoliticalLean = Literal[
    "Left",
    "Center-Left",
    "Center",
    "Center-Right",
    "Right",
    "Unclear",
]

class AnalyzeRequest(BaseModel):
    input_type: Literal["url", "text"]
    content: str


class FlaggedTerm(BaseModel):
    term: str
    reason: str
    intensity: int = Field(ge=1, le=10)

class HeadlineBodyConsistency(BaseModel):
    score: int = Field(ge=0, le=10)
    explanation: str

class FramingAnalysis(BaseModel):
    quoted_sources: List[str]
    centered_perspective: str
    missing_perspectives: List[str]

class AnalysisResult(BaseModel):
    title: Optional[str] = None
    political_lean: PoliticalLean
    political_lean_score: int = Field(ge=-4, le=4)
    emotional_language_score: int = Field(ge=0, le=10)
    flagged_terms: List[FlaggedTerm]
    framing_analysis: FramingAnalysis
    missing_context: List[str]
    headline_body_consistency: HeadlineBodyConsistency
    summary: str
    caveat: str
class AnalyzeRequest(BaseModel):
    input_type: Literal["url", "text"]
    content: str