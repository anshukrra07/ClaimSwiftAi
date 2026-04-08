import { C } from "../theme";
import { MobileFrame, Tag } from "./PagePieces";

export default function MobileHomeScreen() {
  return (
    <MobileFrame>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: C.navy }}>ClaimSwift AI</h1>
      <p style={{ fontSize: 14, color: C.muted }}>File and track your claim with guided explanations.</p>
      {[
        { title: "Health reimbursement claim", note: "Upload documents, check confidence, and follow live claim progress." },
        { title: "Recent Activity", items: ["CLM-2105 paused for clarification", "Claim update sent 2m ago", "Reviewer approved controlled settlement"] },
        { title: "Why users trust ClaimSwift", items: ["Clear decision reasons", "Live status instead of silent delays", "Safe escalation for complex cases"] },
      ].map((s, i) => (
        <div key={i} style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface }}>
          {i === 0 && (
            <div style={{ marginBottom: 8 }}>
              <Tag label="Low-risk claim ready" tone="teal" />
            </div>
          )}
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: C.text }}>{s.title}</h3>
          {s.note && <p style={{ fontSize: 13, color: C.muted }}>{s.note}</p>}
          {s.items && (
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: C.muted, fontSize: 13, lineHeight: 2 }}>
              {s.items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          )}
        </div>
      ))}
    </MobileFrame>
  );
}
