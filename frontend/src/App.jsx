// frontend/src/App.jsx
import { useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

const defaultForm = {
  amount: 500,
  employer: "XP Demo Employer",
  pay_frequency: "monthly",
  tenure_months: 12,
  repayment_history_score: 780,
  mode: "ML_PLUS_RULES", // or "RULES_ONLY"
};

function clampNum(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const requestBody = useMemo(
    () => ({
      amount: clampNum(form.amount, 0),
      employer: String(form.employer ?? "").trim(),
      pay_frequency: String(form.pay_frequency ?? "").trim(),
      tenure_months: clampNum(form.tenure_months, 0),
      repayment_history_score: clampNum(form.repayment_history_score, 300),
    }),
    [form]
  );

  const requestUrl = useMemo(() => {
    const url = new URL("/score", API_BASE);
    url.searchParams.set("mode", form.mode);
    return url.toString();
  }, [form.mode]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const resp = await fetch(requestUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(requestBody),
      });

      const text = await resp.text();
      let data;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }

      if (!resp.ok) {
        const msg =
          data?.detail?.[0]?.msg ||
          data?.message ||
          `Request failed (${resp.status})`;
        throw new Error(msg);
      }

      setResult(data);
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function setField(key) {
    return (e) => {
      const value =
        e?.target?.type === "number" ? e.target.value : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };
  }

  const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  };

  const pill = (bg) => ({
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    background: bg,
    border: "1px solid rgba(0,0,0,0.08)",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background:
          "radial-gradient(1200px 800px at 20% 10%, #E6F7FF 0%, transparent 55%), radial-gradient(900px 700px at 80% 20%, #F3E8FF 0%, transparent 55%), linear-gradient(#f7f7fb, #f2f4f8)",
        color: "#0b1220",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <header style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <h1 style={{ fontSize: 28, margin: 0 }}>
              XPX Score → Explain → Act
            </h1>
            <span style={pill("rgba(34,197,94,0.15)")}>Frontend</span>
            <span style={pill("rgba(59,130,246,0.12)")}>
              API: {API_BASE.replace("http://", "").replace("https://", "")}
            </span>
          </div>
          <p style={{ margin: "8px 0 0", opacity: 0.8 }}>
            Submit a salary advance request and get a risk score + explanation.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: 16,
          }}
        >
          {/* FORM */}
          <div style={cardStyle}>
            <h2 style={{ margin: "0 0 12px", fontSize: 16, letterSpacing: 0.2 }}>
              Request
            </h2>

            <form onSubmit={onSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, opacity: 0.8 }}>Mode</span>
                  <select
                    value={form.mode}
                    onChange={setField("mode")}
                    style={inputStyle}
                  >
                    <option value="ML_PLUS_RULES">ML_PLUS_RULES</option>
                    <option value="RULES_ONLY">RULES_ONLY</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, opacity: 0.8 }}>Amount</span>
                  <input
                    type="number"
                    value={form.amount}
                    min={0}
                    onChange={setField("amount")}
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, opacity: 0.8 }}>Employer</span>
                  <input
                    value={form.employer}
                    onChange={setField("employer")}
                    style={inputStyle}
                    placeholder="e.g. XP Demo Employer"
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, opacity: 0.8 }}>
                    Pay frequency
                  </span>
                  <select
                    value={form.pay_frequency}
                    onChange={setField("pay_frequency")}
                    style={inputStyle}
                  >
                    <option value="weekly">weekly</option>
                    <option value="biweekly">biweekly</option>
                    <option value="monthly">monthly</option>
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, opacity: 0.8 }}>
                    Tenure (months)
                  </span>
                  <input
                    type="number"
                    value={form.tenure_months}
                    min={0}
                    max={480}
                    onChange={setField("tenure_months")}
                    style={inputStyle}
                  />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ fontSize: 13, opacity: 0.8 }}>
                    Repayment history score
                  </span>
                  <input
                    type="number"
                    value={form.repayment_history_score}
                    min={300}
                    max={850}
                    onChange={setField("repayment_history_score")}
                    style={inputStyle}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...btnStyle,
                    background: loading ? "rgba(0,0,0,0.15)" : "#0b1220",
                    color: "white",
                  }}
                >
                  {loading ? "Scoring..." : "Get score"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setForm(defaultForm);
                    setError("");
                    setResult(null);
                  }}
                  style={{ ...btnStyle, background: "rgba(0,0,0,0.06)" }}
                >
                  Reset
                </button>

                <a
                  href={`${API_BASE}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...btnStyle, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                >
                  Open API Docs
                </a>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, opacity: 0.75 }}>
                <div>
                  <strong>POST</strong>{" "}
                  <code style={codeStyle}>{requestUrl}</code>
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Body</strong>{" "}
                  <code style={codeStyle}>{JSON.stringify(requestBody)}</code>
                </div>
              </div>
            </form>

            {error ? (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#7f1d1d",
                }}
              >
                <strong>Error:</strong> {error}
              </div>
            ) : null}
          </div>

          {/* RESULTS */}
          <div style={{ display: "grid", gap: 16 }}>
            <div style={cardStyle}>
              <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>
                Result
              </h2>

              {!result ? (
                <div style={{ opacity: 0.65, fontSize: 14 }}>
                  Run a score to see the output here.
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <span style={pill("rgba(59,130,246,0.12)")}>
                      risk_score: <strong>{result.risk_score}</strong>
                    </span>
                    <span
                      style={pill(
                        result.risk_band === "Green"
                          ? "rgba(34,197,94,0.18)"
                          : result.risk_band === "Amber"
                          ? "rgba(245,158,11,0.18)"
                          : "rgba(239,68,68,0.18)"
                      )}
                    >
                      band: <strong>{result.risk_band}</strong>
                    </span>
                    <span style={pill("rgba(0,0,0,0.06)")}>
                      action: <strong>{result.recommended_action}</strong>
                    </span>
                    <span style={pill("rgba(0,0,0,0.06)")}>
                      mode: <strong>{result.mode}</strong>
                    </span>
                    {result.ml_score !== null && result.ml_score !== undefined ? (
                      <span style={pill("rgba(168,85,247,0.14)")}>
                        ml_score: <strong>{String(result.ml_score)}</strong>
                      </span>
                    ) : null}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                      Top drivers
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {(result.top_drivers || []).map((d, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>
                      Policy citation
                    </div>
                    <div style={{ ...codeStyle, display: "block" }}>
                      {result.policy_citation}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    <button
                      style={{ ...btnStyle, background: "rgba(0,0,0,0.06)" }}
                      type="button"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
                    >
                      Copy JSON
                    </button>
                  </div>
                </>
              )}
            </div>

            <div style={cardStyle}>
              <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>
                Raw JSON
              </h2>
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  borderRadius: 12,
                  background: "rgba(0,0,0,0.06)",
                  overflow: "auto",
                  maxHeight: 340,
                  fontSize: 12,
                }}
              >
                {result ? JSON.stringify(result, null, 2) : "{}"}
              </pre>
            </div>
          </div>
        </div>

        <footer style={{ marginTop: 18, fontSize: 12, opacity: 0.65 }}>
          Tip: your Vite dev server may run on <code style={codeStyle}>http://localhost:5174</code> if 5173 was already in use.
        </footer>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  background: "white",
  outline: "none",
};

const btnStyle = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(0,0,0,0.12)",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 13,
};

const codeStyle = {
  padding: "3px 8px",
  borderRadius: 999,
  background: "rgba(0,0,0,0.06)",
  border: "1px solid rgba(0,0,0,0.08)",
};
