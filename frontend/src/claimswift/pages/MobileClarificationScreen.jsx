import { useEffect, useState } from "react";
import { C } from "../theme";
import { formatInr } from "../formatters";
import { MobileFrame, Tag } from "./PagePieces";

export default function MobileClarificationScreen({ claim, onResume }) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    setAmount(claim?.benchmarkAmount ? String(claim.benchmarkAmount) : "");
  }, [claim]);

  return (
    <MobileFrame>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: C.navy }}>One quick fix needed</h1>
      <p style={{ fontSize: 14, color: C.muted }}>We are almost done checking your claim. One number was unclear in the uploaded document.</p>
      <div style={{ padding: 18, borderRadius: 16, border: `1.5px solid rgba(194,77,44,.3)`, background: C.roseL }}>
        <div style={{ marginBottom: 10 }}>
          <Tag label="Needs your input" tone="amber" />
        </div>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>We could not read the amount clearly.</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
          Type the correct amount from your bill. Once you submit it, we continue the check automatically.
        </p>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d]/g, ""))}
          style={{ width: "100%", padding: "12px 14px", borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text, fontWeight: 600, marginBottom: 14 }}
          placeholder="Enter corrected amount"
        />
        <button className="btn btn-teal btn-full" onClick={() => onResume(Number(amount || 0))}>Submit and continue</button>
      </div>
      <div style={{ padding: 18, borderRadius: 16, background: "linear-gradient(180deg,#16284b,#13233f)", color: "#f6fbff" }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>What happens after this</h3>
        <div style={{ display: "grid", gap: 10 }}>
          {[
            "We update your claim with the corrected amount.",
            "We continue the policy and document checks.",
            "You will see the next status without filling the whole form again.",
          ].map((item, index) => (
            <div key={item} style={{ display: "grid", gridTemplateColumns: "24px minmax(0,1fr)", gap: 10, alignItems: "start" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>
                {index + 1}
              </div>
              <div style={{ fontSize: 13, color: "rgba(246,251,255,.84)", lineHeight: 1.6 }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface }}>
        <h3 style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Helpful reference</h3>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          If you are unsure, check the total amount on your bill. Our current estimate is {formatInr(claim?.benchmarkAmount || 0)}.
        </p>
      </div>
    </MobileFrame>
  );
}
