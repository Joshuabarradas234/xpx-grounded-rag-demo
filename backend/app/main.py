from enum import Enum
from typing import List, Optional, Tuple

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class Mode(str, Enum):
    RULES_ONLY = "RULES_ONLY"
    ML_PLUS_RULES = "ML_PLUS_RULES"


class SalaryAdvanceRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Requested advance amount")
    employer: str = Field(..., min_length=2)
    pay_frequency: str = Field(..., description="e.g. weekly, biweekly, monthly")
    tenure_months: int = Field(..., ge=0, le=480)
    repayment_history_score: int = Field(..., ge=300, le=850, description="Synthetic credit-ish score")


class ScoreResponse(BaseModel):
    request_id: str
    mode: Mode
    risk_score: int
    risk_band: str
    top_drivers: List[str]
    recommended_action: str
    policy_citation: str
    ml_score: Optional[float] = None  # 0..1 probability-like


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


def rules_score(req: SalaryAdvanceRequest) -> Tuple[int, List[str]]:
    """
    Returns (risk_score 0..100, top_drivers). Higher = riskier.
    Keep drivers explainable for the demo.
    """
    drivers: List[str] = []
    score = 0

    # Amount
    if req.amount >= 2000:
        score += 35
        drivers.append("High advance amount (>= 2000)")
    elif req.amount >= 1000:
        score += 20
        drivers.append("Medium advance amount (>= 1000)")
    else:
        score += 10
        drivers.append("Low advance amount (< 1000)")

    # Tenure
    if req.tenure_months < 3:
        score += 30
        drivers.append("Low tenure (< 3 months)")
    elif req.tenure_months < 12:
        score += 15
        drivers.append("Moderate tenure (< 12 months)")
    else:
        score += 5
        drivers.append("Established tenure (>= 12 months)")

    # Repayment history
    if req.repayment_history_score < 580:
        score += 35
        drivers.append("Weak repayment history (score < 580)")
    elif req.repayment_history_score < 650:
        score += 20
        drivers.append("Average repayment history (score < 650)")
    else:
        score += 5
        drivers.append("Strong repayment history (score >= 650)")

    # Pay frequency (synthetic behaviour signal)
    pf = req.pay_frequency.strip().lower()
    if "week" in pf:
        score += 15
        drivers.append("High-frequency pay cycle (weekly)")
    elif "bi" in pf:
        score += 10
        drivers.append("Biweekly pay cycle")
    else:
        score += 5
        drivers.append("Monthly pay cycle")

    # Clamp 0..100
    score = max(0, min(100, score))

    # Return top 3 drivers (highest impact first-ish)
    drivers = drivers[:3]
    return score, drivers


def ml_score(req: SalaryAdvanceRequest) -> float:
    """
    Fake 'ML' score for demo: returns 0..1 probability of adverse outcome.
    """
    prob = 0.15

    if req.amount >= 2000:
        prob += 0.20
    if req.tenure_months < 3:
        prob += 0.25
    if req.repayment_history_score < 580:
        prob += 0.25
    if "week" in req.pay_frequency.strip().lower():
        prob += 0.10

    return float(max(0.01, min(0.95, prob)))


def band_and_action(risk_score: int) -> Tuple[str, str]:
    if risk_score < 35:
        return "Green", "Approve"
    if risk_score < 65:
        return "Amber", "Request Documents / Manual Review"
    return "Red", "Decline / Escalate"


@app.post("/score", response_model=ScoreResponse)
def score(req: SalaryAdvanceRequest, mode: Mode = Mode.ML_PLUS_RULES):
    rules, drivers = rules_score(req)

    ml_val: Optional[float] = None
    final = rules

    if mode == Mode.ML_PLUS_RULES:
        ml_val = ml_score(req)
        ml_0_100 = int(round(ml_val * 100))
        final = int(round(0.6 * rules + 0.4 * ml_0_100))

    band, action = band_and_action(final)

    citation = "Policy PX-ADV-01: Tenure < 3 months OR repayment score < 580 ⇒ review/decline"

    return ScoreResponse(
        request_id="REQ-demo-001",
        mode=mode,
        risk_score=final,
        risk_band=band,
        top_drivers=drivers,
        recommended_action=action,
        policy_citation=citation,
        ml_score=ml_val,
    )

