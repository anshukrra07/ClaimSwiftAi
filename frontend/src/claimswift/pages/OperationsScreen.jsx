import { C, card } from "../theme";
import { MetricCard, PageHeader, Tag } from "./PagePieces";

function StatusTone(status) {
  if (status === "pass" || status === "ok") return "teal";
  if (status === "warn") return "amber";
  return "rose";
}

export default function OperationsScreen({ ops, user }) {
  const readiness = ops?.readiness;
  const queue = ops?.queue || {};
  const sessions = ops?.sessions || { active: 0, users: [] };
  const auditEvents = ops?.recentAuditEvents || [];

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader
        title="Platform Operations"
        copy="Operational control plane for readiness checks, queue pressure, active operator sessions, and recent audit activity."
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        <MetricCard label="Readiness" value={readiness?.status === "ok" ? "Healthy" : "Degraded"} accent={readiness?.status === "ok" ? "teal" : "amber"} />
        <MetricCard label="Clarifications" value={String(queue.clarification || 0)} accent="amber" note="waiting on claimant" />
        <MetricCard label="Manual review" value={String((queue.review || 0) + (queue.verification || 0))} accent="rose" note="review + verification" />
        <MetricCard label="Ready to settle" value={String(queue.readyToSettle || 0)} accent="blue" note="approved for payout" />
        <MetricCard label="Active sessions" value={String(sessions.active || 0)} accent="navy" note={`${user?.name || "Operator"} signed in`} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 18 }}>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Readiness checks</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {(readiness?.checks || []).map((check) => (
              <div key={check.key} style={{ padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, background: C.surfaceSoft }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 6 }}>
                  <strong style={{ fontSize: 13.5, color: C.text }}>{check.label}</strong>
                  <Tag label={check.status.toUpperCase()} tone={StatusTone(check.status)} />
                </div>
                <p style={{ fontSize: 12.5, color: C.muted }}>{check.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 10 }}>Active operator sessions</h2>
          <div style={{ display: "grid", gap: 10 }}>
            {sessions.users.length ? sessions.users.map((session) => (
              <div key={session.sessionId} style={{ padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface }}>
                <strong style={{ display: "block", fontSize: 13.5, color: C.text }}>{session.name}</strong>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{session.role}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Signed in at {new Date(session.createdAt).toLocaleString()}</div>
              </div>
            )) : <p style={{ fontSize: 13, color: C.muted }}>No active sessions recorded.</p>}
          </div>
        </div>
      </div>
      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Recent audit activity</h2>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
          Every claim or policy action is written to the platform audit stream with actor identity and request trace.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {auditEvents.length ? auditEvents.map((event) => (
            <div key={event.id} style={{ display: "grid", gridTemplateColumns: "170px minmax(0,1fr) auto", gap: 14, padding: "12px 14px", borderRadius: 14, border: `1px solid ${C.border}`, background: C.surface }}>
              <div style={{ fontSize: 12.5, color: C.muted }}>{new Date(event.at).toLocaleString()}</div>
              <div>
                <strong style={{ display: "block", fontSize: 13.5, color: C.text }}>{event.summary}</strong>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                  {event.actorName} · {event.actorRole} · {event.action} · {event.entityId}
                </div>
              </div>
              <Tag label={event.outcome} tone={event.outcome === "success" ? "teal" : "rose"} />
            </div>
          )) : <p style={{ fontSize: 13, color: C.muted }}>No audit events available for this role.</p>}
        </div>
      </div>
    </section>
  );
}
