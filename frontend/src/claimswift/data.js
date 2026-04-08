export const desktopNav = [
  { id: "intake", label: "Claims Intake" },
  { id: "decision", label: "Decision" },
  { id: "reviewer", label: "Reviewer Queue" },
  { id: "fraud", label: "Fraud Signals" },
  { id: "policy", label: "Policy Engine" },
  { id: "analytics", label: "Analytics" },
];

export const mobileNav = [
  { id: "mobileHome", label: "Mobile Home" },
  { id: "mobileClarification", label: "Clarification" },
];

export const clarificationSteps = [
  { title: "Intake agent", status: "done", copy: "Claim package validated — 3 documents accepted.", meta: "2s ago" },
  { title: "Extraction agent", status: "done", copy: "8 fields extracted. Invoice total confidence is 38%.", meta: "Low-confidence field" },
  { title: "Clarification agent", status: "waiting", copy: "Could not confidently read the invoice amount. Please confirm so the workflow can continue.", meta: "Action required" },
  { title: "Policy agent", status: "pending", copy: "Checking eligibility, deductible, and coverage rules.", meta: "Starts after clarification" },
  { title: "Fraud agent", status: "pending", copy: "Evaluating duplicate signals, provider risk, and amount anomalies.", meta: "Risk scoring" },
  { title: "Decision agent", status: "pending", copy: "Preparing settlement or reviewer routing based on evidence strength.", meta: "Final step" },
];

export const approvedSteps = [
  { title: "Intake agent", status: "done", copy: "Claim package validated — 3 documents accepted.", meta: "Completed" },
  { title: "Extraction agent", status: "done", copy: "All mandatory fields extracted with strong confidence.", meta: "Invoice verified at 91%" },
  { title: "Policy agent", status: "done", copy: "Coverage matched and deductible applied successfully.", meta: "Eligible" },
  { title: "Fraud agent", status: "done", copy: "No duplicate signal or provider anomaly detected.", meta: "Risk score 18/100" },
  { title: "Decision agent", status: "active", copy: "Preparing payout initiation and claimant notification.", meta: "Running now" },
  { title: "Settlement agent", status: "pending", copy: "UPI payout and status notification will be triggered next.", meta: "Final step" },
];

export const reviewSteps = [
  { title: "Intake agent", status: "done", copy: "High-value claim package validated.", meta: "Completed" },
  { title: "Extraction agent", status: "done", copy: "Invoice, provider, and procedure fields extracted.", meta: "Multiple signals found" },
  { title: "Clarification agent", status: "done", copy: "Claimant confirmed corrected invoice amount.", meta: "Recovery succeeded" },
  { title: "Policy agent", status: "done", copy: "Coverage matched but payout exceeds STP threshold.", meta: "Above safe threshold" },
  { title: "Fraud agent", status: "active", copy: "Strong duplicate invoice similarity and amount outlier detected.", meta: "Reviewer attention needed" },
  { title: "Decision agent", status: "waiting", copy: "Recommendation prepared — awaiting manual approval.", meta: "Waiting for reviewer" },
];

export const analyticsData = [
  { month: "Oct", claims: 210, manual: 58, stp: 152 },
  { month: "Nov", claims: 245, manual: 52, stp: 193 },
  { month: "Dec", claims: 198, manual: 44, stp: 154 },
  { month: "Jan", claims: 280, manual: 42, stp: 238 },
  { month: "Feb", claims: 312, manual: 38, stp: 274 },
  { month: "Mar", claims: 287, manual: 32, stp: 255 },
];

export const fraudRadar = [
  { subject: "Duplicate", A: 82 },
  { subject: "Amount", A: 74 },
  { subject: "Provider", A: 68 },
  { subject: "Frequency", A: 55 },
  { subject: "Doc quality", A: 61 },
  { subject: "Timing", A: 43 },
];
