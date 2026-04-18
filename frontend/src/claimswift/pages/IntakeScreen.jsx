import { useEffect, useMemo, useState } from "react";
import { C, card } from "../theme";
import { formatInr, formatPercent, riskTone } from "../formatters";
import { getInsurancePalette, getPlaybook } from "../playbooks";
import { ClaimSwitcher, ConfidenceCard, Field, PageHeader, ProcessingPanel, Tag } from "./PagePieces";

function buildDraft(type) {
  const playbook = getPlaybook(type);
  return {
    insuranceType: type,
    scenario: "clean",
    claimantName: "Demo Claimant",
    providerName: playbook.sampleProvider,
    city: playbook.sampleCity,
    procedure: playbook.sampleProcedure,
    claimAmount: type === "life" ? "150000" : type === "home" ? "64000" : type === "motor" ? "18200" : "22000",
    policyNumber: `POL-${type.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    policyAgeDays: type === "home" ? "36" : "120",
  };
}

function pathSummary(analysis) {
  if (!analysis) return null;
  if (analysis.recommendedScenario === "clean") {
    return {
      tone: "teal",
      title: "Looks good to submit",
      note: "The uploaded package looks complete enough to continue without extra questions.",
    };
  }
  if (analysis.recommendedScenario === "clarification") {
    return {
      tone: "amber",
      title: "We may need one more detail",
      note: analysis.missingDocuments?.length
        ? `Before final approval, we may ask for ${analysis.missingDocuments.join(", ")}.`
        : "One field looks unclear, so we may ask for a quick confirmation after submission.",
    };
  }
  return {
    tone: "rose",
    title: "This claim may need manual review",
    note: "The uploaded evidence shows a pattern that may need a reviewer before payment.",
  };
}

function StepPill({ number, title, note, active, done }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 18,
        border: `1px solid ${active ? "rgba(49,86,211,.28)" : C.border}`,
        background: active ? C.blueL : C.surface,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: done ? C.teal : active ? C.blue : C.surfaceSoft,
            color: done || active ? "#fff" : C.muted,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {done ? "✓" : number}
        </div>
        <strong style={{ fontSize: 14, color: C.text }}>{title}</strong>
      </div>
      <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>{note}</p>
    </div>
  );
}

function InsuranceCard({ type, active, onSelect }) {
  const playbook = getPlaybook(type);
  const tone = getInsurancePalette(type);
  const accent = {
    teal: C.teal,
    blue: C.blue,
    amber: C.amber,
    navy: C.navy,
  }[tone] || C.blue;

  return (
    <button
      onClick={() => onSelect(type)}
      style={{
        textAlign: "left",
        borderRadius: 18,
        border: `1px solid ${active ? accent : C.border}`,
        background: active ? C.surface : C.surfaceSoft,
        padding: 16,
        cursor: "pointer",
      }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 14, background: active ? accent : "#e9eef6", color: active ? "#fff" : C.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
        {playbook.marketingLabel.split(" ")[0][0]}
      </div>
      <strong style={{ display: "block", fontSize: 14, color: C.text, marginBottom: 6 }}>{playbook.marketingLabel}</strong>
      <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55 }}>{playbook.claimantSummary}</p>
    </button>
  );
}

export default function IntakeScreen({
  claim,
  claimOptions,
  onSelectClaim,
  intakeMode,
  setIntakeMode,
  onRunDecision,
  onClarification,
  onReview,
  onAnalyzeIntake,
  onCreateClaim,
  steps,
  progressSummary,
  canCreateClaim,
  canClarifyClaim,
  canRouteReview,
}) {
  const scenarioLabel =
    claim?.statusLabel ||
    (intakeMode === "approved" ? "Ready for payment" : intakeMode === "review" ? "Needs review" : "Needs clarification");
  const scenarioTone = claim ? riskTone(claim.fraudBand) : intakeMode === "approved" ? "teal" : intakeMode === "review" ? "rose" : "amber";
  const firstLowConfidence = claim?.lowConfidenceFields?.[0];
  const secondLowConfidence = claim?.lowConfidenceFields?.[1];
  const investigationNote = claim?.crossDocumentMismatches?.[0] || claim?.explanationSummary || "No active investigation notes.";
  const [draft, setDraft] = useState(buildDraft("health"));
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const draftPlaybook = getPlaybook(draft.insuranceType);
  const activePlaybook = getPlaybook(claim?.insuranceType || draft.insuranceType);
  const analysisSummary = pathSummary(analysis);

  const completedSteps = useMemo(() => {
    let count = 1;
    if (selectedFiles.length) count += 1;
    if (draft.claimantName && draft.claimAmount && draft.policyNumber) count += 1;
    return Math.min(count, 3);
  }, [draft.claimAmount, draft.claimantName, draft.policyNumber, selectedFiles.length]);

  useEffect(() => {
    const next = buildDraft(draft.insuranceType);
    setDraft((current) => ({
      ...next,
      scenario: current.scenario,
      claimantName: current.claimantName === "Demo Claimant" ? next.claimantName : current.claimantName,
      policyNumber: current.policyNumber || next.policyNumber,
    }));
  }, [draft.insuranceType]);

  useEffect(() => {
    setAnalysis(null);
    setSelectedFiles([]);
  }, [draft.insuranceType]);

  const handleAnalyzeDocuments = async () => {
    setAnalysisLoading(true);
    try {
      const result = await onAnalyzeIntake({
        insuranceType: draft.insuranceType,
        documents: selectedFiles.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        })),
      });
      setAnalysis(result.analysis);
      setDraft((current) => ({
        ...current,
        ...result.analysis.extractedDraft,
        claimAmount: String(result.analysis.extractedDraft.claimAmount),
        policyAgeDays: String(result.analysis.extractedDraft.policyAgeDays),
      }));
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader
        title="File a Claim in 3 Simple Steps"
        copy="Choose the claim type, upload the documents you already have, then confirm the key details. If something is missing, we ask only for that one missing piece."
      />

      <ClaimSwitcher
        title="Try sample claim journeys"
        claims={claimOptions}
        activeId={claim?.id}
        onSelect={onSelectClaim}
        tone={getInsurancePalette(claim?.insuranceType)}
        subtitle="Open a sample claim to see how clarification, approval, and review work"
      />

      <div style={{ ...card, background: "linear-gradient(135deg,#f8fbff,#eef4fd)", display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <strong style={{ display: "block", fontSize: 18, color: C.navy, marginBottom: 6 }}>A guided claim experience</strong>
            <p style={{ fontSize: 13.5, color: C.muted, maxWidth: 760, lineHeight: 1.65 }}>
              We keep the form short, explain what to upload, and show what happens next in plain language.
            </p>
          </div>
          <Tag label={`${completedSteps}/3 steps ready`} tone="blue" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
          <StepPill number="1" title="Choose claim type" note="Pick the insurance line that matches your incident." active done />
          <StepPill number="2" title="Upload your documents" note="Bills, photos, estimates, or policy proof. We will read what we can." active={selectedFiles.length > 0} done={selectedFiles.length > 0} />
          <StepPill number="3" title="Confirm key details" note="We prefill the basics and keep only a few fields for you to check." active={Boolean(draft.claimantName && draft.claimAmount)} done={Boolean(draft.claimantName && draft.claimAmount && draft.policyNumber)} />
        </div>
      </div>

      <div style={{ ...card, display: "grid", gap: 16 }}>
        <div>
          <strong style={{ display: "block", fontSize: 16, color: C.text, marginBottom: 4 }}>Step 1: Choose the type of claim</strong>
          <p style={{ fontSize: 13, color: C.muted }}>Pick the option closest to your claim. We will show the right document checklist automatically.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12 }}>
          {["health", "motor", "home", "life"].map((type) => (
            <InsuranceCard
              key={type}
              type={type}
              active={draft.insuranceType === type}
              onSelect={(nextType) => setDraft((current) => ({ ...current, insuranceType: nextType }))}
            />
          ))}
        </div>
        <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surfaceSoft }}>
          <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 10 }}>Keep these ready</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
            {draftPlaybook.claimantChecklist.map((item) => (
              <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13, color: C.muted }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.tealL, color: C.tealD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...card, display: "grid", gap: 16 }}>
        <div>
          <strong style={{ display: "block", fontSize: 16, color: C.text, marginBottom: 4 }}>Step 2: Upload the documents you already have</strong>
          <p style={{ fontSize: 13, color: C.muted }}>
            You do not need a perfect document pack. Upload what you have now and we will tell you if anything is still needed.
          </p>
        </div>

        <div style={{ display: "grid", gap: 12, padding: 16, borderRadius: 18, border: `1px solid ${C.border}`, background: C.surfaceSoft }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 4 }}>Smart document check</strong>
              <p style={{ fontSize: 12.5, color: C.muted }}>
                Upload files and we will suggest whether the claim can move ahead directly, may need one quick clarification, or should be reviewed.
              </p>
            </div>
            {analysisSummary ? <Tag label={analysisSummary.title} tone={analysisSummary.tone} /> : <Tag label="Upload files to get a quick check" tone="navy" />}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <input type="file" multiple onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))} style={{ maxWidth: 360 }} />
            <button className="btn btn-secondary" onClick={handleAnalyzeDocuments} disabled={!canCreateClaim || !selectedFiles.length || analysisLoading}>
              {analysisLoading ? "Checking files..." : "Check my documents"}
            </button>
          </div>

          {selectedFiles.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {selectedFiles.map((file) => (
                <div key={`${file.name}-${file.lastModified}`} style={{ fontSize: 12.5, color: C.muted }}>
                  • {file.name} ({Math.max(1, Math.round(file.size / 1024))} KB)
                </div>
              ))}
            </div>
          ) : null}

          {analysis ? (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
              <div style={{ padding: 14, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}>
                <strong style={{ display: "block", fontSize: 12.5, marginBottom: 8 }}>What we found</strong>
                <div style={{ fontSize: 12.5, color: C.muted, padding: "4px 0" }}>Confidence: {analysis.confidence}%</div>
                <div style={{ fontSize: 12.5, color: C.muted, padding: "4px 0" }}>Next step: {analysisSummary?.note}</div>
                <div style={{ fontSize: 12.5, color: C.muted, padding: "4px 0" }}>
                  Missing documents: {analysis.missingDocuments.length ? analysis.missingDocuments.join(", ") : "None right now"}
                </div>
              </div>
              <div style={{ padding: 14, borderRadius: 14, background: C.surface, border: `1px solid ${C.border}` }}>
                <strong style={{ display: "block", fontSize: 12.5, marginBottom: 8 }}>Matched documents</strong>
                {analysis.documents.map((doc) => (
                  <div key={doc.name} style={{ fontSize: 12.5, color: C.muted, padding: "4px 0" }}>
                    • {doc.name} → {doc.recognizedAs}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ ...card, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <strong style={{ display: "block", fontSize: 16, color: C.text, marginBottom: 4 }}>Step 3: Confirm the key details</strong>
            <p style={{ fontSize: 13, color: C.muted }}>
              We keep only the main fields here. Advanced demo options stay tucked away unless you need them.
            </p>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => setShowAdvanced((current) => !current)}
            style={{ paddingInline: 14 }}
          >
            {showAdvanced ? "Hide advanced options" : "Show advanced demo options"}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Your name</span>
            <input value={draft.claimantName} onChange={(event) => setDraft((current) => ({ ...current, claimantName: event.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Claim amount</span>
            <input value={draft.claimAmount} onChange={(event) => setDraft((current) => ({ ...current, claimAmount: event.target.value.replace(/[^\d]/g, "") }))} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Hospital / garage / provider</span>
            <input value={draft.providerName} onChange={(event) => setDraft((current) => ({ ...current, providerName: event.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }} />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Policy number</span>
            <input value={draft.policyNumber} onChange={(event) => setDraft((current) => ({ ...current, policyNumber: event.target.value }))} style={{ padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }} />
          </label>
        </div>

        {showAdvanced ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, padding: 16, borderRadius: 16, background: C.surfaceSoft, border: `1px solid ${C.border}` }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Scenario</span>
              <select value={draft.scenario} onChange={(event) => setDraft((current) => ({ ...current, scenario: event.target.value }))} style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }}>
                <option value="clean">Clean path</option>
                <option value="clarification">Clarification path</option>
                <option value="review">Review path</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>City</span>
              <input value={draft.city} onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))} style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Treatment / repair type</span>
              <input value={draft.procedure} onChange={(event) => setDraft((current) => ({ ...current, procedure: event.target.value }))} style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Policy age (days)</span>
              <input value={draft.policyAgeDays} onChange={(event) => setDraft((current) => ({ ...current, policyAgeDays: event.target.value.replace(/[^\d]/g, "") }))} style={{ padding: "10px 12px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.surface }} />
            </label>
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", padding: 16, borderRadius: 16, background: "linear-gradient(135deg,#0f2342,#1a2a4d)", color: "#f7fbff" }}>
          <div>
            <strong style={{ display: "block", fontSize: 15, marginBottom: 5 }}>Ready to submit</strong>
            <p style={{ fontSize: 12.5, color: "rgba(244,247,251,.76)", maxWidth: 620, lineHeight: 1.6 }}>
              {draftPlaybook.claimantSummary}
            </p>
          </div>
          <button className="btn btn-teal" disabled={!canCreateClaim} onClick={() => onCreateClaim({ ...draft, claimAmount: Number(draft.claimAmount), policyAgeDays: Number(draft.policyAgeDays) })}>
            {canCreateClaim ? "Submit claim" : "Read-only role"}
          </button>
        </div>
      </div>

      <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap" }}>
        <div>
          <strong style={{ display: "block", fontSize: 14, marginBottom: 4 }}>See other sample outcomes</strong>
          <p style={{ fontSize: 13, color: C.muted }}>Switch the demo between a smooth claim, a quick clarification, and a manual review journey.</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            ["clarification", "Needs one more detail"],
            ["approved", "Smooth approval"],
            ["review", "Manual review"],
          ].map(([id, label]) => (
            <button key={id} className={`mode-chip ${intakeMode === id ? "active" : ""}`} onClick={() => setIntakeMode(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,.8fr)", gap: 18 }}>
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <strong style={{ fontSize: 15 }}>What we understand from this claim</strong>
            <Tag label={scenarioLabel} tone={scenarioTone} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 18 }}>
            <Field label="Claim ID" value={claim?.id || "Will be created after submission"} />
            <Field label="Claim Amount" value={claim ? formatInr(claim.claimAmount) : formatInr(Number(draft.claimAmount || 0))} />
            <ConfidenceCard title="Amount check" value={claim ? formatInr(claim.claimAmount) : formatInr(Number(draft.claimAmount || 0))} score={claim ? formatPercent(Math.max(82, 100 - claim.fraudScore)) : "91%"} tone={claim?.fraudBand === "high" ? "risk" : "good"} subtitle={claim?.fraudBand === "high" ? "May need review" : "Looks suitable for a quick decision"} />
            <ConfidenceCard title={firstLowConfidence?.field ? firstLowConfidence.field.replace("_", " ") : "Document clarity"} value={firstLowConfidence?.value || "Main details look readable"} score={firstLowConfidence ? formatPercent(firstLowConfidence.confidence) : "91%"} tone={firstLowConfidence ? "risk" : "good"} subtitle={firstLowConfidence ? "We may ask one follow-up question" : "No obvious clarity issue"} />
            <ConfidenceCard title={secondLowConfidence?.field ? secondLowConfidence.field.replace("_", " ") : "Risk level"} value={secondLowConfidence?.value || claim?.fraudBand?.toUpperCase() || "LOW"} score={secondLowConfidence ? formatPercent(secondLowConfidence.confidence) : formatPercent(claim?.fraudScore || 0)} tone={secondLowConfidence ? "warn" : claim?.fraudBand === "high" ? "risk" : "warn"} subtitle={secondLowConfidence ? "One field still needs checking" : "Current claim review score"} />
            <Field label="Deductible" value={claim ? formatInr(claim.deductibleApplied || 0) : "Applied after policy check"} />
            <Field label="File confidence" value={claim?.lowConfidenceFields?.length ? formatPercent(claim.lowConfidenceFields[0].confidence) : analysis ? `${analysis.confidence}%` : "Will appear after file check"} />
            <Field label="Similarity check" value={claim ? `${Math.round((claim.duplicateSimilarity || 0) * 100)}% match` : "Runs after submission"} />
            <Field label="Provider risk" value={claim?.providerRiskLevel ? claim.providerRiskLevel.toUpperCase() : "Checked automatically"} />
            <Field label="Missing documents" value={claim?.missingDocuments?.length ? claim.missingDocuments.join(", ") : analysis?.missingDocuments?.length ? analysis.missingDocuments.join(", ") : "None detected right now"} />
            <Field wide label="Notes" value={investigationNote} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={onRunDecision}>See decision flow</button>
            <button className="btn btn-secondary" onClick={onRunDecision}>See payment path</button>
            <button className="btn btn-danger" onClick={onReview} disabled={!canRouteReview}>Open reviewer path</button>
            <button className="btn btn-ghost" onClick={onClarification} disabled={!canClarifyClaim}>Open clarification path</button>
          </div>
        </div>

        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Your document pack</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>{activePlaybook.evidenceDescription}</p>
          <div style={{ padding: 14, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surfaceSoft, marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{claim ? activePlaybook.evidenceTitle : "Expected documents"}</div>
            {activePlaybook.requiredDocuments.map((item, index) => (
              <div key={item} style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12.5, color: C.muted, padding: "7px 0", borderBottom: index < activePlaybook.requiredDocuments.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <span>{item}</span>
                <span>{analysis?.missingDocuments?.includes(item.toLowerCase()) || claim?.missingDocuments?.includes(item.toLowerCase()) ? "Needed" : "Good"}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            <Tag label={firstLowConfidence ? `We may need to confirm ${firstLowConfidence.field.replace("_", " ")}` : "Main details look verified"} tone={firstLowConfidence ? "rose" : "teal"} />
            <Tag label={claim?.missingDocuments?.length ? `Still needed: ${claim.missingDocuments.join(", ")}` : analysis?.missingDocuments?.length ? `May still need: ${analysis.missingDocuments.join(", ")}` : "No missing document detected"} tone={claim?.missingDocuments?.length || analysis?.missingDocuments?.length ? "amber" : "teal"} />
            <Tag label={`Current path: ${scenarioLabel}`} tone="blue" />
          </div>
        </div>
      </div>

      <ProcessingPanel
        title="What happens after you submit"
        subtitle="We check the documents step by step, ask for clarification only if needed, and keep the next step visible."
        summary={progressSummary}
        steps={steps}
        spotlight={intakeMode === "clarification" ? "clarification" : intakeMode === "approved" ? "decision" : "fraud"}
      />
    </section>
  );
}
