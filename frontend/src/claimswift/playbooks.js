import { titleCase } from "./formatters";

const playbooks = {
  health: {
    marketingLabel: "Health reimbursement",
    sampleProvider: "Sunrise Multispeciality Hospital",
    sampleCity: "Pune",
    sampleProcedure: "Outpatient reimbursement",
    heroSequence: [
      "Upload blurred hospital bill",
      "Live feed detects low confidence",
      "Clarification prompt appears",
      "Claim resumes to payout or review",
      "Fraud heatmap explains escalation",
    ],
    evidenceTitle: "Medical document pack",
    evidenceDescription: "Bills, discharge summary, prescription trail, and policy reference move through one explainable workflow.",
    requiredDocuments: ["Hospital bill", "Discharge summary", "Prescription", "Policy reference"],
    fraudFocus: [
      "Inflated room or procedure amount",
      "Cross-document diagnosis mismatch",
      "Edited or reused invoice",
      "Provider risk concentration",
    ],
    reviewerChecks: [
      "Procedure vs amount benchmark",
      "Document consistency across bill and discharge summary",
      "Provider and claimant pattern checks",
    ],
    payoutLabel: "Reimbursement transfer",
    statusHelp: "Small, document-heavy medical claims are ideal for straight-through automation when evidence quality is high.",
    mobileTitle: "Health reimbursement claim",
    claimantSummary: "Upload your hospital bill and treatment papers. We check the details and update you if anything is missing.",
    claimantChecklist: ["Hospital bill", "Discharge summary", "Prescription or doctor note", "Policy or member card"],
  },
  motor: {
    marketingLabel: "Minor motor damage",
    sampleProvider: "Rapid Auto Garage",
    sampleCity: "Bengaluru",
    sampleProcedure: "Rear bumper repair",
    heroSequence: [
      "Upload accident photos and estimate",
      "Damage severity is benchmarked",
      "Repair amount compared to baseline",
      "Low-risk repair moves to STP",
      "Suspicious patterns move to reviewer",
    ],
    evidenceTitle: "Motor claim evidence pack",
    evidenceDescription: "Accident photos, RC details, garage estimate, and policy coverage are reconciled together.",
    requiredDocuments: ["Accident photos", "Garage estimate", "RC or vehicle details", "Policy reference"],
    fraudFocus: [
      "Pre-existing damage claimed as new",
      "Repair estimate above damage pattern",
      "Repeated garage or surveyor cluster",
      "Vehicle identity mismatch",
    ],
    reviewerChecks: [
      "Damage pattern vs accident story",
      "Estimate vs benchmark repair band",
      "Garage concentration and prior claims",
    ],
    payoutLabel: "Garage settlement",
    statusHelp: "Minor motor damage is highly visual and works well when photos and repair estimates align cleanly.",
    mobileTitle: "Motor damage claim",
    claimantSummary: "Share clear damage photos and the repair estimate. We compare the damage and cost before moving ahead.",
    claimantChecklist: ["Damage photos", "Repair estimate", "Vehicle details", "Policy reference"],
  },
  home: {
    marketingLabel: "Home contents and repair",
    sampleProvider: "SafeHome Repair Works",
    sampleCity: "Delhi",
    sampleProcedure: "Water damage repair",
    heroSequence: [
      "Upload damage photos and repair quote",
      "Policy age and incident timing are checked",
      "Estimate benchmarked against damage type",
      "Early-policy claims move to verification",
      "Reviewer sees risk and coverage trace",
    ],
    evidenceTitle: "Property loss evidence pack",
    evidenceDescription: "Damage photos, repair estimates, and incident timing are evaluated against policy limits and age.",
    requiredDocuments: ["Damage photos", "Repair estimate", "Incident declaration", "Policy reference"],
    fraudFocus: [
      "Incident close to policy inception",
      "Repair estimate inflated above benchmark",
      "Address or property mismatch",
      "Repeated contractor network",
    ],
    reviewerChecks: [
      "Policy age and incident timing",
      "Repair estimate vs expected band",
      "Property address and contractor verification",
    ],
    payoutLabel: "Repair reimbursement",
    statusHelp: "Property claims need stronger timing and address validation because incident narratives are easier to backfill after policy purchase.",
    mobileTitle: "Home repair claim",
    claimantSummary: "Upload photos of the damage and the repair quote. We verify the timing and coverage before approval.",
    claimantChecklist: ["Damage photos", "Repair estimate", "Incident details", "Policy reference"],
  },
  life: {
    marketingLabel: "Life benefit verification",
    sampleProvider: "LifeAssist Verification Desk",
    sampleCity: "Hyderabad",
    sampleProcedure: "Nominee benefit validation",
    heroSequence: [
      "Nominee uploads policy and benefit documents",
      "Identity and beneficiary fields are reconciled",
      "High-stakes payout is kept human supervised",
      "Operations sees a complete audit trail",
      "Decision trace supports compliant closure",
    ],
    evidenceTitle: "Benefit verification pack",
    evidenceDescription: "Policy details, nominee identity, and payout entitlement are reconciled with a full audit trace.",
    requiredDocuments: ["Policy certificate", "Nominee ID", "Bank details", "Benefit verification documents"],
    fraudFocus: [
      "Identity mismatch across nominee records",
      "Bank and beneficiary inconsistency",
      "Document authenticity concerns",
      "High-criticality payout review",
    ],
    reviewerChecks: [
      "Beneficiary identity consistency",
      "Bank and policy holder validation",
      "Manual sign-off for high-criticality payout",
    ],
    payoutLabel: "Beneficiary disbursement",
    statusHelp: "Life claims remain human-supervised even with strong extraction confidence because payout criticality is high.",
    mobileTitle: "Life benefit claim",
    claimantSummary: "Share the policy, nominee identity, and bank details. We verify the records and keep you updated at each step.",
    claimantChecklist: ["Policy certificate", "Nominee ID", "Bank proof", "Benefit documents"],
  },
};

export function getPlaybook(type) {
  return (
    playbooks[type] || {
      marketingLabel: titleCase(type),
      heroSequence: [],
      evidenceTitle: "Claim evidence pack",
      evidenceDescription: "Claim documents and evidence move through one explainable workflow.",
      sampleProvider: "Claim provider",
      sampleCity: "Mumbai",
      sampleProcedure: `${titleCase(type)} claim`,
      requiredDocuments: ["Evidence", "Claim form", "Policy reference"],
      fraudFocus: [],
      reviewerChecks: [],
      payoutLabel: "Claim disbursement",
      statusHelp: "ClaimSwift keeps the workflow visible from intake to final decision.",
      mobileTitle: `${titleCase(type)} claim`,
      claimantSummary: "Upload your claim documents and we will guide you through the next step.",
      claimantChecklist: ["Claim documents", "Proof of loss", "Policy reference"],
    }
  );
}

export function getInsurancePalette(type) {
  return {
    health: "teal",
    motor: "blue",
    home: "amber",
    life: "navy",
  }[type] || "blue";
}
