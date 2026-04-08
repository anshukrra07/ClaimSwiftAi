import { C } from "../theme";
import { FeatureCard, MetricCard, Tag } from "./PagePieces";

export default function LandingScreen({ onPrimary, onSecondary }) {
  return (
    <section
      style={{
        minHeight: "100vh",
        padding: 48,
        display: "grid",
        gridTemplateColumns: "minmax(0,1.3fr) 380px",
        gap: 32,
        alignItems: "start",
        background: "linear-gradient(180deg,#16284b,#0f2342)",
        color: "#f4f7fb",
      }}
    >
      <div className="rise-in">
        <span style={{ display: "inline-flex", alignItems: "center", padding: "7px 14px", borderRadius: 999, background: "rgba(0,168,150,.18)", color: "#b4fff7", fontSize: 12, fontWeight: 700, letterSpacing: ".06em" }}>
          TECHNOVERSE 2026
        </span>
        <h1 style={{ margin: "20px 0 10px", fontSize: "clamp(3rem,6vw,5.2rem)", lineHeight: 0.96, fontWeight: 900 }}>ClaimSwift AI</h1>
        <p style={{ fontSize: "clamp(1.2rem,1.8vw,2rem)", color: "#ebf2ff", fontWeight: 600, margin: "0 0 18px" }}>Explainable straight-through insurance claims automation</p>
        <p style={{ fontSize: 16, color: "rgba(240,245,255,.8)", maxWidth: 680, lineHeight: 1.65, marginBottom: 22 }}>
          Design for trust, not just speed. ClaimSwift converts messy submissions into decision-ready,
          fraud-aware workflows that clarify uncertainty, explain outcomes, and settle low-risk claims in minutes.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            ["Live Agent Feed", "navy"],
            ["Clarification Recovery", "blue"],
            ["Fraud Heatmap", "amber"],
            ["Payout Breakdown", "teal"],
          ].map(([l, t]) => (
            <Tag key={l} label={l} tone={t} />
          ))}
        </div>
        <div style={{ padding: 20, borderRadius: 22, background: "rgba(255,255,255,.97)", color: C.text, maxWidth: 700, boxShadow: "0 20px 48px rgba(15,35,66,.14)", marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 14, color: C.navy }}>Why judges remember ClaimSwift</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <FeatureCard title="Visible AI workflow" copy="Live processing makes orchestration tangible for every stakeholder." />
            <FeatureCard title="Clarification recovery" copy="The system resumes safely from messy or ambiguous inputs." />
            <FeatureCard title="Explained outcomes" copy="Payout, fraud signals, and routing explained in plain language." />
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <button className="btn btn-teal" onClick={onPrimary}>
            Open demo workflow →
          </button>
          <button className="btn btn-secondary" style={{ background: "rgba(255,255,255,.12)", color: "#fff", borderColor: "rgba(255,255,255,.18)" }} onClick={onSecondary}>
            View reviewer path
          </button>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: "#b7d7d4", fontWeight: 600 }}>Built for trust: safe automation, not black-box approvals.</p>
      </div>
      <aside className="rise-in" style={{ padding: 22, borderRadius: 24, background: "rgba(255,255,255,.97)", color: C.text, boxShadow: "0 24px 60px rgba(15,35,66,.18)", animationDelay: "80ms" }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Judge-facing wow moments</h2>
        <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
          <MetricCard label="Decision confidence" value="91%" accent="blue" />
          <MetricCard label="Clarification loop" value="1 tap" accent="teal" />
          <MetricCard label="STP rate" value="82%" accent="green" delta="+4% this month" />
        </div>
        <div style={{ padding: 16, borderRadius: 16, background: C.surfaceSoft, border: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, color: C.navy }}>Demo sequence</h3>
          {["Upload blurred hospital bill", "Live feed detects low confidence", "Clarification prompt appears", "Claim resumes to payout or review", "Fraud heatmap explains escalation"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
              <span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: C.blueL, color: C.blue, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: C.muted }}>{step}</span>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
