import { useEffect, useRef, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { C, TONES, card, css } from "../theme";

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "grid", gap: 8 }}>
      {toasts.map((t) => {
        const tone = TONES[t.tone] || TONES.teal;
        return (
          <div
            key={t.id}
            style={{
              padding: "12px 20px",
              borderRadius: 14,
              background: tone.bg,
              border: `1px solid ${tone.border}`,
              color: tone.text,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: "0 8px 24px rgba(15,35,66,.14)",
              animation: "slideUp 280ms ease both",
            }}
          >
            {t.message}
          </div>
        );
      })}
    </div>
  );
}

export function AnimatedCounter({ target, duration = 1200, prefix = "", suffix = "" }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(ease * target));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);

  return (
    <>
      {prefix}
      {value}
      {suffix}
    </>
  );
}

export function FraudGauge({ score }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const color = pct < 30 ? C.teal : pct < 70 ? C.amber : C.rose;
  const label = pct < 30 ? "Low risk" : pct < 70 ? "Medium risk" : "High risk";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ width: 180, height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={[{ score: pct }]}>
            <PolarGrid stroke={C.border} />
            <PolarAngleAxis dataKey="score" tick={false} />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Radar dataKey="score" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <strong style={{ fontSize: 28, color }}>{pct}</strong>
      <span style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: ".04em" }}>{label}</span>
    </div>
  );
}

export function Tag({ label, tone = "teal" }) {
  const t = TONES[tone] || TONES.teal;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 12px",
        borderRadius: 999,
        background: t.bg,
        color: t.text,
        border: `1px solid ${t.border}`,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".02em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function StatusChip({ status }) {
  const map = {
    done: { label: "Done", tone: "teal" },
    active: { label: "Running now", tone: "blue" },
    waiting: { label: "Waiting for input", tone: "amber" },
    pending: { label: "Pending", tone: "navy" },
  };
  const m = map[status] || map.pending;
  return <Tag label={m.label} tone={m.tone} />;
}

export function StepCard({ title, copy, meta, status, compact }) {
  const isActive = status === "active";
  const icons = { done: "✓", active: "→", waiting: "!", pending: "·" };
  const iconColors = { done: C.teal, active: C.blue, waiting: C.amber, pending: C.muted };

  return (
    <article
      style={css(
        {
          display: "flex",
          gap: 14,
          padding: compact ? "12px 14px" : "16px 18px",
          borderRadius: 16,
          border: `1px solid ${C.border}`,
          background: C.surface,
          position: "relative",
          overflow: "hidden",
        },
        isActive && { borderColor: "rgba(49,86,211,.3)", background: C.blueL },
      )}
    >
      {isActive && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: C.blue,
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}
      <div
        style={{
          width: 28,
          height: 28,
          minWidth: 28,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isActive ? C.blue : status === "done" ? C.tealL : C.surfaceSoft,
          color: isActive ? "#fff" : iconColors[status],
          fontWeight: 800,
          fontSize: 15,
        }}
      >
        {isActive ? (
          <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
        ) : (
          icons[status]
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: C.text }}>{title}</h3>
          <StatusChip status={status} />
        </div>
        <p style={{ fontSize: compact ? 12 : 13, color: C.muted, lineHeight: 1.45 }}>{copy}</p>
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 4, display: "block" }}>{meta}</span>
      </div>
    </article>
  );
}

export function MetricCard({ label, value, accent = "blue", delta, note }) {
  const accColors = { teal: C.teal, blue: C.blue, rose: C.rose, navy: C.navy, amber: C.amber, green: C.green };
  const ac = accColors[accent] || C.blue;
  return (
    <div style={{ padding: "18px 20px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface, position: "relative", overflow: "hidden" }}>
      <div style={{ width: 36, height: 4, borderRadius: 99, background: ac, marginBottom: 10 }} />
      <p style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <strong style={{ display: "block", fontSize: "clamp(1.7rem,2vw,2.4rem)", lineHeight: 1, color: ac }}>{value}</strong>
      {delta && <em style={{ display: "block", fontSize: 12, color: C.muted, marginTop: 4, fontStyle: "normal" }}>{delta}</em>}
      {note && <span style={{ display: "block", fontSize: 12, color: C.muted, marginTop: 2 }}>{note}</span>}
      <div style={{ position: "absolute", right: "-20%", bottom: "-40%", width: 100, height: 100, borderRadius: "50%", background: ac, opacity: 0.05 }} />
    </div>
  );
}

export function ConfidenceCard({ title, value, score, subtitle, tone }) {
  const ringColor = tone === "good" ? C.teal : tone === "risk" ? C.rose : C.amber;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16, border: `1px solid ${C.border}`, background: C.surface }}>
      <div
        style={{
          width: 52,
          height: 52,
          minWidth: 52,
          borderRadius: "50%",
          background: tone === "good" ? C.tealL : tone === "risk" ? C.roseL : C.amberL,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 800,
          color: ringColor,
          border: `2px solid ${ringColor}`,
        }}
      >
        {score}
      </div>
      <div>
        <strong style={{ display: "block", fontSize: 13, color: C.text }}>{title}</strong>
        <p style={{ fontSize: 13, color: C.muted }}>{value}</p>
        <span style={{ fontSize: 11, color: C.muted }}>{subtitle}</span>
      </div>
    </div>
  );
}

export function Field({ label, value, wide }) {
  return (
    <div style={{ gridColumn: wide ? "1 / -1" : undefined }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{label}</span>
      <div style={{ padding: "10px 14px", borderRadius: 12, background: C.surfaceSoft, border: `1px solid ${C.border}`, fontSize: 13.5, color: C.text, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

export function ReceiptRow({ label, value, danger }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "13px 4px", borderBottom: `1px solid ${C.border}` }}>
      <span style={{ color: C.muted, fontSize: 14 }}>{label}</span>
      <strong style={{ color: danger ? C.rose : C.text, fontSize: 14 }}>{value}</strong>
    </div>
  );
}

export function QueueItem({ title, note, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "14px 16px",
        borderRadius: 14,
        border: `1px solid ${active ? "rgba(194,77,44,.3)" : C.border}`,
        background: active ? "#fff7f6" : C.surface,
        cursor: "pointer",
        transition: "all 160ms ease",
      }}
    >
      <strong style={{ display: "block", fontSize: 13.5, color: C.text, marginBottom: 4 }}>{title}</strong>
      <p style={{ fontSize: 12.5, color: C.muted }}>{note}</p>
    </button>
  );
}

export function ClaimSwitcher({ title = "Claims", claims, activeId, onSelect, tone = "blue", subtitle }) {
  if (!claims?.length) return null;
  const toneColor = TONES[tone] || TONES.blue;

  return (
    <div style={{ padding: 16, borderRadius: 16, border: `1px solid ${toneColor.border}`, background: toneColor.bg }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 13, color: toneColor.text }}>{title}</strong>
        {subtitle ? <span style={{ fontSize: 11, color: C.muted }}>{subtitle}</span> : null}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {claims.map((claim) => (
          <button
            key={claim.id}
            onClick={() => onSelect(claim.id)}
            style={{
              borderRadius: 999,
              border: `1px solid ${claim.id === activeId ? toneColor.border : C.border}`,
              background: claim.id === activeId ? C.surface : "rgba(255,255,255,.75)",
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 700,
              color: claim.id === activeId ? toneColor.text : C.text,
              cursor: "pointer",
            }}
          >
            {claim.id} · {claim.insuranceLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PageHeader({ title, copy }) {
  return (
    <header style={css(card, { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 18, flexWrap: "wrap", background: "linear-gradient(135deg,#f9fbff,#f2f7fd)" })}>
      <div>
        <h1 style={{ fontSize: "clamp(1.4rem,2vw,1.9rem)", fontWeight: 800, color: C.navy, marginBottom: 6 }}>{title}</h1>
        <p style={{ fontSize: 14, color: C.muted, maxWidth: 600 }}>{copy}</p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Tag label="STP ready" tone="teal" />
        <Tag label="Fraud-aware" tone="amber" />
        <Tag label="Audit trail" tone="blue" />
      </div>
    </header>
  );
}

export function ProcessingPanel({ title, subtitle, summary, steps, compact, spotlight }) {
  const spotColors = { decision: C.blue, fraud: C.rose, clarification: C.amber };
  const sc = spotColors[spotlight];
  return (
    <section style={css(card, sc ? { borderColor: sc.replace(")", ",.28)").replace("rgb", "rgba"), background: `linear-gradient(180deg,${C.surface},${C.surfaceSoft})` } : {})}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{title}</h2>
          <p style={{ fontSize: 13, color: C.muted }}>{subtitle}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <strong style={{ display: "block", fontSize: 13, color: C.text }}>{summary.completed}</strong>
          <span style={{ fontSize: 12, color: C.muted }}>{summary.stage}</span>
        </div>
      </div>
      <div style={{ display: "grid", gap: compact ? 8 : 12, gridTemplateColumns: compact ? "repeat(auto-fill,minmax(260px,1fr))" : "1fr" }}>
        {steps.map((s) => (
          <StepCard key={s.title} {...s} compact={compact} />
        ))}
      </div>
    </section>
  );
}

export function MobileFrame({ children }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "min(400px,90vw)", padding: 14, borderRadius: 36, background: "linear-gradient(180deg,#17294d,#0f2342)", boxShadow: "0 32px 64px rgba(15,35,66,.24)" }}>
        <div style={{ minHeight: 700, padding: "22px 20px", borderRadius: 28, background: "linear-gradient(180deg,#fff,#f6f9fe)", display: "grid", alignContent: "start", gap: 16 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
