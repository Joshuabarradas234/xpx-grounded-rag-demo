# XPX Score → Explain → Act

Submit a salary advance request and get a **risk score, human-readable explanation, and recommended action** in real time.

This repo contains a small **credit risk decisioning prototype** that combines:

- A **FastAPI backend** that scores requests (rules + ML stub)
- A **React + Vite frontend** that lets you experiment with scenarios
- JSON APIs and docs suitable for plugging into a real XPX / payroll product

---

## 🧩 Problem this project is solving

Traditional salary-advance / micro-credit flows at employers and fintechs often have problems:

- Decisions feel **black-box** (users don’t know why they were approved/declined)
- Risk teams want **clear policy rules**, not just a model score
- Product teams need something that can be **tested locally** and plugged into real apps

**XPX Score → Explain → Act** is a lightweight simulation of how XPX could:

1. Receive a salary advance request  
2. Score the request with **simple rules + a model score**  
3. Return a **green / amber / red band**, a recommended **Approve / Review / Decline** action, and
4. Provide **plain-English “top drivers” + policy citations** that can be shown to customers or internal teams.

This is not a production decision engine – it’s a **demo that shows the architecture, UX and API design** you’d use to build one.

---

## ✅ What this demo does

- Collects request parameters:
  - `amount`
  - `employer`
  - `pay_frequency`
  - `tenure_months`
  - `repayment_history_score`
- Sends the request to a FastAPI endpoint:
  - `POST /score?mode=ML_PLUS_RULES`
- Returns a structured response:
  - `risk_score` (0–100)
  - `risk_band` (Green / Amber / Red)
  - `recommended_action` (Approve / Review / Decline)
  - `top_drivers` (bullet-point explanation)
  - `policy_citation` (which internal rule fired)
  - `ml_score` (simulated model contribution)
- Renders all of this in a **clean UI** that XPX stakeholders can play with.

---

## 🏗 Architecture

**Frontend**

- React + Vite
- Single screen where you:
  - Enter the request details
  - Hit **Get score**
  - See the rich explanation and raw JSON payload

**Backend**

- FastAPI application exposing:
  - `GET /health` – simple health check
  - `POST /score` – scoring endpoint (with `mode` query parameter)
- Rule engine (simple Python) that:
  - Applies business rules (tenure, repayment history, amount)
  - Calculates a risk score + band
  - Creates explanation text + policy reference
- “ML score” is currently a stubbed value to show how a model output would be combined with rules.

**Local development**

- `npm run dev` runs:
  - Backend: Uvicorn on **http://127.0.0.1:8000**
  - Frontend: Vite on **http://localhost:5173**

---

## 📂 Project structure

```text
xpx-score-explain-act/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entrypoint
│   │   ├── routers/         # API routes (health, score)
│   │   ├── services/        # scoring / rules logic
│   │   └── model/           # ML stub / helpers
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React UI
│   │   ├── main.jsx         # Vite entry
│   │   └── assets/          # static assets if needed
│   ├── package.json
│   └── vite.config.js
└── docs/
    └── screenshots/
        ├── ui-empty.png     # UI loaded, no score yet
        └── ui-approved.png  # Example approved request
