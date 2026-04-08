import { C, card } from "../theme";
import { ConfidenceCard, Field, PageHeader, ProcessingPanel, Tag } from "./PagePieces";

export default function IntakeScreen({ intakeMode, setIntakeMode, onRunDecision, onClarification, onReview, steps, progressSummary }) {
  const scenarioLabel = intakeMode === "approved" ? "High confidence — verified" : intakeMode === "review" ? "Escalated pattern" : "Clarification required";
  const scenarioTone = intakeMode === "approved" ? "teal" : intakeMode === "review" ? "rose" : "amber";

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader title="Claim Intake & Orchestration" copy="Capture clean claim data, surface document issues early, and trigger the decision workflow with visible guardrails." />
      <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <div>
          <strong style={{ display: "block", fontSize: 14, marginBottom: 4 }}>Demo mode</strong>
          <p style={{ fontSize: 13, color: C.muted }}>Switch between the clean path, clarification flow, and reviewer escalation.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            ["clarification", "Clarification"],
            ["approved", "Auto-settle"],
            ["review", "Review path"],
          ].map(([id, label]) => (
            <button key={id} className={`mode-chip ${intakeMode === id ? "active" : ""}`} onClick={() => setIntakeMode(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,.7fr)", gap: 18 }}>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <strong style={{ fontSize: 14 }}>Current scenario</strong>
            <Tag label={scenarioLabel} tone={scenarioTone} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 18 }}>
            <Field label="Claim ID" value="CLM-2026-2105" />
            <Field label="Claim Amount" value="INR 22,000" />
            <ConfidenceCard title="Claim amount" value="INR 22,000" score="91%" tone="good" subtitle="High confidence — verified" />
            <ConfidenceCard title="Invoice total" value="INR 12,450 (?)" score="38%" tone="risk" subtitle="Low confidence — clarification triggered" />
            <ConfidenceCard title="Discharge date" value="12 Apr 2026" score="65%" tone="warn" subtitle="Moderate — verify with doc" />
            <Field label="Deductible" value="INR 2,500" />
            <Field label="OCR Confidence" value="62%" />
            <Field label="Duplicate Signal" value={intakeMode === "review" ? "Strong" : "None"} />
            <Field label="Provider Risk" value={intakeMode === "review" ? "High" : "Low"} />
            <Field label="Missing Docs" value={intakeMode === "clarification" ? "Discharge summary" : "None"} />
            <Field
              wide
              label="Investigation Notes"
              value={
                intakeMode === "clarification"
                  ? "Blurred invoice and missing discharge summary. Clarification expected."
                  : intakeMode === "review"
                    ? "Duplicate similarity and amount threshold breach."
                    : "Clean low-risk path identified."
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={onRunDecision}>Run decision orchestrator</button>
            <button className="btn btn-secondary" onClick={onRunDecision}>Auto-settle</button>
            <button className="btn btn-danger" onClick={onReview}>Flag for review</button>
            <button className="btn btn-ghost" onClick={onClarification}>Clarification loop</button>
          </div>
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Claim Package</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
            Upload invoice, hospital bill, discharge summary, and policy reference. The system flags low-confidence fields before routing.
          </p>
          <div style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surfaceSoft, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>hospital_bill_scan.jpg</div>
            {[["72%", ""], ["54%", ""], ["43%", "border:1px solid rgba(194,77,44,.4);background:rgba(255,100,80,.08)"], ["68%", ""]].map(([w, st], i) => (
              <div
                key={i}
                style={{
                  height: 10,
                  borderRadius: 99,
                  background: C.border,
                  marginBottom: 8,
                  width: w,
                  ...Object.fromEntries(
                    (st || "")
                      .split(";")
                      .filter(Boolean)
                      .map((s) => s.split(":"))
                      .filter((a) => a.length === 2),
                  ),
                }}
              />
            ))}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <Tag label="Low confidence field: invoice total" tone="rose" />
            <Tag label={intakeMode === "clarification" ? "Missing document: discharge summary" : "All required docs present"} tone={intakeMode === "clarification" ? "amber" : "teal"} />
            <Tag label={`Scenario: ${scenarioLabel}`} tone="blue" />
          </div>
        </div>
      </div>
      <ProcessingPanel title="Live Claim Processing" subtitle="We validate every claim step by step so users can see what is verified, what needs attention, and what happens next." summary={progressSummary} steps={steps} spotlight={intakeMode === "clarification" ? "clarification" : intakeMode === "approved" ? "decision" : "fraud"} />
    </section>
  );
}
