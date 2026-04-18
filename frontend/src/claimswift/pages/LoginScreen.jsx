import { useState } from "react";
import { C, card } from "../theme";

const demoUsers = [
  { role: "Ops admin", email: "admin@claimswift.ai", password: "admin123", note: "Full platform access" },
  { role: "Claims adjuster", email: "adjuster@claimswift.ai", password: "adjust123", note: "Create, clarify, settle" },
  { role: "Fraud reviewer", email: "reviewer@claimswift.ai", password: "review123", note: "Manual review and audit" },
  { role: "Ops analyst", email: "analyst@claimswift.ai", password: "analyst123", note: "Analytics and operations visibility" },
];

export default function LoginScreen({ onLogin, error, loading }) {
  const [email, setEmail] = useState(demoUsers[0].email);
  const [password, setPassword] = useState(demoUsers[0].password);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "minmax(0,1.15fr) 420px",
        gap: 28,
        padding: 36,
        alignItems: "center",
        background: "linear-gradient(180deg,#142647,#0d1f3d)",
      }}
    >
      <div className="rise-in" style={{ color: "#f4f7fb" }}>
        <span style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 999, background: "rgba(0,168,150,.18)", color: "#b4fff7", fontSize: 12, fontWeight: 700, letterSpacing: ".06em" }}>
          INSURER CONTROL PLANE
        </span>
        <h1 style={{ margin: "18px 0 10px", fontSize: "clamp(3rem,5vw,4.8rem)", lineHeight: 0.96, fontWeight: 900 }}>ClaimSwift AI</h1>
        <p style={{ fontSize: "clamp(1.15rem,1.9vw,1.8rem)", fontWeight: 600, color: "#eaf2ff", marginBottom: 16 }}>
          Authenticated claims operations, reviewer controls, and audit-ready automation.
        </p>
        <p style={{ maxWidth: 680, fontSize: 15.5, lineHeight: 1.7, color: "rgba(239,245,255,.78)" }}>
          This workspace now behaves like an insurer platform instead of an anonymous demo. Every action runs under a named role, protected routes enforce permissions, and the operations console surfaces readiness, queue pressure, and audit activity.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: 24, maxWidth: 760 }}>
          {demoUsers.map((user) => (
            <button
              key={user.email}
              type="button"
              onClick={() => {
                setEmail(user.email);
                setPassword(user.password);
              }}
              style={{
                textAlign: "left",
                padding: 16,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.08)",
                color: "#f4f7fb",
                cursor: "pointer",
              }}
            >
              <strong style={{ display: "block", fontSize: 13.5, marginBottom: 6 }}>{user.role}</strong>
              <div style={{ fontSize: 12.5, color: "#d9e8ff" }}>{user.email}</div>
              <div style={{ fontSize: 12.5, color: "#9edbd2", marginTop: 2 }}>{user.password}</div>
              <p style={{ fontSize: 12, color: "rgba(239,245,255,.7)", marginTop: 8 }}>{user.note}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="rise-in" style={{ ...card, maxWidth: 420, width: "100%", padding: 24, animationDelay: "100ms" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 6 }}>Operator sign in</h2>
        <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 20 }}>
          Use one of the seeded insurer accounts or switch roles to validate route permissions.
        </p>
        <label style={{ display: "grid", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} style={{ borderRadius: 12, border: `1px solid ${C.border}`, padding: "12px 14px", fontSize: 14 }} />
        </label>
        <label style={{ display: "grid", gap: 6, marginBottom: 18 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={{ borderRadius: 12, border: `1px solid ${C.border}`, padding: "12px 14px", fontSize: 14 }} />
        </label>
        {error ? (
          <div style={{ padding: "10px 12px", borderRadius: 12, background: "#fff2ef", border: "1px solid #f2c4b8", color: C.rose, fontSize: 13, fontWeight: 700, marginBottom: 14 }}>
            {error}
          </div>
        ) : null}
        <button className="btn btn-teal" style={{ width: "100%", justifyContent: "center" }} disabled={loading} onClick={() => onLogin({ email, password })}>
          {loading ? "Signing in..." : "Enter insurer workspace"}
        </button>
      </div>
    </section>
  );
}
