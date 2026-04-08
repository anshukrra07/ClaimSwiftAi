import { approvedSteps } from "../data";
import { C, card } from "../theme";
import { MetricCard, PageHeader, ProcessingPanel, ReceiptRow, Tag } from "./PagePieces";

export default function DecisionScreen({ onShowReview, addToast }) {
  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader title="Decision Dashboard & Explanation" copy="The system explains what happened, why it happened, and what happens next for both claimants and reviewers." />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)", gap: 18 }}>
        <div style={card}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Tag label="Approved" tone="teal" />
            <Tag label="91% confidence" tone="blue" />
          </div>
          <h2 style={{ fontSize: "clamp(1.4rem,2vw,2rem)", fontWeight: 900, color: C.navy, marginBottom: 10, lineHeight: 1.15 }}>Claim approved with 91% confidence.</h2>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginBottom: 18 }}>
            All mandatory documents match policy terms, no duplicate signal was detected, deductible was applied correctly,
            and the claim amount is within straight-through settlement threshold.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <MetricCard label="Estimated payout" value="INR 19,500" accent="teal" />
            <MetricCard label="Fraud band" value="0.0–0.3" accent="blue" note="Low risk — auto-settle eligible" />
          </div>
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Payout Breakdown</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Structured receipt view for reviewers and claimants.</p>
          <ReceiptRow label="Claimed amount" value="INR 22,000" />
          <ReceiptRow label="Deductible applied" value="– INR 2,500" danger />
          <ReceiptRow label="Excluded items" value="INR 0" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 4px 0", fontSize: 15 }}>
            <span style={{ color: C.muted }}>Final payable</span>
            <strong style={{ fontSize: "clamp(2rem,3vw,2.8rem)", color: C.teal }}>INR 19,500</strong>
          </div>
          <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: "linear-gradient(180deg,#eef9f6,#f5fffd)", border: `1px solid rgba(0,168,150,.2)` }}>
            <strong style={{ display: "block", fontSize: 13, color: C.tealD, marginBottom: 4 }}>Payment initiated via UPI</strong>
            <span style={{ fontSize: 12.5, color: C.muted }}>Expected in 1–2 business days</span>
          </div>
        </div>
      </div>
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Dynamic Risk Guardrails</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <MetricCard label="Amount threshold" value="≤ INR 25k" accent="blue" />
          <MetricCard label="Fraud threshold" value="0.0 – 0.3" accent="teal" />
          <MetricCard label="Routing rule" value="Auto-settle" accent="green" />
          <MetricCard label="Next step" value="Notify claimant" accent="navy" />
        </div>
      </div>
      <ProcessingPanel title="Live Agent Activity" subtitle="We only auto-settle claims when the evidence is strong. If something is unclear, we ask before making a decision." summary={{ completed: "5 of 6 checks complete", stage: "Current stage: Payout initiation" }} steps={approvedSteps} compact spotlight="decision" />
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-secondary" onClick={onShowReview}>Open reviewer path →</button>
        <button className="btn btn-teal" onClick={() => addToast("UPI transfer initiated — INR 19,500", "teal")}>Confirm & send payment</button>
      </div>
    </section>
  );
}
