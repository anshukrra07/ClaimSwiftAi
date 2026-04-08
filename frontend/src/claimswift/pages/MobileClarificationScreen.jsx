import { C } from "../theme";
import { MobileFrame, StepCard, Tag } from "./PagePieces";

export default function MobileClarificationScreen({ onResume }) {
  return (
    <MobileFrame>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: C.navy }}>Clarification Required</h1>
      <p style={{ fontSize: 14, color: C.muted }}>We need one more input before we can continue your claim safely.</p>
      <div style={{ padding: 18, borderRadius: 16, border: `1.5px solid rgba(194,77,44,.3)`, background: C.roseL }}>
        <div style={{ marginBottom: 10 }}>
          <Tag label="Low confidence detected" tone="rose" />
        </div>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Invoice amount could not be read clearly.</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
          Please type the correct amount or re-upload a clearer image. The workflow will resume automatically.
        </p>
        <div style={{ padding: "12px 14px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, fontSize: 13.5, color: C.muted, fontWeight: 600, marginBottom: 14 }}>
          Enter amount: INR 12,450
        </div>
        <button className="btn btn-teal btn-full" onClick={onResume}>Submit clarification and resume →</button>
      </div>
      <div style={{ padding: 18, borderRadius: 16, background: "linear-gradient(180deg,#16284b,#13233f)", color: "#f6fbff" }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>We paused safely — one field is unclear.</h3>
        <div style={{ display: "grid", gap: 8 }}>
          <StepCard title="Extraction agent" copy="Amount field confidence 43%" status="done" meta="Done" compact />
          <StepCard title="Clarification agent" copy="Request sent to claimant" status="waiting" meta="Waiting for input" compact />
          <StepCard title="Policy agent" copy="Starts after confirmation" status="pending" meta="Pending" compact />
        </div>
      </div>
      <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>What happens next</h3>
        <p style={{ fontSize: 13, color: C.muted }}>Once you confirm the value, policy validation and fraud scoring continue automatically.</p>
      </div>
    </MobileFrame>
  );
}
