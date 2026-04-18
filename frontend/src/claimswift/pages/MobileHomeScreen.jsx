import { C } from "../theme";
import { getPlaybook } from "../playbooks";
import { MobileFrame, Tag } from "./PagePieces";

export default function MobileHomeScreen({ claims, dashboard }) {
  const latestClarification = claims?.find((claim) => claim.status === "clarification_required");
  const latestApproved = claims?.find((claim) => claim.status === "approved_for_stp" || claim.status === "settled");
  const types = ["health", "motor", "home", "life"];
  const activeClaim = latestClarification || latestApproved || claims?.[0] || null;

  const statusCopy = latestClarification
    ? {
        tone: "amber",
        label: "Action needed",
        title: "We need one small detail to continue your claim",
        note: `${latestClarification.id} is waiting for your confirmation.`,
      }
    : latestApproved
      ? {
          tone: latestApproved.status === "settled" ? "teal" : "blue",
          label: latestApproved.status === "settled" ? "Payment sent" : "Almost done",
          title: latestApproved.status === "settled" ? "Your claim has been settled" : "Your claim is approved and moving to payment",
          note: `${latestApproved.id} is in the final stage.`,
        }
      : {
          tone: "blue",
          label: "Start here",
          title: "File your claim in 3 simple steps",
          note: "Upload your documents, confirm the key details, and track the result.",
        };

  return (
    <MobileFrame>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: C.navy }}>ClaimSwift AI</h1>
      <p style={{ fontSize: 14, color: C.muted }}>Submit your claim, fix missing details if needed, and follow the status without insurance jargon.</p>
      <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface }}>
        <div style={{ marginBottom: 8 }}>
          <Tag label={statusCopy.label} tone={statusCopy.tone} />
        </div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: C.text }}>{statusCopy.title}</h3>
        <p style={{ fontSize: 13, color: C.muted }}>{statusCopy.note}</p>
      </div>
      <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: C.text }}>How this works</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            ["1", "Upload your documents", "Share clear photos or PDFs of the bill, estimate, or policy papers."],
            ["2", "Confirm anything unclear", "If one detail is unreadable, we ask only for that detail instead of rejecting the whole claim."],
            ["3", "Track the result", "You will see whether the claim is being checked, needs review, or is ready for payment."],
          ].map(([step, title, note]) => (
            <div key={step} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr)", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.blueL, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{step}</div>
              <div>
                <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 4 }}>{title}</strong>
                <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {activeClaim ? (
        <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: C.text }}>Current claim status</h3>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 10 }}>
            {activeClaim.id} · {activeClaim.insuranceLabel}
          </p>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12.5, color: C.muted }}>Submitted amount: {activeClaim.claimAmount?.toLocaleString?.("en-IN") ? `INR ${activeClaim.claimAmount.toLocaleString("en-IN")}` : "—"}</div>
            <div style={{ fontSize: 12.5, color: C.muted }}>Current step: {activeClaim.statusLabel}</div>
            <div style={{ fontSize: 12.5, color: C.muted }}>
              {latestClarification ? "Next step: confirm the missing detail so we can continue." : latestApproved ? "Next step: wait for settlement confirmation." : "Next step: upload the required documents."}
            </div>
          </div>
        </div>
      ) : null}
      <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: C.text }}>Why this feels easier</h3>
        <ul style={{ margin: 0, paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 1.9 }}>
          <li>We ask for only the missing detail instead of restarting the process.</li>
          <li>You see plain-language claim status instead of back-office terms.</li>
          <li>Simple claims move faster, while risky ones are checked safely.</li>
        </ul>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {types.map((type) => (
          <div key={type} style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: C.text }}>{getPlaybook(type).mobileTitle}</h3>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>{getPlaybook(type).claimantSummary}</p>
            <div style={{ fontSize: 12.5, color: C.muted }}>Keep ready: {getPlaybook(type).claimantChecklist.slice(0, 3).join(", ")}</div>
          </div>
        ))}
      </div>
    </MobileFrame>
  );
}
