import { reviewSteps } from "../data";
import { card, C } from "../theme";
import { FraudGauge, PageHeader, ProcessingPanel, Tag } from "./PagePieces";

export default function FraudScreen({ onShowAnalytics }) {
  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader title="Fraud Heatmap & Document Intelligence" copy="Make suspicious fields visible inside the claim document so reviewers understand why a case was escalated." />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,.6fr)", gap: 18 }}>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Document Analysis View</h2>
          <div style={{ padding: 14, borderRadius: 20, background: "linear-gradient(180deg,#f5f8fc,#ebf1f8)" }}>
            <div style={{ maxWidth: 680, margin: "0 auto", padding: 28, borderRadius: 20, background: "#fff", border: `1px solid ${C.border}`, boxShadow: "0 16px 40px rgba(15,35,66,.08)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>SUNRISE MULTISPECIALITY HOSPITAL</h3>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Tax Invoice · Claim Ref: HLT-22051 · Date: 10 Mar 2026</p>
              <div style={{ display: "grid", gap: 6, color: C.muted, fontSize: 13, marginBottom: 16 }}>
                {["Patient: Riya Sharma", "Policy: POL-HEALTH-8821", "Provider: Sunrise Hospital, Pune", "Procedure: Day-care treatment reimbursement"].map((m) => <span key={m}>{m}</span>)}
              </div>
              <div style={{ borderRadius: 14, background: C.surfaceSoft, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 16 }}>
                {[["Description", "Qty", "Rate", "Amount"], ["Consultation", "1", "2,500", "2,500"], ["Procedure charge", "1", "6,000", "6,000"], ["Medicines", "1", "1,950", "1,950"]].map((row, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "1.8fr .5fr .8fr .9fr", gap: 12, padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: i === 0 ? C.surfaceSoft : undefined, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? C.muted : C.text, fontSize: 13 }}>
                    {row.map((c) => <span key={c}>{c}</span>)}
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1.8fr .5fr .8fr .9fr", gap: 12, padding: "10px 14px", background: "rgba(214,148,63,.1)", border: `1px solid rgba(183,121,31,.3)`, fontSize: 13 }}>
                  {["Room + nursing (⚠ flagged)", "1", "11,550", "11,550"].map((c) => <span key={c} style={{ fontWeight: 600 }}>{c}</span>)}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 14, alignItems: "center", marginBottom: 16 }}>
                <span style={{ color: C.muted, fontSize: 13 }}>Invoice Total</span>
                <strong style={{ fontSize: 22, color: C.text }}>INR 22,000</strong>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: 14, borderRadius: 14, background: C.amberL, border: `1px solid rgba(183,121,31,.25)` }}>
                  <strong style={{ display: "block", fontSize: 12.5, color: C.amber, marginBottom: 4 }}>Moderate anomaly</strong>
                  <span style={{ fontSize: 12, color: C.muted }}>Room + nursing amount appears high for same-day procedure.</span>
                </div>
                <div style={{ padding: 14, borderRadius: 14, background: C.roseL, border: `1px solid rgba(194,77,44,.25)` }}>
                  <strong style={{ display: "block", fontSize: 12.5, color: C.rose, marginBottom: 4 }}>Flagged amount outlier</strong>
                  <span style={{ fontSize: 12, color: C.muted }}>Invoice total is 3× higher than expected for this provider class.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Fraud Score</h2>
            <FraudGauge score={82} />
            <div style={{ marginTop: 14 }}>
              <Tag label="Risk score: 82/100" tone="rose" />
              <ul style={{ margin: "14px 0 0", paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 2 }}>
                <li>Strong duplicate invoice similarity</li>
                <li>Amount outlier for provider baseline</li>
                <li>High-value claim threshold exceeded</li>
                <li>Requires human authorization</li>
              </ul>
            </div>
            <div style={{ marginTop: 16, padding: 14, borderRadius: 14, background: C.surfaceSoft, border: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Next best action</h3>
              <p style={{ fontSize: 12.5, color: C.muted }}>Send to reviewer queue with recommendation report and field-level annotations.</p>
            </div>
          </div>
          <ProcessingPanel title="Live Agent Activity" subtitle="Extraction agent parsed invoice. Fraud agent found anomaly. Decision agent escalated." summary={{ completed: "5 of 6 checks complete", stage: "Current stage: Escalated to reviewer" }} steps={reviewSteps.slice(1, 6)} compact spotlight="fraud" />
        </div>
      </div>
      <div>
        <button className="btn btn-secondary" onClick={onShowAnalytics}>View analytics impact →</button>
      </div>
    </section>
  );
}
