import { useCallback, useState } from "react";
import { C, card } from "../theme";
import { PageHeader, Tag } from "./PagePieces";

export default function PolicyScreen({ addToast }) {
  const [rules, setRules] = useState({
    stpThreshold: true,
    deductible: true,
    duplicateCheck: true,
    providerRisk: true,
    docValidation: true,
    amountCap: true,
  });
  const [deductible, setDeductible] = useState(2500);
  const [stpLimit, setStpLimit] = useState(25000);

  const toggleRule = useCallback(
    (key) => {
      setRules((r) => ({ ...r, [key]: !r[key] }));
      addToast(`Rule ${rules[key] ? "disabled" : "enabled"}`, rules[key] ? "rose" : "teal");
    },
    [rules, addToast],
  );

  const activeCount = Object.values(rules).filter(Boolean).length;
  const ruleList = [
    { key: "stpThreshold", label: "STP Amount Threshold", desc: `Claims ≤ INR ${stpLimit.toLocaleString()} eligible for auto-settle` },
    { key: "deductible", label: "Deductible Rule", desc: `Apply INR ${deductible.toLocaleString()} standard deductible to all health claims` },
    { key: "duplicateCheck", label: "Duplicate Detection", desc: "Block claims with >70% invoice similarity to past submissions" },
    { key: "providerRisk", label: "Provider Risk Scoring", desc: "Escalate claims from high-risk provider profiles" },
    { key: "docValidation", label: "Document Completeness", desc: "Require discharge summary + invoice + policy reference before routing" },
    { key: "amountCap", label: "High-Value Authorization", desc: "Mandate reviewer approval for claims above INR 50,000" },
  ];

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader title="Policy Engine — Rule Management" copy="Configure and test the live rule set that governs coverage checks, deductibles, STP eligibility, and escalation logic." />
      <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, flexWrap: "wrap", background: "linear-gradient(135deg,#0f2342,#1a2a4d)", color: "#f4f7fb" }}>
        <div>
          <strong style={{ display: "block", fontSize: 20, color: "#fff" }}>{activeCount} of {ruleList.length} rules active</strong>
          <p style={{ fontSize: 13, color: "rgba(240,248,255,.7)", marginTop: 4 }}>Changes apply in real time to the decision engine simulation</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Tag label={`STP limit: INR ${stpLimit.toLocaleString()}`} tone="teal" />
          <Tag label={`Deductible: INR ${deductible.toLocaleString()}`} tone="blue" />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,340px)", gap: 18 }}>
        <div style={{ display: "grid", gap: 12 }}>
          {ruleList.map((r) => (
            <button key={r.key} className={`rule-toggle ${rules[r.key] ? "on" : "off"}`} onClick={() => toggleRule(r.key)}>
              <div>
                <strong style={{ display: "block", fontSize: 14, color: rules[r.key] ? C.tealD : C.rose, marginBottom: 4 }}>{r.label}</strong>
                <p style={{ fontSize: 13, color: C.muted, margin: 0, textAlign: "left" }}>{r.desc}</p>
              </div>
              <div style={{ minWidth: 52, height: 28, borderRadius: 999, padding: 3, display: "flex", alignItems: "center", background: rules[r.key] ? C.teal : "#ddd", transition: "background .2s", justifyContent: rules[r.key] ? "flex-end" : "flex-start" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
              </div>
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 16 }}>Threshold Configurator</h2>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>STP Amount Limit</span>
                <strong style={{ fontSize: 14, color: C.teal }}>INR {stpLimit.toLocaleString()}</strong>
              </div>
              <input type="range" min={5000} max={100000} step={1000} value={stpLimit} onChange={(e) => setStpLimit(+e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 4 }}>
                <span>INR 5,000</span>
                <span>INR 1,00,000</span>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Standard Deductible</span>
                <strong style={{ fontSize: 14, color: C.blue }}>INR {deductible.toLocaleString()}</strong>
              </div>
              <input type="range" min={0} max={10000} step={500} value={deductible} onChange={(e) => setDeductible(+e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 4 }}>
                <span>INR 0</span>
                <span>INR 10,000</span>
              </div>
            </div>
          </div>
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Simulated Outcome</h2>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>Claim CLM-2026-2105 · INR 22,000 · Health reimbursement</p>
            {[
              ["Claimed", "INR 22,000"],
              ["Deductible", `– INR ${deductible.toLocaleString()}`],
              ["Payable", `INR ${(22000 - deductible).toLocaleString()}`],
            ].map(([l, v], i) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 13, color: C.muted }}>{l}</span>
                <strong style={{ fontSize: 14, color: i === 2 ? C.teal : C.text }}>{v}</strong>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: 22000 - deductible <= stpLimit ? C.tealL : C.roseL, border: `1px solid ${22000 - deductible <= stpLimit ? "rgba(0,168,150,.3)" : "rgba(194,77,44,.3)"}` }}>
              <strong style={{ fontSize: 13, color: 22000 - deductible <= stpLimit ? C.tealD : C.rose }}>
                {22000 - deductible <= stpLimit ? "✓ Eligible for auto-settlement" : "✗ Requires manual review — above STP limit"}
              </strong>
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 14 }} onClick={() => addToast("Policy rules saved and applied to engine", "teal")}>
              Save & apply rules
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
