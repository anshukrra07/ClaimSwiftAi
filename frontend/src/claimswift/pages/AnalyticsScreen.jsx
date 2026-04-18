import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis } from "recharts";
import { C, card } from "../theme";
import { MetricCard, PageHeader, Tag } from "./PagePieces";

export default function AnalyticsScreen({ dashboard }) {
  const metrics = dashboard?.metrics;
  const analyticsData = dashboard?.claimsByMonth || [];
  const fraudRadar = dashboard?.fraudRadar || [];
  const insights = dashboard?.insights || [];

  return (
    <section style={{ display: "grid", gap: 18 }}>
      <PageHeader title="Analytics & Operations Overview" copy="Track throughput, fraud pressure, STP performance, and complaint prevention across the claims pipeline." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        {[
          { label: "STP rate", value: metrics ? `${metrics.stpRate}%` : "—", accent: "teal", delta: "+4%", note: "low-risk auto-settled" },
          { label: "Avg TAT", value: metrics ? `${metrics.avgTatMinutes} min` : "—", accent: "blue", delta: "–3 min", note: "verified low-risk flow" },
          { label: "Fraud flags", value: metrics ? `${metrics.manualRate}%` : "—", accent: "rose", delta: "+2%", note: "claims requiring review" },
          { label: "Complaint reduction", value: metrics ? `↓ ${metrics.complaintReduction}%` : "—", accent: "navy", note: "status-check calls avoided" },
          { label: "Manual effort", value: metrics ? `${metrics.manualRate}%` : "—", accent: "amber", delta: "–6%", note: "adjuster time saved" },
        ].map((m) => <MetricCard key={m.label} {...m} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.6fr) minmax(0,1fr)", gap: 18 }}>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Claims Volume vs Manual Load</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Manual pressure drops as clarification recovery and STP coverage improve.</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={analyticsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gteal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.teal} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.rose} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.rose} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: C.muted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 13 }} />
              <Area type="monotone" dataKey="stp" stroke={C.teal} fill="url(#gteal)" strokeWidth={2.5} name="Auto-settled" />
              <Area type="monotone" dataKey="manual" stroke={C.rose} fill="url(#grose)" strokeWidth={2.5} name="Manual" />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: C.muted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: C.teal, display: "inline-block" }} />Auto-settled
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: C.rose, display: "inline-block" }} />Manual
            </span>
          </div>
        </div>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Fraud Signal Radar</h2>
          <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Anomaly strength across detection dimensions for escalated claims.</p>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={fraudRadar}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: C.muted }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10, fill: C.muted }} axisLine={false} />
              <Radar name="Signal" dataKey="A" stroke={C.rose} fill={C.rose} fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Operations Insights</h2>
          {insights.map((i) => (
            <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.muted }}>• {i}</div>
          ))}
          <div style={{ marginTop: 14 }}>
            <Tag label="Reviewer queue stable" tone="teal" />
          </div>
        </div>
        <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Complaint Prevention</h2>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 14 }}>
              Transparent status updates, clarification prompts, and payout explanations reduce repeated claimant follow-ups.
            </p>
            <MetricCard label="Status checks avoided" value={metrics ? `${metrics.statusChecksAvoided}%` : "—"} accent="navy" />
          </div>
          <div style={card}>
            <h2 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>Fraud Control Impact</h2>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, marginBottom: 14 }}>
              Fraud-aware routing prevents blanket strictness on genuine users while keeping leakage visible.
            </p>
            <MetricCard label="Leakage pressure" value="↓ visible" accent="rose" />
          </div>
        </div>
      </div>
    </section>
  );
}
