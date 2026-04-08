import { useState } from "react";
import { reviewSteps } from "../data";
import { card, C } from "../theme";
import { PageHeader, ProcessingPanel, QueueItem, Tag } from "./PagePieces";

export default function ReviewerScreen({ onShowFraud, addToast }) {
  const [activeCase, setActiveCase] = useState(0);
  const cases = [
    { title: "CLM-2026-2103 · High risk", note: "Recommendation: escalate for controlled review" },
    { title: "CLM-2026-2108 · Above threshold", note: "Recommendation packet ready" },
    { title: "CLM-2026-2111 · Duplicate signal", note: "Recommendation packet ready" },
    { title: "CLM-2026-2114 · Provider anomaly", note: "Recommendation packet ready" },
  ];

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader title="Reviewer Console & Manual Queue" copy="High-risk or high-value claims arrive with a recommendation report, evidence summary, and override controls." />
      <div style={{ display: "grid", gridTemplateColumns: "280px minmax(0,1fr)", gap: 18 }}>
        <div style={{ ...card, display: "grid", alignContent: "start", gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800 }}>Manual Review Queue</h2>
          {cases.map((c, i) => <QueueItem key={c.title} {...c} active={i === activeCase} onClick={() => setActiveCase(i)} />)}
          <Tag label="4 high-priority cases" tone="rose" />
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          <div style={card}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Tag label="Escalate" tone="rose" />
              <Tag label="High risk" tone="amber" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>System Recommendation Report</h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
              Claim exceeds safe payout threshold and presents strong duplicate signal. Human authorization is required before final routing.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: C.navy }}>Evidence Summary</h3>
                {["Duplicate invoice similarity: strong", "Provider risk: high", "Claim amount: INR 96,000", "Required docs: incomplete at first submission"].map((i) => (
                  <div key={i} style={{ fontSize: 13, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>• {i}</div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: C.navy }}>Audit Trace</h3>
                {["Rule check complete", "Fraud model score: 82/100", "Clarification requested and accepted", "Routing: pending reviewer action"].map((i) => (
                  <div key={i} style={{ fontSize: 13, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>• {i}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={() => addToast("Claim manually approved and queued for payout", "teal")}>Approve manually</button>
              <button className="btn btn-danger" onClick={() => addToast("Claim flagged for investigation", "rose")}>Reject / investigate</button>
              <button className="btn btn-ghost" onClick={() => addToast("Claim moved to verify queue", "amber")}>Override to verify</button>
            </div>
          </div>
          <ProcessingPanel title="Reviewer-facing Decision Trace" subtitle="Coverage matched, but amount exceeds STP threshold." summary={{ completed: "5 of 6 checks complete", stage: "Current stage: Reviewer action pending" }} steps={reviewSteps} compact spotlight="fraud" />
          <div>
            <button className="btn btn-secondary" onClick={onShowFraud}>Inspect fraud heatmap →</button>
          </div>
        </div>
      </div>
    </section>
  );
}
