from fastapi import FastAPI
from .schemas import ClaimRequest, VerificationResponse
from .pipeline import run_verification_pipeline

app = FastAPI(title="AI Verification Service")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/verify", response_model=VerificationResponse)
def verify(request: ClaimRequest):
    return run_verification_pipeline(request.claim)
