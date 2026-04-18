export const desktopNav = [
  { id: "intake", label: "Claims Intake", permission: "claims:read" },
  { id: "decision", label: "Decision", permission: "claims:read" },
  { id: "reviewer", label: "Reviewer Queue", permission: "claims:review" },
  { id: "fraud", label: "Fraud Signals", permission: "claims:read" },
  { id: "policy", label: "Policy Engine", permission: "policy:read" },
  { id: "operations", label: "Operations", permission: "platform:read" },
  { id: "analytics", label: "Analytics", permission: "analytics:read" },
];

export const mobileNav = [
  { id: "mobileHome", label: "Mobile Home", permission: "claims:read" },
  { id: "mobileClarification", label: "Clarification", permission: "claims:clarify" },
];
