import { card, C } from "../theme";
import { formatInr, riskTone } from "../formatters";
import { getInsurancePalette, getPlaybook } from "../playbooks";
import { ClaimSwitcher, PageHeader, ProcessingPanel, QueueItem, Tag } from "./PagePieces";

export default function ReviewerScreen({ claim, queueClaims, onSelectClaim, onShowFraud, onReviewAction, canReview }) {
  if (!claim) {
    return <section style={{ display: "grid", gap: 18 }}><PageHeader title="Reviewer Console & Manual Queue" copy="No review case is currently available." /></section>;
  }

  const playbook = getPlaybook(claim.insuranceType);

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader title="Reviewer Console & Manual Queue" copy="High-risk or high-value claims arrive with a recommendation report, evidence summary, and override controls." />
      <ClaimSwitcher title="Reviewer cases" claims={queueClaims} activeId={claim.id} onSelect={onSelectClaim} tone={getInsurancePalette(claim.insuranceType)} subtitle="Switch between manual and verification queue cases" />
      <div style={{ display: "grid", gridTemplateColumns: "280px minmax(0,1fr)", gap: 18 }}>
        <div style={{ ...card, display: "grid", alignContent: "start", gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800 }}>Manual Review Queue</h2>
          {queueClaims.map((item) => (
            <QueueItem
              key={item.id}
              title={`${item.id} · ${item.insuranceLabel}`}
              note={`${item.statusLabel} · ${formatInr(item.claimAmount)} · Risk ${item.fraudScore}/100`}
              active={item.id === claim.id}
              onClick={() => onSelectClaim(item.id)}
            />
          ))}
          <Tag label={`${queueClaims.length} high-priority cases`} tone="rose" />
        </div>
        <div style={{ display: "grid", gap: 18 }}>
          <div style={card}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Tag label={claim.statusLabel} tone={riskTone(claim.fraudBand)} />
              <Tag label={`${claim.fraudBand.toUpperCase()} risk`} tone={riskTone(claim.fraudBand)} />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>System Recommendation Report</h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
              {claim.explanation.summary}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: C.navy }}>Evidence Summary</h3>
                {[`Duplicate similarity: ${Math.round((claim.duplicateSimilarity || 0) * 100)}%`, `Provider risk: ${claim.providerRiskLevel}`, `Claim amount: ${formatInr(claim.claimAmount)}`, `Policy age: ${claim.policyAgeDays} days`, ...playbook.reviewerChecks].map((i) => (
                  <div key={i} style={{ fontSize: 13, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>• {i}</div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 8, color: C.navy }}>Audit Trace</h3>
                {[`Rule check complete`, `Fraud model score: ${claim.fraudScore}/100`, ...(claim.timelineNotes || []).slice(0, 2)].map((i) => (
                  <div key={i} style={{ fontSize: 13, color: C.muted, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>• {i}</div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-secondary" onClick={() => onReviewAction("approve")} disabled={!canReview}>Approve manually</button>
              <button className="btn btn-danger" onClick={() => onReviewAction("reject")} disabled={!canReview}>Reject / investigate</button>
              <button className="btn btn-ghost" onClick={() => onReviewAction("verify")} disabled={!canReview}>Override to verify</button>
            </div>
          </div>
          <ProcessingPanel title="Reviewer-facing Decision Trace" subtitle="Coverage matched, but amount exceeds safe automation thresholds." summary={{ completed: `${claim.activities.filter((step) => step.status === "done").length} of ${claim.activities.length} checks complete`, stage: `Current stage: ${claim.statusLabel}` }} steps={claim.activities} compact spotlight="fraud" />
          <div>
            <button className="btn btn-secondary" onClick={onShowFraud}>Inspect fraud heatmap →</button>
          </div>
        </div>
      </div>
    </section>
  );
}
