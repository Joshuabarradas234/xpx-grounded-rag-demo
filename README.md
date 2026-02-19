# XPX Grounded RAG – Explainable Salary Advance Risk Engine

A local-first **Grounded RAG + Explainable Scoring API** for salary advance decisioning.

This project demonstrates how to design a production-style, audit-friendly AI decision system that:

* Scores salary advance requests
* Explains decisions transparently
* Grounds responses in policy
* Integrates with Amazon OpenSearch
* Exposes clean REST APIs
* Provides frontend + API documentation

---

## 🎯 Objective

To simulate a real-world fintech decision engine that:

* Produces risk scores
* Generates explainable outputs
* Enforces policy citations
* Supports compliance auditability
* Demonstrates RAG-style grounded reasoning

This is structured as an evidence-ready architecture suitable for fintech, lending, and regulated environments.

---
## Business Problem

Traditional salary-advance decisions are often:
- Opaque (no explanation behind approvals/rejections)
- Hard to audit
- Vulnerable to inconsistent decision logic
- Difficult to defend during compliance reviews

Financial institutions require:
- Explainable decisions
- Policy traceability
- Consistent scoring logic
- Audit-friendly evidence

This system solves that by implementing a local-first, explainable scoring engine that:
- Generates a risk score
- Provides top decision drivers
- Cites the exact policy used
- Produces structured JSON evidence

## Architecture Overview

This system implements a local-first explainable decision engine:

Frontend (React)
→ Backend API (FastAPI)
→ Policy + ML scoring logic
→ Explainable output (score + drivers + citation)
→ Evidence pack generation

See:
``
![Architecture diagram](docs/00-architecture-digram.png)
```

### Core Components

| Layer             | Responsibility                        |
| ----------------- | ------------------------------------- |
| Frontend          | Salary advance submission UI          |
| FastAPI Backend   | Scoring + explainability API          |
| Rule Engine       | Deterministic risk logic              |
| RAG Layer         | Policy-grounded explanations          |
| Amazon OpenSearch | Policy retrieval / metadata filtering |
| OpenAPI Docs      | Swagger documentation                 |

---

## 🚀 Features

### 1. Health Check Endpoint

```
GET /health
```

Verifies API availability.

Screenshot:

```
### 1) API health check (FastAPI running)
![API health check success](docs/01-api-health-check-success.png)
```

---

### 2. OpenAPI Documentation (Swagger)

Interactive API documentation available at:

```
/docs
```

Screenshot:

```
### 2) Swagger / OpenAPI docs
![Swagger UI](docs/02-Swagger-ui-openapi.png)
```

---

### 3. Risk Scoring Endpoint

```
POST /score
```

Example request:

```json
{
  "mode": "ML_PLUS_RULES",
  "amount": 2500,
  "employer": "Pick n Pay",
  "pay_frequency": "monthly",
  "tenure_months": 12,
  "repayment_history_score": 700
}
```

Example response:

```json
{
  "request_id": "REQ-demo-001",
  "risk_score": 44,
  "risk_band": "Amber",
  "top_drivers": [
    "High advance amount (>= 2000)",
    "Established tenure (>= 12 months)",
    "Strong repayment history (score >= 650)"
  ],
  "recommended_action": "Request Documents / Manual Review",
  "policy_citation": "Policy PX-ADV-01"
}
```

Screenshot:

### 3) Explainable score response (API output)
![Explainable score response](docs/03-explainable-score-response.png)

---

### 4. Frontend Demo UI

A simple UI that submits salary advance requests and displays:

* Risk score
* Risk band
* Drivers
* Policy citation
* Raw JSON

Screenshot:


### 4) OpenSearch environment configuration
![Frontend score + explanation](docs/04-frontend-score-and-explanation.png)

```

---

### 5. Amazon OpenSearch Integration

Environment variables:

```
OPENSEARCH_ENDPOINT
OPENSEARCH_USERNAME
OPENSEARCH_PASSWORD
```
```
Screenshot:

### 5) Frontend score + explanation (UI)
![OpenSearch environment configuration](docs/05-opensearch-environment-configuration.png)
```
Used for:

* Policy metadata filtering
* Grounded retrieval
* Explainable citations

---

## 🧠 Design Philosophy

This project demonstrates:

* Deterministic + explainable AI
* Transparent policy-based decisions
* Audit-friendly outputs
* Separation of scoring and explanation
* Production-style API design
* Environment-based secret handling

---

## 🛠 Tech Stack

* Python
* FastAPI
* Uvicorn
* Amazon OpenSearch
* JavaScript (Frontend)
* OpenAPI 3.1
* Docker-ready structure

---
```
## 🧪 Running Locally


##⚡ Quick Start
Backend:
```bash
git clone https://github.com/your-username/xpx-grounded-rag-demo
cd xpx-grounded-rag-demo/backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

```

Frontend:

```bash
cd frontend
npm install
npm run dev
```
 🧪 Testing

pytest tests/

Swagger Docs:

```
http://localhost:8000/docs
```
## Decision-Making Documentation (ADR Approach)

This project documents architectural decisions using a lightweight ADR approach.

### 1. Alternatives Considered
- Fully ML-driven scoring without rules
- Fully rule-based policy engine
- Cloud-hosted inference
- Local-first inference
- No explainability vs structured explanation output

### 2. Why These Architectural Choices Were Made
- Hybrid ML + rules to balance flexibility and compliance
- Local-first design to avoid cloud dependency
- FastAPI for lightweight API layer
- React frontend for interactive demonstration
- Structured JSON output for audit traceability

### 3. Trade-Offs Balanced
- Performance vs Explainability
- Cost vs Scalability
- Simplicity vs Extensibility
- Security vs Developer Velocity

  ## Future Enhancements

- Add real ML model integration (e.g., XGBoost or PyTorch model)
- Implement structured audit log persistence
- Add role-based access control
- Deploy via Docker Compose or AWS ECS
- Add automated unit tests and CI pipeline
---

## Project Structure

```
backend/
frontend/
docs/
  00-architecture-diagram.png
  01-api-health-check-success.png
  02-Swagger-ui-openapi.png
  03-explainable-score-response.png
  04-frontend-score-and-explanation.png
  05-opensearch-environment-configuration.png
```

---

## 🔐 Security & Compliance Considerations

* No secrets committed (env-based config)
* Policy-grounded explainability
* Deterministic decision logic
* Structured JSON outputs
* Audit-ready responses

---

## 💼 Why This Project Matters

This demo simulates:

* Fintech lending risk engines
* AI-assisted underwriting
* Explainable ML systems
* Regulated decision pipelines
* Cloud-ready AI architectures

It is structured as a portfolio-ready, recruiter-facing demonstration of applied AI engineering.

---
