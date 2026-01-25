from enum import Enum
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(title="XPX Score → Explain → Act", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # demo only - lock this down later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Mode(str, Enum):
    RULES_ONLY = "rules_only"
    ML_PLUS_RULES = "ml_plus_rules"


class PayFrequency(str, Enum):
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"


class SalaryAdvanceRequest(BaseModel):
    amount: int = Field(..., ge=50, le=5000, description="Requested advance amount")
    employer: str = Field(..., min_length=2, max_length=80)
    pay_frequency: PayFrequency
    tenure_months: int = Field(..., ge=0, le=240)
    repayment_history_score: int = Field(
        600, ge=300, le=900, description="Synthetic repayment score"
    )
    mode: Mode = Mode.RULES_ONLY


class Driver(BaseModel):
    name: str
    impact: int = Field(..., ge=0, le=100)  # simple % impact for demo


class ScoreResponse(BaseModel):
    request_id: str
    mode: Mode
    risk_band: str  # Green / Amber / Red
    risk_score: int = Field(..., ge=0, le=100)
    top_drivers: List[Driver]
    recommended_action: str
    policy_citation: str
    ml_score: Optional[float] = None  # only populated when mode = ML_PLUS_RULES


@app.get("/health")
def health():
    return {"status": "ok"}


def rules_score(req: SalaryAdvanceRequest) -> tuple[int, List[Driver]]:
    # Start from low risk and add penalties
    score = 10
    drivers: list[Driver] = []

    # Amount penalty
    if req.amount >= 2000:
        score += 25
        drivers.append(Driver(name="High requested amount", impact=30))
    elif req.amount >= 1000:
        score += 15
        drivers.append(Driver(name="Moderate requested amount", impact=20))

    # Tenure penalty
    if req.tenure_months < 3:
        score += 25
        drivers.append(Driver(name="Low tenure (<3 months)", impact=30))
    elif req.tenure_months < 6:
        score += 12
        drivers.append(Driver(name="Low tenure (<6 months)", impact=15))

    # Pay frequency penalty
    if req.pay_frequency in {PayFrequency.WEEKLY, PayFrequency.BIWEEKLY}:
        score += 8
        drivers.append(Driver(name="Higher pay frequency variability", impact=10))

    # Repayment history penalty
    if req.repayment_history_score < 580:
        score += 25
        drivers.append(Driver(name="Weaker repayment history score", impact=30))
    elif req.repayment_history_score < 650:
        score += 12
        drivers.append(Driver(name="Average repayment history score", impact=15))

    # Keep within 0-100
    score = max(0, min(100, score))

    # Pick top 3 drivers by impact (for demo simplicity)
    drivers_sorted = sorted(drivers, key=lambda d: d.impact, reverse=True)[:3]
    return score, drivers_sorted


def ml_score(req: SalaryAdvanceRequest) -> float:
    """
    Demo-only 'ML' score: deterministic formula to simulate an ML probability.
    (Keeps the demo stable + repeatable.)
    """
    base = 0.10
    base += min(req.amount / 5000, 1.0) * 0.35
    base += (0.25 if req.tenure_months < 3 else 0.12 if req.tenure_months < 6 else 0.0)
    base += (0.10 if req.repayment_history_score < 580 else 0.05 if req.repayment_history_score < 650 else 0.0)

    # Clamp 0..0.95
    return float(max(0.0, min(0.95, base)))


def band_and_action(final_score: int) -> tuple[str, str]:
    if final_score < 35:
        return "Green", "Approve"
    if final_score < 65:
        return "Amber", "Request Documents / Manual Review"
    return "Red", "Decline / Escalate"


@app.post("/score", response_model=ScoreResponse)
def score(req: SalaryAdvanceRequest):
    rules, drivers = rules_score(req)

    mls: Optional[float] = None
    final = rules

    if req.mode == Mode.ML_PLUS_RULES:
        mls = ml_score(req)
        # combine: convert ML prob to 0..100 and blend with rules
        ml_0_100 = int(round(mls * 100))
        final = int(round(0.6 * rules + 0.4 * ml_0_100))

    band, action = band_and_action(final)

    # Simple policy citation string for Copilot tab later
    citation = "Policy PX-ADV-01: Tenure<3m or score<580 requires review/decline"

    return ScoreResponse(
        request_id="REQ-demo-001",
        mode=req.mode,
        risk_band=band,
        risk_score=final,
        top_drivers=drivers,
        recommended_action=action,
        policy_citation=citation,
        ml_score=mls,
    )
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="XPX Score → Explain → Act", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

