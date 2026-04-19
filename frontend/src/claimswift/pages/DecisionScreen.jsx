import { C, card } from "../theme";
import { formatInr, riskTone } from "../formatters";
import { getInsurancePalette, getPlaybook } from "../playbooks";
import { ClaimSwitcher, MetricCard, PageHeader, ProcessingPanel, ReceiptRow, Tag } from "./PagePieces";

function decisionTimeline(status) {
  if (status === "settled") {
    return [
      { label: "Submitted", state: "done" },
      { label: "Checked", state: "done" },
      { label: "Approved", state: "done" },
      { label: "Paid", state: "done" },
    ];
  }

  return [
    { label: "Submitted", state: "done" },
    { label: "Checked", state: "done" },
    { label: "Approved", state: "active" },
    { label: "Paid", state: "wait" },
  ];
}

function DecisionTimeline({ status }) {
  const nodes = decisionTimeline(status);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      {nodes.map((node, index) => {
        const isDone = node.state === "done";
        const isActive = node.state === "active";
        return (
          <div key={node.label} style={{ display: "contents" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
              <div
                className={isActive ? "glow-pulse" : undefined}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: isDone ? C.green : isActive ? C.teal : C.surfaceSoft,
                  color: isDone || isActive ? "#fff" : C.muted,
                  border: isDone || isActive ? "none" : `1.5px solid ${C.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {isDone ? "✓" : index + 1}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: isActive || isDone ? 700 : 500, color: isActive ? C.navy : isDone ? C.tealD : C.muted, textAlign: "center" }}>
                {node.label}
              </div>
            </div>
            {index < nodes.length - 1 ? <div style={{ height: 2, flex: 1, minWidth: 24, background: isDone ? C.green : C.border, marginBottom: 18 }} /> : null}
          </div>
        );
      })}
    </div>
  );
}

export default function DecisionScreen({ claim, claimOptions, onSelectClaim, policyRules, onShowReview, onSettle, canSettle, canOpenReview }) {
  if (!claim) {
    return <section style={{ display: "grid", gap: 18 }}><PageHeader title="Decision Dashboard & Explanation" copy="No approved claim is available yet." /></section>;
  }

  const payoutLabel = claim.status === "settled" ? "Settled" : "Approved";
  const playbook = getPlaybook(claim.insuranceType);
  const actionLabel = claim.status === "settled" ? "Payout recorded" : playbook.payoutLabel;

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader title="Decision Dashboard & Explanation" copy="The system explains what happened, why it happened, and what happens next for both claimants and reviewers." />
      <ClaimSwitcher title="Decision views" claims={claimOptions} activeId={claim.id} onSelect={onSelectClaim} tone={getInsurancePalette(claim.insuranceType)} subtitle="Open a different claim decision trace" />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,.9fr)", gap: 18 }}>
        <div style={card}>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <Tag label={payoutLabel} tone={claim.status === "settled" ? "blue" : "teal"} />
            <Tag label={`${Math.max(100 - claim.fraudScore, 55)}% confidence`} tone="blue" />
          </div>
          <h2 style={{ fontSize: "clamp(1.4rem,2vw,2rem)", fontWeight: 900, color: C.navy, marginBottom: 10, lineHeight: 1.15 }}>Claim {claim.status === "settled" ? "settled" : "approved"} with {Math.max(100 - claim.fraudScore, 55)}% confidence.</h2>
          <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginBottom: 18 }}>
            {claim.explanation.summary}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <MetricCard label="Estimated payout" value={formatInr(claim.payableAmount)} accent="teal" />
            <MetricCard label="Fraud band" value={claim.fraudBand.toUpperCase()} accent={riskTone(claim.fraudBand)} note={`Risk score ${claim.fraudScore}/100`} />
          </div>
          <div style={{ marginTop: 18, padding: 18, borderRadius: 18, border: `1px solid ${C.border}`, background: C.surfaceSoft }}>
            <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 12 }}>Claim journey</strong>
            <DecisionTimeline status={claim.status} />
          </div>
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>Payout Breakdown</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Structured receipt view for reviewers and claimants.</p>
          {claim.explanation.breakdown.map((item) => (
            <ReceiptRow key={item.label} label={item.label} value={item.kind === "deductible" ? `– ${formatInr(Math.abs(item.value))}` : formatInr(item.value)} danger={item.kind === "deductible"} />
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 4px 0", fontSize: 15 }}>
            <span style={{ color: C.muted }}>Final payable</span>
            <strong style={{ fontSize: "clamp(2rem,3vw,2.8rem)", color: C.teal }}>{formatInr(claim.payableAmount)}</strong>
          </div>
          <div style={{ marginTop: 16, padding: 16, borderRadius: 14, background: "linear-gradient(180deg,#eef9f6,#f5fffd)", border: `1px solid rgba(0,168,150,.2)` }}>
            <strong style={{ display: "block", fontSize: 13, color: C.tealD, marginBottom: 4 }}>{actionLabel}</strong>
            <span style={{ fontSize: 12.5, color: C.muted }}>{claim.status === "settled" ? "Status and payout notification recorded." : playbook.statusHelp}</span>
          </div>
        </div>
      </div>
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Dynamic Risk Guardrails</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          <MetricCard label="Amount threshold" value={`≤ ${formatInr(policyRules?.stpLimit || 0)}`} accent="blue" />
          <MetricCard label="Fraud threshold" value={claim.fraudBand.toUpperCase()} accent={riskTone(claim.fraudBand)} />
          <MetricCard label="Routing rule" value={claim.status === "settled" ? "Settled" : "Auto-settle"} accent="green" />
          <MetricCard label="Next step" value={claim.status === "settled" ? "Closed loop" : "Notify claimant"} accent="navy" />
        </div>
      </div>
      <ProcessingPanel title="Live Agent Activity" subtitle="We only auto-settle claims when the evidence is strong. If something is unclear, we ask before making a decision." summary={{ completed: `${claim.activities.filter((step) => step.status === "done").length} of ${claim.activities.length} checks complete`, stage: `Current stage: ${claim.statusLabel}` }} steps={claim.activities} compact spotlight="decision" />
      <div style={{ display: "flex", gap: 12 }}>
        <button className="btn btn-secondary" onClick={onShowReview} disabled={!canOpenReview}>Open reviewer path →</button>
        <button className="btn btn-teal" onClick={onSettle} disabled={!canSettle || claim.status === "settled"}>{claim.status === "settled" ? "Payment simulated" : "Confirm & send payment"}</button>
      </div>
    </section>
  );
}
