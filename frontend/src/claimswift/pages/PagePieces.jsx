import { C } from "../theme";

export function FeatureCard({ title, copy }) {
  return (
    <div style={{ padding: 16, border: `1px solid ${C.border}`, borderRadius: 16, background: "linear-gradient(180deg,#f9fbff,#f2f6fc)" }}>
      <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: C.navy }}>{title}</h4>
      <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>{copy}</p>
    </div>
  );
}

export {
  ClaimSwitcher,
  MetricCard,
  ConfidenceCard,
  Field,
  PageHeader,
  ProcessingPanel,
  ReceiptRow,
  QueueItem,
  Tag,
  MobileFrame,
  FraudGauge,
  AnimatedCounter,
  ToastContainer,
  StepCard,
} from "../components/ui";
