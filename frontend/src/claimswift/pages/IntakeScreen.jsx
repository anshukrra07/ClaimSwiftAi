import { useEffect, useState } from "react";
import { C, card } from "../theme";
import { formatInr, formatPercent, riskTone } from "../formatters";
import { getInsurancePalette, getPlaybook } from "../playbooks";
import { ClaimSwitcher, ConfidenceCard, Field, PageHeader, ProcessingPanel, Tag } from "./PagePieces";

const JOURNEY_STEPS = [
  { id: 1, title: "Choose claim type", note: "Pick the kind of claim you want to file." },
  { id: 2, title: "Upload documents", note: "Upload what you have and we will tell you what helps." },
  { id: 3, title: "Confirm details", note: "Check the key details before submitting." },
  { id: 4, title: "We are checking it", note: "A short live processing view keeps the next step visible." },
  { id: 5, title: "Your result", note: "See approval, clarification, or review in one place." },
];

const PROCESSING_STEPS = [
  {
    title: "Reading your documents",
    note: "We are picking out the bill amount, provider, and main claim details.",
  },
  {
    title: "Checking your cover",
    note: "We are matching the claim against the policy and uploaded evidence.",
  },
  {
    title: "Choosing the next step",
    note: "We are deciding if the claim can move ahead, needs one more detail, or should go to a specialist.",
  },
];

const CLAIM_TYPE_META = {
  health: { icon: "🏥", tone: "teal", label: "Health" },
  motor: { icon: "🚗", tone: "blue", label: "Motor" },
  home: { icon: "🏠", tone: "amber", label: "Home" },
  life: { icon: "❤️", tone: "rose", label: "Life" },
};

function toneColors(tone) {
  if (tone === "teal") return { bg: C.tealL, text: C.tealD, soft: "rgba(0,168,150,.12)" };
  if (tone === "amber") return { bg: C.amberL, text: C.amber, soft: "rgba(183,121,31,.12)" };
  if (tone === "blue") return { bg: C.blueL, text: C.blue, soft: "rgba(49,86,211,.12)" };
  return { bg: C.surfaceSoft, text: C.navy, soft: "rgba(15,35,66,.08)" };
}

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
      title: "Looks good to continue",
      note: "The uploaded package looks complete enough to move ahead without extra questions right now.",
    };
  }
  if (analysis.recommendedScenario === "clarification") {
    return {
      tone: "amber",
      title: "We may need one more detail",
      note: analysis.missingDocuments?.length
        ? `Before approval, we may ask for ${analysis.missingDocuments.join(", ")}.`
        : "One part of the document looks unclear, so we may ask a quick follow-up question.",
    };
  }
  return {
    tone: "blue",
    title: "This claim may need a specialist",
    note: "One part of the evidence may need a manual check before payment.",
  };
}

function outcomeForClaim(claim) {
  if (!claim) return null;

  if (claim.status === "approved_for_stp" || claim.status === "settled") {
    return {
      tone: "teal",
      badge: claim.status === "settled" ? "Paid" : "Approved",
      title: claim.status === "settled" ? "Your claim is complete" : "Your claim is approved",
      note:
        claim.status === "settled"
          ? "The payment step is complete and the claim has been closed successfully."
          : "Your documents and claim details look good, so the claim can move ahead without extra paperwork.",
      nextStep:
        claim.status === "settled"
          ? "You can now view the final payment details."
          : "Money is on its way. You can now view the payment amount and what happens next.",
      primaryAction: "View decision",
      highlight:
        claim.status === "settled"
          ? "Payment completed"
          : "Expected in 2 business days",
    };
  }

  if (claim.status === "clarification_required") {
    return {
      tone: "amber",
      badge: "Almost there",
      title: "We just need one small detail",
      note:
        claim.missingDocuments?.length
          ? `Please add or confirm: ${claim.missingDocuments.join(", ")}.`
          : "One important part of your claim could not be read clearly, so we need a quick confirmation.",
      nextStep: "Once you confirm it, the claim continues automatically. You do not need to start over.",
      primaryAction: "Fix claim",
    };
  }

  if (claim.status === "human_review" || claim.status === "verification_queue") {
    return {
      tone: "blue",
      badge: "Under review",
      title: "Your claim is with our team",
      note: "We are taking extra care with this claim, so one of our specialists will review it before the next step.",
      nextStep: "You do not need to do anything right now. The claim is already in the review queue.",
      primaryAction: "View next step",
      highlight: "Usually reviewed within 24 hours",
    };
  }

  return {
    tone: "navy",
    badge: "Received",
    title: "Your claim has been submitted",
    note: "We have received the claim and are working out the next step.",
    nextStep: "You can track the current status from the claim workspace.",
    primaryAction: "View claim",
    highlight: "We will keep you updated",
  };
}

function ClaimTypeCard({ type, active, onSelect }) {
  const playbook = getPlaybook(type);
  const meta = CLAIM_TYPE_META[type] || { icon: "•", tone: getInsurancePalette(type), label: playbook.marketingLabel };
  const accent = {
    teal: C.teal,
    blue: C.blue,
    amber: C.amber,
    navy: C.navy,
    rose: C.rose,
  }[meta.tone] || C.blue;
  const colors = toneColors(meta.tone);

  return (
    <button
      onClick={() => onSelect(type)}
      style={{
        textAlign: "left",
        padding: 20,
        borderRadius: 22,
        border: `1.5px solid ${active ? accent : C.border}`,
        background: active ? colors.bg : C.surface,
        boxShadow: active ? `0 0 0 6px ${accent}1f` : "none",
        transition: "all 180ms ease",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: active ? accent : colors.bg,
          color: active ? "#fff" : colors.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          fontWeight: 800,
          marginBottom: 14,
        }}
      >
        {meta.icon}
      </div>
      <strong style={{ display: "block", fontSize: 15, color: C.text, marginBottom: 8 }}>{meta.label}</strong>
      <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{playbook.claimantSummary}</p>
      {active ? <div style={{ marginTop: 12 }}><Tag label="Great choice" tone="teal" /></div> : null}
    </button>
  );
}

function ProgressHeader({ currentStep }) {
  const progress = ((currentStep - 1) / (JOURNEY_STEPS.length - 1)) * 100;

  return (
    <div style={{ ...card, background: "linear-gradient(135deg,#0f2342,#162540 55%,#1e3356)", color: "#f7fbff", display: "grid", gap: 18, boxShadow: "0 16px 56px rgba(11,24,41,.12)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#90ddd4", marginBottom: 8 }}>
            Step {currentStep} of {JOURNEY_STEPS.length}
          </div>
          <h2 style={{ fontSize: "clamp(1.5rem,2vw,2rem)", fontWeight: 800, lineHeight: 1.1 }}>
            {JOURNEY_STEPS.find((step) => step.id === currentStep)?.title}
          </h2>
          <p style={{ marginTop: 8, fontSize: 13.5, color: "rgba(247,251,255,.68)", maxWidth: 720, lineHeight: 1.65 }}>
            {JOURNEY_STEPS.find((step) => step.id === currentStep)?.note}
          </p>
        </div>
        <Tag label={`${Math.round(progress)}% complete`} tone="teal" />
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
        <div style={{ width: `${progress}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#00a896,#5dd7c7)", transition: "width 300ms ease" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 10 }}>
        {JOURNEY_STEPS.map((step) => {
          const active = currentStep === step.id;
          const done = currentStep > step.id;
          return (
            <div
              key={step.id}
              style={{
                padding: "8px 10px 0",
                borderTop: active ? "2px solid #00b896" : done ? "2px solid rgba(0,184,150,.55)" : "2px solid rgba(255,255,255,.08)",
              }}
            >
              <div style={{ fontSize: 11.5, fontWeight: active || done ? 700 : 500, color: active ? "#fff" : done ? "#90ddd4" : "rgba(247,251,255,.52)" }}>
                {step.id}. {step.title.replace("We are checking it", "Review").replace("Your result", "Done").replace("Choose claim type", "Type").replace("Upload documents", "Upload").replace("Confirm details", "Details")}
                {done ? " ✓" : active ? " →" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UploadChecklistItem({ item, analysis }) {
  const matchedDoc = analysis?.documents?.find((doc) => doc.recognizedAs.toLowerCase() === item.toLowerCase()) || null;
  const suggested = analysis?.missingDocuments?.includes(item.toLowerCase()) || false;
  const state = matchedDoc ? "matched" : suggested ? "suggested" : "neutral";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 9,
          background: state === "matched" ? C.green : state === "suggested" ? C.amberL : C.surfaceSoft,
          color: state === "matched" ? "#fff" : state === "suggested" ? C.amber : C.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {state === "matched" ? "✓" : state === "suggested" ? "?" : "•"}
      </div>
      <div style={{ flex: 1 }}>
        <strong style={{ display: "block", fontSize: 12.5, color: C.text }}>{item}</strong>
        <span style={{ fontSize: 12.5, color: C.muted }}>
          {state === "matched"
            ? `Found in your upload${matchedDoc?.name ? ` · ${matchedDoc.name}` : ""}`
            : state === "suggested"
              ? "Would help us move faster"
              : "Useful if you have it"}
        </span>
      </div>
    </div>
  );
}

function buildTimeline(status) {
  if (status === "settled") {
    return [
      { label: "Submitted", state: "done" },
      { label: "Checked", state: "done" },
      { label: "Approved", state: "done" },
      { label: "Paid", state: "done" },
    ];
  }
  if (status === "approved_for_stp") {
    return [
      { label: "Submitted", state: "done" },
      { label: "Checked", state: "done" },
      { label: "Approved", state: "active" },
      { label: "Paid", state: "wait" },
    ];
  }
  if (status === "clarification_required") {
    return [
      { label: "Submitted", state: "done" },
      { label: "Checked", state: "done" },
      { label: "Need detail", state: "active" },
      { label: "Done", state: "wait" },
    ];
  }
  if (status === "human_review" || status === "verification_queue") {
    return [
      { label: "Submitted", state: "done" },
      { label: "Checked", state: "done" },
      { label: "In review", state: "active" },
      { label: "Done", state: "wait" },
    ];
  }
  return [
    { label: "Submitted", state: "done" },
    { label: "Checking", state: "active" },
    { label: "Next step", state: "wait" },
  ];
}

function StatusTimeline({ status }) {
  const nodes = buildTimeline(status);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      {nodes.map((node, index) => {
        const isDone = node.state === "done";
        const isActive = node.state === "active";
        const bg = isDone ? C.green : isActive ? C.teal : C.surfaceSoft;
        const color = isDone || isActive ? "#fff" : C.muted;
        const border = isDone || isActive ? "none" : `1.5px solid ${C.border}`;
        const connectorDone = isDone || (index < nodes.findIndex((item) => item.state === "active") && nodes.some((item) => item.state === "active"));

        return (
          <div key={node.label} style={{ display: "contents" }}>
            <div key={node.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
              <div
                className={isActive ? "glow-pulse" : undefined}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: bg,
                  color,
                  border,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {isDone ? "✓" : index + 1}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: isActive || isDone ? 700 : 500, color: isActive ? C.navy : isDone ? C.tealD : C.muted, textAlign: "center" }}>
                {node.label}
              </div>
            </div>
            {index < nodes.length - 1 ? (
              <div
                style={{
                  height: 2,
                  flex: 1,
                  minWidth: 24,
                  background: connectorDone ? C.green : C.border,
                  marginBottom: 18,
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
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
  const [draft, setDraft] = useState(buildDraft("health"));
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [submissionPhase, setSubmissionPhase] = useState("idle");
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const draftPlaybook = getPlaybook(draft.insuranceType);
  const activePlaybook = getPlaybook(claim?.insuranceType || draft.insuranceType);
  const analysisSummary = pathSummary(analysis);
  const outcome = outcomeForClaim(submissionResult);

  const activeReviewStep = Math.min(PROCESSING_STEPS.length - 1, Math.floor(submissionProgress * PROCESSING_STEPS.length));

  const reviewClaim = claimOptions.find((item) => item.status === "human_review" || item.status === "verification_queue") || null;
  const approvedClaim = claimOptions.find((item) => item.status === "approved_for_stp" || item.status === "settled") || null;
  const clarificationClaim = claimOptions.find((item) => item.status === "clarification_required") || null;

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

  useEffect(() => {
    if (submissionPhase !== "processing") return undefined;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setSubmissionProgress(Math.min(elapsed / 3000, 1));
    }, 90);
    return () => clearInterval(interval);
  }, [submissionPhase]);

  const handleTypeSelect = (type) => {
    setDraft((current) => ({ ...current, insuranceType: type }));
    setTimeout(() => setCurrentStep(2), 400);
  };

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
      setTimeout(() => setCurrentStep(3), 450);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleSubmitClaim = async () => {
    setSubmissionPhase("processing");
    setSubmissionProgress(0);
    setSubmissionResult(null);
    setCurrentStep(4);

    try {
      const [response] = await Promise.all([
        onCreateClaim({
          ...draft,
          claimAmount: Number(draft.claimAmount),
          policyAgeDays: Number(draft.policyAgeDays),
        }),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);
      setSubmissionResult(response.claim);
      setSubmissionPhase("result");
      setCurrentStep(5);

      if (response.claim.status === "clarification_required") {
        setIntakeMode("clarification");
      } else if (response.claim.status === "human_review" || response.claim.status === "verification_queue") {
        setIntakeMode("review");
      } else {
        setIntakeMode("approved");
      }
    } catch {
      setSubmissionPhase("idle");
      setSubmissionProgress(0);
      setCurrentStep(3);
    }
  };

  const openOutcome = () => {
    if (!submissionResult) return;
    if (submissionResult.status === "clarification_required") {
      onClarification();
      return;
    }
    if (submissionResult.status === "human_review" || submissionResult.status === "verification_queue") {
      onReview();
      return;
    }
    onRunDecision();
  };

  const resetJourney = () => {
    setSubmissionPhase("idle");
    setSubmissionProgress(0);
    setSubmissionResult(null);
    setAnalysis(null);
    setSelectedFiles([]);
    setCurrentStep(1);
  };

  const scenarioLabel =
    claim?.statusLabel ||
    (intakeMode === "approved" ? "Ready for payment" : intakeMode === "review" ? "Under review" : "Needs one more detail");
  const scenarioTone = claim ? riskTone(claim.fraudBand) : intakeMode === "approved" ? "teal" : intakeMode === "review" ? "blue" : "amber";
  const firstLowConfidence = claim?.lowConfidenceFields?.[0];
  const secondLowConfidence = claim?.lowConfidenceFields?.[1];
  const investigationNote = claim?.crossDocumentMismatches?.[0] || claim?.explanationSummary || "No active investigation notes.";

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader
        title="Make claiming feel like a conversation, not a form"
        copy="File the claim in small steps, watch a short live check, and then see one clear outcome in the same place."
      />

      <ProgressHeader currentStep={currentStep} />

      {currentStep === 1 ? (
        <div style={{ ...card, display: "grid", gap: 18 }}>
          <div>
            <Tag label="~10 seconds" tone="teal" />
            <h2 style={{ fontSize: "clamp(1.7rem,2.5vw,2.3rem)", fontWeight: 800, color: C.navy, margin: "14px 0 8px" }}>Pick your claim type</h2>
            <p style={{ fontSize: 14, color: C.muted, maxWidth: 760, lineHeight: 1.7 }}>
              Start with the claim type only. We will show the right checklist and prefill as much as possible from your documents.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 14 }}>
            {["health", "motor", "home", "life"].map((type) => (
              <ClaimTypeCard key={type} type={type} active={draft.insuranceType === type} onSelect={handleTypeSelect} />
            ))}
          </div>
          <div style={{ padding: 18, borderRadius: 20, background: "linear-gradient(135deg,#f4fffc,#eefbf7)", border: `1px solid rgba(0,168,150,.18)`, display: "grid", gap: 6 }}>
            <strong style={{ fontSize: 14, color: C.tealD }}>Your claim is safe with us</strong>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
              We only ask for the details needed for your claim type. Technical fraud and review labels stay in the insurer workspace, not in the claimant flow.
            </p>
          </div>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div style={{ ...card, display: "grid", gap: 18 }}>
          <div>
            <Tag label="~30 seconds" tone="amber" />
            <h2 style={{ fontSize: "clamp(1.7rem,2.5vw,2.3rem)", fontWeight: 800, color: C.navy, margin: "14px 0 8px" }}>Upload what you have</h2>
            <p style={{ fontSize: 14, color: C.muted, maxWidth: 760, lineHeight: 1.7 }}>
              Do not worry about uploading the perfect file pack. Bills, receipts, photos, estimates, or policy proof all help us get started.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(0,.75fr)", gap: 18 }}>
            <div style={{ padding: 24, borderRadius: 24, border: `1.5px dashed ${C.border}`, background: "linear-gradient(135deg,#f8fbff,#eef6fb)", display: "grid", gap: 14, justifyItems: "start" }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, background: C.tealL, color: C.tealD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800 }}>+</div>
              <div>
                <strong style={{ display: "block", fontSize: 16, color: C.text, marginBottom: 6 }}>Upload any documents or photos</strong>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
                  {draftPlaybook.claimantSummary}
                </p>
              </div>
              <input type="file" multiple onChange={(event) => setSelectedFiles(Array.from(event.target.files || []))} style={{ maxWidth: 360 }} />
              <button className="btn btn-teal" disabled={!canCreateClaim || !selectedFiles.length || analysisLoading} onClick={handleAnalyzeDocuments}>
                {analysisLoading ? "Checking your files..." : "Check my documents"}
              </button>
            </div>

            <div style={{ padding: 20, borderRadius: 22, border: `1px solid ${C.border}`, background: C.surface }}>
              <strong style={{ display: "block", fontSize: 14, color: C.text, marginBottom: 12 }}>What helps for this claim</strong>
              <div style={{ display: "grid", gap: 10 }}>
                {draftPlaybook.claimantChecklist.map((item) => (
                  <UploadChecklistItem key={item} item={item} analysis={analysis} />
                ))}
              </div>
            </div>
          </div>

          {selectedFiles.length ? (
            <div style={{ ...card, padding: 18, background: C.surfaceSoft }}>
              <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 10 }}>Files selected</strong>
              <div style={{ display: "grid", gap: 8 }}>
                {selectedFiles.map((file) => (
                  <div key={`${file.name}-${file.lastModified}`} style={{ fontSize: 12.5, color: C.muted }}>
                    • {file.name} ({Math.max(1, Math.round(file.size / 1024))} KB)
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {analysisSummary ? (
            <div style={{ padding: 20, borderRadius: 22, border: `1px solid ${C.border}`, background: analysisSummary.tone === "teal" ? "linear-gradient(135deg,#f4fffc,#eefbf7)" : analysisSummary.tone === "amber" ? "linear-gradient(135deg,#fffdf4,#fff8eb)" : "linear-gradient(135deg,#f5f9ff,#edf4ff)" }}>
              <Tag label={analysisSummary.title} tone={analysisSummary.tone} />
              <p style={{ marginTop: 12, fontSize: 13.5, color: C.muted, lineHeight: 1.65 }}>{analysisSummary.note}</p>
            </div>
          ) : null}

          {analysis?.documents?.length ? (
            <div style={{ ...card, padding: 18, background: C.surface }}>
              <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 12 }}>What we found in your files</strong>
              <div style={{ display: "grid", gap: 10 }}>
                {analysis.documents.map((doc) => (
                  <div key={`${doc.name}-${doc.recognizedAs}`} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "12px 14px", borderRadius: 16, background: C.surfaceSoft, border: `1px solid ${C.border}` }}>
                    <div>
                      <strong style={{ display: "block", fontSize: 12.5, color: C.text }}>{doc.recognizedAs}</strong>
                      <span style={{ fontSize: 12.5, color: C.muted }}>{doc.name}</span>
                    </div>
                    <Tag label="Read successfully" tone="green" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div style={{ ...card, display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <Tag label="~60 seconds" tone="teal" />
              <h2 style={{ fontSize: "clamp(1.7rem,2.5vw,2.3rem)", fontWeight: 800, color: C.navy, margin: "14px 0 8px" }}>Confirm 3 quick details</h2>
              <p style={{ fontSize: 14, color: C.muted, maxWidth: 760, lineHeight: 1.7 }}>
                We prefill what we can. You only need to check the few details that matter before submission.
              </p>
            </div>
            <button className="btn btn-ghost" onClick={() => setShowAdvanced((current) => !current)}>
              {showAdvanced ? "Hide advanced options" : "Show advanced demo options"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Your name</span>
              <input value={draft.claimantName} onChange={(event) => setDraft((current) => ({ ...current, claimantName: event.target.value }))} style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.greenL }} />
              <span style={{ fontSize: 11.5, color: C.green }}>✓ Read from your account</span>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Total amount on your bill</span>
              <input value={draft.claimAmount} onChange={(event) => setDraft((current) => ({ ...current, claimAmount: event.target.value.replace(/[^\d]/g, "") }))} style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${C.border}`, background: analysis ? C.greenL : C.surface }} />
              <span style={{ fontSize: 11.5, color: analysis ? C.green : C.amber }}>{analysis ? "✓ Read from your document" : "Please confirm"}</span>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Hospital / garage / provider</span>
              <input value={draft.providerName} onChange={(event) => setDraft((current) => ({ ...current, providerName: event.target.value }))} style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${C.border}`, background: analysis ? C.greenL : C.surface }} />
              <span style={{ fontSize: 11.5, color: analysis ? C.green : C.amber }}>{analysis ? "✓ Read from your document" : "Please confirm"}</span>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>Policy number</span>
              <input value={draft.policyNumber} onChange={(event) => setDraft((current) => ({ ...current, policyNumber: event.target.value }))} style={{ padding: "12px 14px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.greenL }} />
              <span style={{ fontSize: 11.5, color: C.green }}>✓ Kept from your policy details</span>
            </label>
          </div>

          {showAdvanced ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 12, padding: 16, borderRadius: 18, border: `1px solid ${C.border}`, background: C.surfaceSoft }}>
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

          <div style={{ padding: 20, borderRadius: 22, background: "linear-gradient(135deg,#0f2342,#1a2a4d)", color: "#f7fbff", display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <strong style={{ display: "block", fontSize: 16, marginBottom: 6 }}>Ready to submit</strong>
              <p style={{ fontSize: 13, color: "rgba(247,251,255,.72)", maxWidth: 620, lineHeight: 1.65 }}>
                We will tell you exactly what happens next after submission.
              </p>
            </div>
            <button className="btn btn-teal" disabled={!canCreateClaim || submissionPhase === "processing"} onClick={handleSubmitClaim}>
              {canCreateClaim ? "Submit claim" : "Read-only role"}
            </button>
          </div>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div style={{ ...card, background: "linear-gradient(135deg,#112241,#1b315b)", color: "#f6fbff", display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <Tag label="Checking your claim" tone="blue" />
              <h2 style={{ fontSize: "clamp(1.8rem,2.7vw,2.5rem)", fontWeight: 900, margin: "14px 0 8px" }}>Watch it process</h2>
              <p style={{ fontSize: 14, color: "rgba(246,251,255,.78)", maxWidth: 720, lineHeight: 1.7 }}>
                We are keeping the next step visible while we read the documents, check the cover, and choose the outcome.
              </p>
            </div>
            <div style={{ minWidth: 140, textAlign: "right" }}>
              <div style={{ fontSize: 36, fontWeight: 900 }}>{Math.round(submissionProgress * 100)}%</div>
              <div style={{ fontSize: 12.5, color: "rgba(246,251,255,.68)" }}>Processing</div>
            </div>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,.12)", overflow: "hidden" }}>
            <div style={{ width: `${Math.round(submissionProgress * 100)}%`, height: "100%", background: "linear-gradient(90deg,#00a896,#62d5c5)" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
            {PROCESSING_STEPS.map((step, index) => {
              const state = index < activeReviewStep ? "done" : index === activeReviewStep ? "active" : "pending";
              return (
                <div key={step.title} style={{ padding: 18, borderRadius: 20, border: "1px solid rgba(255,255,255,.1)", background: state === "active" ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.04)" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: state === "done" ? C.teal : state === "active" ? C.blue : "rgba(255,255,255,.12)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, marginBottom: 12 }}>
                    {state === "done" ? "✓" : state === "active" ? "→" : index + 1}
                  </div>
                  <strong style={{ display: "block", fontSize: 14, marginBottom: 8 }}>{step.title}</strong>
                  <p style={{ fontSize: 12.5, color: "rgba(246,251,255,.72)", lineHeight: 1.6 }}>{step.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {currentStep === 5 && outcome ? (
        <div style={{ ...card, display: "grid", gap: 18, borderColor: outcome.tone === "teal" ? "rgba(0,168,150,.24)" : outcome.tone === "amber" ? "rgba(183,121,31,.24)" : outcome.tone === "blue" ? "rgba(49,86,211,.24)" : "rgba(15,35,66,.18)", background: outcome.tone === "teal" ? "linear-gradient(135deg,#f4fffc,#eefbf7)" : outcome.tone === "amber" ? "linear-gradient(135deg,#fffdf4,#fff8eb)" : outcome.tone === "blue" ? "linear-gradient(135deg,#f5f9ff,#edf4ff)" : "linear-gradient(135deg,#f8fbff,#eef4fd)" }}>
          {outcome.tone === "teal" ? (
            <div style={{ position: "relative", height: 0 }}>
              {[12, 24, 37, 49, 61, 73, 84].map((left, index) => (
                <span
                  key={left}
                  style={{
                    position: "absolute",
                    left: `${left}%`,
                    top: index % 2 === 0 ? -6 : 8,
                    width: 10,
                    height: 18,
                    borderRadius: 999,
                    background: index % 3 === 0 ? "#00a896" : index % 3 === 1 ? "#5dd7c7" : "#f59e0b",
                    opacity: 0,
                    animation: `confettiFloat 1.9s ease ${index * 110}ms infinite`,
                  }}
                />
              ))}
            </div>
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <Tag label={outcome.badge} tone={outcome.tone} />
              <h2 style={{ fontSize: "clamp(1.9rem,3vw,2.8rem)", fontWeight: 900, color: C.navy, margin: "16px 0 8px" }}>{outcome.title}</h2>
              <p style={{ fontSize: 14, color: C.muted, maxWidth: 720, lineHeight: 1.7 }}>{outcome.note}</p>
            </div>
            <div
              className={outcome.tone === "teal" ? "glow-pulse" : undefined}
              style={{
                minWidth: outcome.tone === "teal" ? 260 : 220,
                textAlign: "center",
                padding: outcome.tone === "teal" ? 24 : 18,
                borderRadius: 24,
                background: C.surface,
                border: `1px solid ${C.border}`,
              }}
            >
              <div className={outcome.tone === "teal" ? "celebrate-bounce" : undefined} style={{ fontSize: outcome.tone === "teal" ? 56 : 44, marginBottom: 8 }}>
                {outcome.tone === "teal" ? "🎉" : outcome.tone === "amber" ? "🙂" : "🛡️"}
              </div>
              <strong style={{ display: "block", fontSize: outcome.tone === "teal" ? 32 : 24, color: outcome.tone === "teal" ? C.teal : outcome.tone === "amber" ? C.amber : C.blue, lineHeight: 1 }}>
                {formatInr(submissionResult?.claimAmount || 0)}
              </strong>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8 }}>
                {outcome.tone === "teal" ? "Approved amount" : "Claim amount received"}
              </div>
              {outcome.highlight ? (
                <div
                  style={{
                    marginTop: 12,
                    display: "inline-flex",
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: outcome.tone === "teal" ? C.tealL : outcome.tone === "amber" ? C.amberL : C.blueL,
                    color: outcome.tone === "teal" ? C.tealD : outcome.tone === "amber" ? C.amber : C.blue,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {outcome.highlight}
                </div>
              ) : null}
            </div>
          </div>

          {outcome.tone === "teal" ? (
            <div
              style={{
                padding: 20,
                borderRadius: 22,
                background: "linear-gradient(135deg,#0f2342,#17345a)",
                color: "#f7fbff",
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) auto",
                gap: 16,
                alignItems: "center",
              }}
            >
              <div>
                <strong style={{ display: "block", fontSize: 18, marginBottom: 6 }}>Money on its way</strong>
                <p style={{ fontSize: 13.5, color: "rgba(247,251,255,.72)", lineHeight: 1.65, maxWidth: 700 }}>
                  Your claim cleared the checks and the payout amount is ready. This is the celebration moment users should remember.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#9edbd2", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>
                  Next update
                </div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Within 2 business days</div>
              </div>
            </div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 14 }}>
            <div style={{ padding: 18, borderRadius: 18, border: `1px solid ${C.border}`, background: C.surface }}>
              <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 10 }}>Claim receipt</strong>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 12.5, color: C.muted }}>Claim ID: {submissionResult.id}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>Current status: {submissionResult.statusLabel}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>
                  Files still needed: {submissionResult.missingDocuments?.length ? submissionResult.missingDocuments.join(", ") : "None right now"}
                </div>
              </div>
            </div>
            <div style={{ padding: 18, borderRadius: 18, border: `1px solid ${C.border}`, background: C.surface }}>
              <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 10 }}>What happens next</strong>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontSize: 12.5, color: C.muted }}>{outcome.nextStep}</div>
                {submissionResult.lowConfidenceFields?.length ? (
                  <div style={{ fontSize: 12.5, color: C.muted }}>
                    We may ask you to confirm: {submissionResult.lowConfidenceFields.map((field) => field.field.replace("_", " ")).join(", ")}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div style={{ padding: 18, borderRadius: 20, border: `1px solid ${C.border}`, background: C.surface }}>
            <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 14 }}>Your claim journey</strong>
            <StatusTimeline status={submissionResult.status} />
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={openOutcome}>{outcome.primaryAction}</button>
            <button className="btn btn-ghost" onClick={resetJourney}>Start another claim</button>
          </div>
        </div>
      ) : null}

      <div style={{ ...card, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div>
            <strong style={{ display: "block", fontSize: 15, color: C.text, marginBottom: 6 }}>Sample journeys already in the workspace</strong>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>
              Use these to show the full product after the claimant flow finishes.
            </p>
          </div>
          <Tag label={scenarioLabel} tone={scenarioTone} />
        </div>

        <ClaimSwitcher
          title="Open a sample outcome"
          claims={claimOptions}
          activeId={claim?.id}
          onSelect={onSelectClaim}
          tone={getInsurancePalette(claim?.insuranceType)}
          subtitle="Switch between approval, clarification, and review examples"
        />

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,.85fr)", gap: 18 }}>
          <div style={card}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 18 }}>
              <Field label="Claim ID" value={claim?.id || "No claim selected"} />
              <Field label="Claim Amount" value={claim ? formatInr(claim.claimAmount) : "—"} />
              <ConfidenceCard title="Decision confidence" value={claim ? formatInr(claim.claimAmount) : "—"} score={claim ? formatPercent(Math.max(82, 100 - claim.fraudScore)) : "—"} tone={claim?.fraudBand === "high" ? "risk" : "good"} subtitle={claim?.fraudBand === "high" ? "May need extra care" : "Looks suitable for a quick decision"} />
              <ConfidenceCard title={firstLowConfidence?.field ? firstLowConfidence.field.replace("_", " ") : "Document clarity"} value={firstLowConfidence?.value || "Main details look readable"} score={firstLowConfidence ? formatPercent(firstLowConfidence.confidence) : "91%"} tone={firstLowConfidence ? "risk" : "good"} subtitle={firstLowConfidence ? "One field needs confirmation" : "No obvious clarity issue"} />
              <ConfidenceCard title={secondLowConfidence?.field ? secondLowConfidence.field.replace("_", " ") : "Current path"} value={secondLowConfidence?.value || claim?.fraudBand?.toUpperCase() || "LOW"} score={secondLowConfidence ? formatPercent(secondLowConfidence.confidence) : formatPercent(claim?.fraudScore || 0)} tone={secondLowConfidence ? "warn" : claim?.fraudBand === "high" ? "risk" : "warn"} subtitle={secondLowConfidence ? "Still being checked" : "Current review score"} />
              <Field label="Deductible" value={claim ? formatInr(claim.deductibleApplied || 0) : "—"} />
              <Field label="File confidence" value={claim?.lowConfidenceFields?.length ? formatPercent(claim.lowConfidenceFields[0].confidence) : "91%"} />
              <Field label="Similarity check" value={claim ? `${Math.round((claim.duplicateSimilarity || 0) * 100)}% match` : "—"} />
              <Field label="Provider risk" value={claim?.providerRiskLevel ? claim.providerRiskLevel.toUpperCase() : "—"} />
              <Field label="Missing documents" value={claim?.missingDocuments?.length ? claim.missingDocuments.join(", ") : "None"} />
              <Field wide label="Notes" value={investigationNote} />
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn btn-primary" onClick={onRunDecision} disabled={!approvedClaim}>Open payment path</button>
              <button className="btn btn-secondary" onClick={onClarification} disabled={!canClarifyClaim || !clarificationClaim}>Open clarification path</button>
              <button className="btn btn-secondary" onClick={onReview} disabled={!canRouteReview || !reviewClaim}>Open review path</button>
            </div>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>What we look for</h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>{activePlaybook.evidenceDescription}</p>
            <div style={{ display: "grid", gap: 8, marginBottom: 14 }}>
              {activePlaybook.claimantChecklist.map((item) => (
                <div key={item} style={{ fontSize: 12.5, color: C.muted }}>• {item}</div>
              ))}
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <Tag label={firstLowConfidence ? `We may ask about ${firstLowConfidence.field.replace("_", " ")}` : "Main details look verified"} tone={firstLowConfidence ? "amber" : "teal"} />
              <Tag label={claim?.missingDocuments?.length ? `Still needed: ${claim.missingDocuments.join(", ")}` : "No missing document right now"} tone={claim?.missingDocuments?.length ? "amber" : "teal"} />
              <Tag label={`Current path: ${scenarioLabel}`} tone={scenarioTone} />
            </div>
          </div>
        </div>
      </div>

      <ProcessingPanel
        title="Behind the scenes"
        subtitle="This is the back-office processing view used for the demo after a claim is filed."
        summary={progressSummary}
        steps={steps}
        spotlight={intakeMode === "clarification" ? "clarification" : intakeMode === "approved" ? "decision" : "fraud"}
      />
    </section>
  );
}
