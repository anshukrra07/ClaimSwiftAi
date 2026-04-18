import { desktopNav, mobileNav } from "../data";
import { C } from "../theme";

export default function DashboardLayout({ screen, onNavigate, children, user, onLogout, readinessStatus, sessionCount }) {
  const desktopItems = desktopNav.filter((item) => !item.permission || user?.permissions?.includes(item.permission));
  const mobileItems = mobileNav.filter((item) => !item.permission || user?.permissions?.includes(item.permission));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0,1fr)", minHeight: "100vh" }}>
      <aside
        style={{
          background: "linear-gradient(180deg,#1a2a4d,#112241)",
          color: "#f4f7fb",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.7rem", fontWeight: 900, letterSpacing: "-.02em", color: "#fff", marginBottom: 6 }}>ClaimSwift AI</h2>
            <p style={{ fontSize: 12, color: "rgba(245,248,255,.6)", marginBottom: 12 }}>Explainable claims engine</p>
            <span
              style={{
                display: "inline-flex",
                padding: "5px 12px",
                borderRadius: 999,
                background: "rgba(0,168,150,.2)",
                color: "#b4fff7",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              Technoverse 2026
            </span>
          </div>
          <nav>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(240,245,255,.4)", marginBottom: 8 }}>Desktop</p>
            <div style={{ display: "grid", gap: 4, marginBottom: 20 }}>
              {desktopItems.map((item) => (
                <button key={item.id} className={`nav-btn ${screen === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(240,245,255,.4)", marginBottom: 8 }}>Mobile</p>
            <div style={{ display: "grid", gap: 4 }}>
              {mobileItems.map((item) => (
                <button key={item.id} className={`nav-btn ${screen === item.id ? "active" : ""}`} onClick={() => onNavigate(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
        <div style={{ fontSize: 12.5, color: "rgba(245,248,255,.65)", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <div style={{ width: 72, height: 72, borderRadius: 8, background: "rgba(255,255,255,.94)", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: C.navy }}>{user?.name?.slice(0, 2).toUpperCase() || "CS"}</span>
          </div>
          <p style={{ marginBottom: 2 }}>{user?.name || "Unauthenticated"}</p>
          <strong style={{ color: "#fff", display: "block", marginBottom: 8 }}>{user?.role || "No role"}</strong>
          <p style={{ marginBottom: 4 }}>Platform: {readinessStatus || "unknown"}</p>
          <p style={{ marginBottom: 12 }}>Sessions: {sessionCount ?? 0}</p>
          {onLogout ? (
            <button
              onClick={onLogout}
              style={{
                width: "100%",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.14)",
                background: "rgba(255,255,255,.08)",
                color: "#fff",
                padding: "10px 12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          ) : null}
        </div>
      </aside>
      <main style={{ padding: 28, minHeight: "100vh", overflowY: "auto" }}>
        <div key={screen} className="screen-in">
          {children}
        </div>
      </main>
    </div>
  );
}
