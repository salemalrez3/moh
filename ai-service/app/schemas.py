from pydantic import BaseModel
from typing import List


class ClaimRequest(BaseModel):
    claim: str


class SourceResult(BaseModel):
    title: str
    url: str
    stance: str
    similarity_score: float


class VerificationResponse(BaseModel):
    verdict: str
    confidence: float
    analysis_summary: str
    sources: List[SourceResult]
