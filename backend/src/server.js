import http from "node:http";
import crypto from "node:crypto";
import { loadState, updateState } from "./store.js";

const PORT = Number(process.env.PORT || 4100);

function responseHeaders(requestId, extraHeaders = {}) {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Request-Id": requestId,
    ...extraHeaders,
  };
}

function json(res, statusCode, payload, requestId) {
  res.writeHead(statusCode, {
    ...responseHeaders(requestId),
  });
  res.end(JSON.stringify({ requestId, ...payload }));
}

function notFound(res, requestId) {
  json(res, 404, { error: "Not found" }, requestId);
}

function badRequest(res, message, requestId) {
  json(res, 400, { error: message }, requestId);
}

function unauthorized(res, message, requestId) {
  json(res, 401, { error: message }, requestId);
}

function forbidden(res, message, requestId) {
  json(res, 403, { error: message }, requestId);
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

function newId(prefix) {
  return `${prefix}-${crypto.randomBytes(8).toString("hex")}`;
}

function recordAuditEvent(state, event) {
  state.auditEvents = state.auditEvents || [];
  state.auditEvents.push({
    id: newId("audit"),
    at: new Date().toISOString(),
    actorId: event.actor?.id || "system",
    actorName: event.actor?.name || "System",
    actorRole: event.actor?.role || "system",
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId,
    outcome: event.outcome || "success",
    summary: event.summary,
    requestId: event.requestId,
  });
  state.auditEvents = state.auditEvents.slice(-250);
}

function authContext(state, req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
  if (!token) return { actor: null, session: null };

  const session = (state.sessions || []).find((item) => item.token === token);
  if (!session) return { actor: null, session: null };

  const user = (state.users || []).find((item) => item.id === session.userId);
  if (!user) return { actor: null, session: null };

  return {
    actor: sanitizeUser(user),
    session,
  };
}

function requirePermission(res, actor, permission, requestId) {
  if (!actor) {
    unauthorized(res, "Authentication required", requestId);
    return false;
  }
  if (permission && !actor.permissions?.includes(permission)) {
    forbidden(res, `Permission denied: ${permission}`, requestId);
    return false;
  }
  return true;
}

function formatAmount(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value || 0));
}

function statusLabel(status) {
  const map = {
    submitted: "Submitted",
    clarification_required: "Clarification required",
    verification_queue: "Verification queue",
    human_review: "Human review",
    approved_for_stp: "Approved for STP",
    settled: "Settled",
    closed: "Closed",
  };
  return map[status] || status;
}

function insuranceLabel(type) {
  return {
    health: "Health",
    motor: "Motor",
    home: "Home",
    life: "Life",
  }[type] || type;
}

function productLabelFor(type) {
  return {
    health: "Health reimbursement",
    motor: "Minor motor damage",
    home: "Home contents and repair",
    life: "Life benefit verification",
  }[type] || `${insuranceLabel(type)} claim`;
}

function intakeTemplate(type) {
  return {
    health: {
      providerName: "Sunrise Multispeciality Hospital",
      city: "Pune",
      procedure: "Outpatient reimbursement",
      requiredDocuments: ["hospital bill", "discharge summary", "policy reference"],
      claimantName: "Riya Sharma",
      defaultAmount: 22000,
    },
    motor: {
      providerName: "Rapid Auto Garage",
      city: "Bengaluru",
      procedure: "Rear bumper repair",
      requiredDocuments: ["accident photos", "garage estimate", "policy reference"],
      claimantName: "Rahul Menon",
      defaultAmount: 18200,
    },
    home: {
      providerName: "SafeHome Repair Works",
      city: "Delhi",
      procedure: "Water damage repair",
      requiredDocuments: ["damage photos", "repair estimate", "policy reference"],
      claimantName: "Priyanka Das",
      defaultAmount: 64000,
    },
    life: {
      providerName: "LifeAssist Verification Desk",
      city: "Hyderabad",
      procedure: "Nominee benefit validation",
      requiredDocuments: ["policy certificate", "nominee id", "bank proof"],
      claimantName: "Sonal Iyer",
      defaultAmount: 150000,
    },
  }[type] || {
    providerName: "Claim provider",
    city: "Mumbai",
    procedure: `${insuranceLabel(type)} claim`,
    requiredDocuments: ["evidence", "policy reference"],
    claimantName: "Demo Claimant",
    defaultAmount: 20000,
  };
}

function scenarioPreset(type, scenario, amount) {
  const byType = {
    health: {
      procedure: "Outpatient reimbursement",
      clarificationField: "invoice_total",
      clarificationValue: "INR 12,450 (?)",
      missingDocument: "discharge summary",
      mismatch: "Claim amount on form does not match extracted invoice total",
      reviewMismatch: "Doctor name on bill differs from prescription",
    },
    motor: {
      procedure: "Bumper and paint repair",
      clarificationField: "repair_estimate",
      clarificationValue: "INR 18,200 (?)",
      missingDocument: "garage estimate",
      mismatch: "Repair estimate does not match visible damage band",
      reviewMismatch: "Damage pattern is inconsistent with declared accident narrative",
    },
    home: {
      procedure: "Water damage repair",
      clarificationField: "incident_date",
      clarificationValue: "14 Mar 2026 (?)",
      missingDocument: "repair estimate",
      mismatch: "Incident timing and uploaded photos need manual confirmation",
      reviewMismatch: "Repair estimate is high for the stated property damage scope",
    },
    life: {
      procedure: "Nominee benefit validation",
      clarificationField: "beneficiary_name",
      clarificationValue: "Sonal Iyer (?)",
      missingDocument: "beneficiary bank proof",
      mismatch: "Beneficiary identity fields need manual confirmation",
      reviewMismatch: "Bank account and nominee identity need high-assurance review",
    },
  }[type] || {
    procedure: `${insuranceLabel(type)} claim`,
    clarificationField: "claim_field",
    clarificationValue: "Needs confirmation",
    missingDocument: "supporting evidence",
    mismatch: "Claim detail mismatch detected",
    reviewMismatch: "Claim requires enhanced review",
  };

  if (scenario === "clarification") {
    return {
      lowConfidenceFields: [
        { field: byType.clarificationField, value: byType.clarificationValue, confidence: 42, source: "uploaded_document" },
      ],
      missingDocuments: [byType.missingDocument],
      duplicateSimilarity: 0.18,
      providerRiskLevel: type === "life" ? "low" : "medium",
      documentSignals: {
        editedDocument: false,
        reusedDocument: false,
        totalMismatch: true,
        metadataModified: false,
      },
      crossDocumentMismatches: [byType.mismatch],
      explanationSummary: "The orchestration engine paused because a key field needs clarification before policy and fraud evaluation can finish safely.",
      timelineNotes: ["Claim created in clarification mode for demo recovery flow."],
    };
  }

  if (scenario === "review") {
    return {
      lowConfidenceFields: [],
      missingDocuments: [],
      duplicateSimilarity: type === "motor" ? 0.74 : 0.9,
      providerRiskLevel: type === "home" ? "medium" : "high",
      documentSignals: {
        editedDocument: true,
        reusedDocument: type !== "life",
        totalMismatch: true,
        metadataModified: true,
      },
      crossDocumentMismatches: [byType.mismatch, byType.reviewMismatch],
      explanationSummary: "The claim was intentionally created in escalated mode because the evidence pattern is unsafe for straight-through settlement.",
      timelineNotes: ["Claim created in reviewer mode for investigation workflow."],
    };
  }

  return {
    lowConfidenceFields: [],
    missingDocuments: [],
    duplicateSimilarity: type === "life" ? 0.02 : 0.08,
    providerRiskLevel: "low",
    documentSignals: {
      editedDocument: false,
      reusedDocument: false,
      totalMismatch: false,
      metadataModified: false,
    },
    crossDocumentMismatches: [],
    explanationSummary: `Low-risk ${insuranceLabel(type).toLowerCase()} claim created and routed toward straight-through processing.`,
    timelineNotes: [`Claim created in clean mode at ${formatAmount(amount)}.`],
  };
}

function normalizeDocName(name = "") {
  return String(name).toLowerCase().replace(/[_-]+/g, " ");
}

function inferRecognizedDocument(type, name) {
  const normalized = normalizeDocName(name);
  const dictionary = {
    health: [
      ["hospital bill", ["bill", "invoice", "hospital"]],
      ["discharge summary", ["discharge", "summary"]],
      ["policy reference", ["policy", "ecard", "card"]],
      ["prescription", ["prescription", "rx"]],
    ],
    motor: [
      ["accident photos", ["damage", "accident", "photo", "bumper"]],
      ["garage estimate", ["garage", "estimate", "repair", "quote"]],
      ["policy reference", ["policy", "rc", "vehicle"]],
    ],
    home: [
      ["damage photos", ["damage", "photo", "leak", "water"]],
      ["repair estimate", ["repair", "estimate", "quote", "invoice"]],
      ["policy reference", ["policy", "property"]],
    ],
    life: [
      ["policy certificate", ["policy", "certificate"]],
      ["nominee id", ["nominee", "id", "aadhaar", "pan"]],
      ["bank proof", ["bank", "cancelled", "cheque", "passbook"]],
    ],
  }[type] || [];

  for (const [label, patterns] of dictionary) {
    if (patterns.some((pattern) => normalized.includes(pattern))) return label;
  }

  return "supporting evidence";
}

function analyzeIntakePackage(type, documents = []) {
  const template = intakeTemplate(type);
  const names = documents.map((doc) => normalizeDocName(doc.name));
  const recognized = documents.map((doc) => ({
    ...doc,
    recognizedAs: inferRecognizedDocument(type, doc.name),
  }));

  const missingDocuments = template.requiredDocuments.filter(
    (required) => !recognized.some((doc) => doc.recognizedAs === required),
  );

  const hasBlurSignal = names.some((name) => /blur|unclear|scan|lowconf/.test(name));
  const hasReviewSignal = names.some((name) => /edited|tamper|fake|duplicate|suspicious|anomaly|investigate/.test(name));
  const scenario = hasReviewSignal ? "review" : hasBlurSignal || missingDocuments.length ? "clarification" : "clean";
  const preset = scenarioPreset(type, scenario, template.defaultAmount);
  const confidence = scenario === "clean" ? 91 : scenario === "clarification" ? 44 : 68;

  return {
    insuranceType: type,
    recommendedScenario: scenario,
    confidence,
    documents: recognized.map((doc) => ({
      name: doc.name,
      size: doc.size || 0,
      mimeType: doc.type || "application/octet-stream",
      recognizedAs: doc.recognizedAs,
      status: missingDocuments.includes(doc.recognizedAs) ? "warning" : "accepted",
    })),
    missingDocuments,
    lowConfidenceFields: preset.lowConfidenceFields,
    crossDocumentMismatches: preset.crossDocumentMismatches,
    explanation: preset.explanationSummary,
    extractedDraft: {
      insuranceType: type,
      scenario,
      claimantName: template.claimantName,
      providerName: template.providerName,
      city: template.city,
      procedure: template.procedure,
      claimAmount: template.defaultAmount,
      policyNumber: `POL-${type.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      policyAgeDays: type === "home" ? 36 : 120,
    },
  };
}

function riskBand(score) {
  if (score >= 70) return "high";
  if (score >= 35) return "medium";
  return "low";
}

function calculateFraudSignals(claim, state) {
  const rules = state.policyRules;
  const signals = [];

  if (claim.documentSignals.totalMismatch) {
    signals.push({ key: "amount_mismatch", label: "Claim total does not match extracted line items", severity: 12 });
  }
  if (claim.documentSignals.editedDocument) {
    signals.push({ key: "edited_document", label: "Document edit signal detected", severity: 18 });
  }
  if (claim.documentSignals.reusedDocument) {
    signals.push({ key: "reused_document", label: "Document similarity indicates prior reuse", severity: 22 });
  }
  if (claim.documentSignals.metadataModified) {
    signals.push({ key: "metadata_modified", label: "File metadata suggests post-generation edits", severity: 10 });
  }
  if (claim.duplicateSimilarity >= rules.duplicateSimilarityThreshold) {
    signals.push({ key: "duplicate_similarity", label: `Duplicate similarity ${(claim.duplicateSimilarity * 100).toFixed(0)}% exceeds threshold`, severity: 20 });
  }
  if (claim.providerRiskLevel === "high") {
    signals.push({ key: "provider_high_risk", label: "Provider is already in a high-risk band", severity: 16 });
  } else if (claim.providerRiskLevel === "medium") {
    signals.push({ key: "provider_medium_risk", label: "Provider requires baseline scrutiny", severity: 8 });
  }
  if (claim.benchmarkAmount && claim.claimAmount > claim.benchmarkAmount * 1.6) {
    signals.push({ key: "amount_outlier", label: "Claim amount is well above expected benchmark for this case type", severity: 16 });
  } else if (claim.benchmarkAmount && claim.claimAmount > claim.benchmarkAmount * 1.25) {
    signals.push({ key: "amount_watch", label: "Claim amount sits above the expected benchmark band", severity: 8 });
  }
  if ((claim.crossDocumentMismatches || []).length) {
    signals.push({ key: "cross_document_mismatch", label: `${claim.crossDocumentMismatches.length} cross-document mismatch${claim.crossDocumentMismatches.length > 1 ? "es" : ""} detected`, severity: 14 });
  }
  if (claim.policyAgeDays <= rules.policyAgeReviewDays) {
    signals.push({ key: "early_policy_claim", label: `Policy is only ${claim.policyAgeDays} days old`, severity: 12 });
  }
  if (String(claim.claimAmount).endsWith("00")) {
    signals.push({ key: "round_number_flag", label: "Round-number claim amount near a review threshold", severity: 6 });
  }

  return signals;
}

function buildActivities(claim, status, score) {
  if (claim.activities?.length) {
    return claim.activities;
  }

  const base = [
    { title: "Intake agent", status: "done", copy: "Claim package validated and claimant details normalized.", meta: "Completed" },
    { title: "Extraction agent", status: "done", copy: "Documents converted into structured claim fields.", meta: "Confidence checks complete" },
    { title: "Policy agent", status: "done", copy: "Coverage, policy age, and deductible rules evaluated.", meta: "Rules complete" },
    { title: "Fraud agent", status: score >= 35 ? "active" : "done", copy: "Risk signals benchmarked across document, provider, and pattern rules.", meta: `Risk score ${score}/100` },
  ];

  if (status === "approved_for_stp" || status === "settled") {
    base.push({ title: "Decision agent", status: "done", copy: "Claim qualifies for straight-through settlement.", meta: "Ready for payout" });
    base.push({ title: "Settlement agent", status: status === "settled" ? "done" : "pending", copy: "Payout initiation and claimant notification prepared.", meta: status === "settled" ? "Completed" : "Queued" });
    return base;
  }

  base.push({ title: "Decision agent", status: "waiting", copy: "Case requires manual verification before final disposition.", meta: "Pending review" });
  return base;
}

function evaluateClaim(rawClaim, state) {
  const claim = { ...rawClaim };
  const rules = state.policyRules;

  const fraudSignals = calculateFraudSignals(claim, state);
  const score = Math.min(100, fraudSignals.reduce((sum, item) => sum + item.severity, 0));
  const band = riskBand(score);
  const hasClarification = (claim.lowConfidenceFields || []).length > 0 || (claim.missingDocuments || []).length > 0;

  let status = claim.manualStatusOverride || claim.status;
  if (!claim.manualStatusOverride && status !== "settled" && status !== "closed") {
    if (hasClarification) {
      status = "clarification_required";
    } else if (claim.insuranceType === "life") {
      status = "human_review";
    } else if (score >= 70 || claim.claimAmount > rules.reviewAmountCap) {
      status = "human_review";
    } else if (score >= 35 || claim.policyAgeDays <= rules.policyAgeReviewDays) {
      status = "verification_queue";
    } else {
      status = "approved_for_stp";
    }
  }

  const deductibleApplied = claim.insuranceType === "life" ? 0 : rules.deductible;
  const payable = Math.max(claim.claimAmount - deductibleApplied, 0);
  const provider = state.providers.find((item) => item.id === claim.providerId);

  const explanation = {
    summary: claim.explanationSummary,
    payableAmount: payable,
    deductibleApplied,
    breakdown: [
      { label: "Claimed amount", value: claim.claimAmount, kind: "base" },
      { label: "Deductible applied", value: -deductibleApplied, kind: "deductible" },
      { label: "Final payable", value: payable, kind: "payable" },
    ],
    reasons: [
      `Insurance line: ${insuranceLabel(claim.insuranceType)}`,
      `Provider registry status: ${provider?.registryVerified ? "verified" : "unknown"}`,
      `Risk band: ${band}`,
      `Routing outcome: ${statusLabel(status)}`,
    ],
    signals: fraudSignals,
  };

  return {
    ...claim,
    status,
    statusLabel: statusLabel(status),
    insuranceLabel: insuranceLabel(claim.insuranceType),
    payableAmount: payable,
    deductibleApplied,
    fraudSignals,
    fraudScore: score,
    fraudBand: band,
    explanation,
    activities: buildActivities(claim, status, score),
    provider,
  };
}

function listClaims(state) {
  return state.claims
    .map((claim) => evaluateClaim(claim, state))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((claim) => ({
      ...claim,
      provider: undefined,
    }));
}

function getClaim(state, claimId) {
  const claim = state.claims.find((item) => item.id === claimId);
  if (!claim) return null;
  return evaluateClaim(claim, state);
}

function getDashboard(state) {
  const claims = state.claims.map((claim) => evaluateClaim(claim, state));
  const total = claims.length;
  const stp = claims.filter((claim) => claim.status === "approved_for_stp" || claim.status === "settled").length;
  const manual = claims.filter((claim) => claim.status === "human_review" || claim.status === "verification_queue").length;
  const clarification = claims.filter((claim) => claim.status === "clarification_required").length;
  const averageFraud = claims.reduce((sum, claim) => sum + claim.fraudScore, 0) / Math.max(1, total);
  const settled = claims.filter((claim) => claim.status === "settled").length;
  const monthly = [
    { month: "Oct", claims: 210, manual: 58, stp: 152 },
    { month: "Nov", claims: 245, manual: 52, stp: 193 },
    { month: "Dec", claims: 198, manual: 44, stp: 154 },
    { month: "Jan", claims: 280, manual: 42, stp: 238 },
    { month: "Feb", claims: 312, manual: 38, stp: 274 },
    { month: "Mar", claims: 287, manual: 32, stp: 255 },
  ];

  return {
    metrics: {
      claimsProcessed: total,
      stpRate: Math.round((stp / Math.max(1, total)) * 100),
      manualRate: Math.round((manual / Math.max(1, total)) * 100),
      clarificationRate: Math.round((clarification / Math.max(1, total)) * 100),
      settledCount: settled,
      avgFraudScore: Math.round(averageFraud),
      avgTatMinutes: 8,
      complaintReduction: 38,
      statusChecksAvoided: 80,
    },
    claimsByMonth: monthly,
    fraudRadar: [
      { subject: "Duplicate", A: Math.max(...claims.map((claim) => claim.duplicateSimilarity * 100)) || 0 },
      { subject: "Amount", A: 74 },
      { subject: "Provider", A: 68 },
      { subject: "Frequency", A: 55 },
      { subject: "Doc quality", A: 61 },
      { subject: "Timing", A: 43 },
    ],
    insights: [
      `Clarification rate: ${Math.round((clarification / Math.max(1, total)) * 100)}% of current claims need recovery flow`,
      "Most common fraud cue: duplicate invoice or evidence reuse",
      "Best STP candidates: low-value health and minor motor claims",
      "Provider review pressure is concentrated in one hospital cluster",
    ],
  };
}

function queueSummary(state) {
  const claims = state.claims.map((claim) => evaluateClaim(claim, state));
  return {
    clarification: claims.filter((claim) => claim.status === "clarification_required").length,
    verification: claims.filter((claim) => claim.status === "verification_queue").length,
    review: claims.filter((claim) => claim.status === "human_review").length,
    readyToSettle: claims.filter((claim) => claim.status === "approved_for_stp").length,
    settled: claims.filter((claim) => claim.status === "settled").length,
  };
}

function readiness(state) {
  const checks = [
    {
      key: "seed_state",
      label: "Runtime state loaded",
      status: state.claims?.length ? "pass" : "fail",
      detail: `${state.claims?.length || 0} claims available`,
    },
    {
      key: "user_directory",
      label: "User directory configured",
      status: state.users?.length ? "pass" : "fail",
      detail: `${state.users?.length || 0} operator accounts seeded`,
    },
    {
      key: "provider_registry",
      label: "Provider registry available",
      status: state.providers?.length ? "pass" : "fail",
      detail: `${state.providers?.length || 0} provider entries loaded`,
    },
    {
      key: "audit_stream",
      label: "Audit logging active",
      status: state.auditEvents?.length ? "pass" : "warn",
      detail: `${state.auditEvents?.length || 0} recent audit events retained`,
    },
  ];

  return {
    status: checks.some((check) => check.status === "fail") ? "degraded" : "ok",
    checks,
  };
}

function getPlatformOps(state) {
  const claims = listClaims(state);
  return {
    readiness: readiness(state),
    queue: queueSummary(state),
    claimsByStatus: claims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {}),
    sessions: {
      active: (state.sessions || []).length,
      users: (state.sessions || []).map((session) => {
        const user = state.users.find((item) => item.id === session.userId);
        return {
          sessionId: session.id,
          name: user?.name || "Unknown user",
          role: user?.role || "unknown",
          createdAt: session.createdAt,
        };
      }),
    },
    recentAuditEvents: [...(state.auditEvents || [])].slice(-12).reverse(),
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

function serializeBootstrap(state) {
  const claims = listClaims(state);
  const dashboard = getDashboard(state);

  return {
    claims,
    policyRules: state.policyRules,
    dashboard,
    featured: {
      clarificationId: claims.find((claim) => claim.status === "clarification_required")?.id || null,
      approvedId: claims.find((claim) => claim.status === "approved_for_stp")?.id || null,
      reviewId: claims.find((claim) => claim.status === "human_review" || claim.status === "verification_queue")?.id || null,
    },
  };
}

const server = http.createServer(async (req, res) => {
  const requestId = String(req.headers["x-request-id"] || newId("req"));

  if (req.method === "OPTIONS") {
    res.writeHead(204, responseHeaders(requestId));
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  if (req.method === "GET" && pathname === "/api/health") {
    json(res, 200, { ok: true, service: "claimswift-backend" }, requestId);
    return;
  }

  if (req.method === "GET" && pathname === "/api/ready") {
    const state = await loadState();
    json(res, 200, readiness(state), requestId);
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await readBody(req);
    if (!body?.email || !body?.password) {
      badRequest(res, "email and password are required", requestId);
      return;
    }

    const existingState = await loadState();
    const user = (existingState.users || []).find(
      (item) => item.email.toLowerCase() === String(body.email).toLowerCase() && item.password === body.password,
    );
    if (!user) {
      unauthorized(res, "Invalid credentials", requestId);
      return;
    }

    const token = crypto.randomBytes(24).toString("hex");
    const sessionId = newId("sess");

    const next = await updateState(async (state) => {
      state.sessions = [
        ...(state.sessions || []).filter((session) => session.userId !== user.id),
        {
          id: sessionId,
          token,
          userId: user.id,
          createdAt: new Date().toISOString(),
        },
      ];

      recordAuditEvent(state, {
        actor: sanitizeUser(user),
        action: "auth.login",
        entityType: "session",
        entityId: sessionId,
        summary: `${user.name} signed into the insurer workspace.`,
        requestId,
      });

      return state;
    });

    const safeUser = sanitizeUser(next.users.find((item) => item.id === user.id));
    json(res, 200, { token, user: safeUser }, requestId);
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    const state = await loadState();
    const { actor, session } = authContext(state, req);
    if (!requirePermission(res, actor, null, requestId)) return;

    const next = await updateState(async (draft) => {
      draft.sessions = (draft.sessions || []).filter((item) => item.id !== session.id);
      recordAuditEvent(draft, {
        actor,
        action: "auth.logout",
        entityType: "session",
        entityId: session.id,
        summary: `${actor.name} signed out of the insurer workspace.`,
        requestId,
      });
      return draft;
    });

    json(res, 200, { ok: true, remainingSessions: next.sessions.length }, requestId);
    return;
  }

  if (req.method === "GET" && pathname === "/api/auth/me") {
    const state = await loadState();
    const { actor } = authContext(state, req);
    if (!requirePermission(res, actor, null, requestId)) return;
    json(res, 200, { user: actor }, requestId);
    return;
  }

  const state = await loadState();
  const { actor } = authContext(state, req);

  if (req.method === "GET" && pathname === "/api/bootstrap") {
    if (!requirePermission(res, actor, "claims:read", requestId)) return;
    json(res, 200, serializeBootstrap(state), requestId);
    return;
  }

  if (req.method === "POST" && pathname === "/api/intake/analyze") {
    if (!requirePermission(res, actor, "claims:create", requestId)) return;
    const body = await readBody(req);
    if (!body || !body.insuranceType) {
      badRequest(res, "insuranceType is required", requestId);
      return;
    }

    const analysis = analyzeIntakePackage(body.insuranceType, body.documents || []);
    json(res, 200, { analysis }, requestId);
    return;
  }

  if (req.method === "GET" && pathname === "/api/claims") {
    if (!requirePermission(res, actor, "claims:read", requestId)) return;
    json(res, 200, { claims: listClaims(state) }, requestId);
    return;
  }

  if (req.method === "POST" && pathname === "/api/claims") {
    if (!requirePermission(res, actor, "claims:create", requestId)) return;
    const body = await readBody(req);
    if (!body) {
      badRequest(res, "Invalid JSON body", requestId);
      return;
    }

    const required = ["insuranceType", "claimantName", "providerName", "claimAmount", "policyNumber"];
    const missing = required.filter((field) => !body[field]);
    if (missing.length) {
      badRequest(res, `Missing fields: ${missing.join(", ")}`, requestId);
      return;
    }

    const next = await updateState(async (draft) => {
      const count = draft.claims.length + 1;
      const id = `CLM-2026-${String(6000 + count).padStart(4, "0")}`;
      const providerId = `prov-${id.toLowerCase()}`;
      const scenario = body.scenario || "clean";
      const amount = Number(body.claimAmount);
      const preset = scenarioPreset(body.insuranceType, scenario, amount);
      const procedure = body.procedure || preset.procedure;
      const benchmarkAmount = Number(body.benchmarkAmount || Math.round(amount * (scenario === "review" ? 0.52 : scenario === "clarification" ? 0.72 : 0.88)));

      draft.providers.push({
        id: providerId,
        name: body.providerName,
        city: body.city || "Unknown",
        registryVerified: true,
        gstValid: true,
        riskLevel: preset.providerRiskLevel,
      });

      draft.claims.push({
        id,
        insuranceType: body.insuranceType,
        productLabel: body.productLabel || productLabelFor(body.insuranceType),
        claimantName: body.claimantName,
        policyHolderName: body.claimantName,
        providerId,
        providerName: body.providerName,
        city: body.city || "Unknown",
        procedure,
        claimAmount: amount,
        benchmarkAmount,
        policyNumber: body.policyNumber,
        policyAgeDays: Number(body.policyAgeDays || 120),
        incidentDate: body.incidentDate || new Date().toISOString().slice(0, 10),
        admissionDate: body.admissionDate || null,
        submittedAt: new Date().toISOString(),
        status: "submitted",
        lowConfidenceFields: body.lowConfidenceFields || preset.lowConfidenceFields,
        missingDocuments: body.missingDocuments || preset.missingDocuments,
        duplicateSimilarity: Number(body.duplicateSimilarity ?? preset.duplicateSimilarity),
        providerRiskLevel: body.providerRiskLevel || preset.providerRiskLevel,
        documentSignals: body.documentSignals || preset.documentSignals,
        crossDocumentMismatches: body.crossDocumentMismatches || preset.crossDocumentMismatches,
        explanationSummary: body.explanationSummary || preset.explanationSummary,
        activities: [],
        timelineNotes: preset.timelineNotes,
        reviewNotes: [],
      });

      recordAuditEvent(draft, {
        actor,
        action: "claim.create",
        entityType: "claim",
        entityId: id,
        summary: `${actor.name} created ${body.insuranceType} claim ${id} in ${scenario} mode.`,
        requestId,
      });

      return draft;
    });

    const created = listClaims(next).at(-1);
    json(res, 201, { claim: created, bootstrap: serializeBootstrap(next) }, requestId);
    return;
  }

  if (req.method === "GET" && pathname === "/api/dashboard/metrics") {
    if (!requirePermission(res, actor, "analytics:read", requestId)) return;
    json(res, 200, getDashboard(state), requestId);
    return;
  }

  if (req.method === "GET" && pathname === "/api/policy/rules") {
    if (!requirePermission(res, actor, "policy:read", requestId)) return;
    json(res, 200, { policyRules: state.policyRules }, requestId);
    return;
  }

  if (req.method === "POST" && pathname === "/api/policy/rules") {
    if (!requirePermission(res, actor, "policy:write", requestId)) return;
    const body = await readBody(req);
    if (!body) {
      badRequest(res, "Invalid JSON body", requestId);
      return;
    }

    const next = await updateState(async (draft) => {
      draft.policyRules = {
        ...draft.policyRules,
        ...body,
        toggles: {
          ...draft.policyRules.toggles,
          ...(body.toggles || {}),
        },
      };
      recordAuditEvent(draft, {
        actor,
        action: "policy.rules.update",
        entityType: "policy_rules",
        entityId: "default",
        summary: `${actor.name} updated policy engine configuration.`,
        requestId,
      });
      return draft;
    });

    json(res, 200, { policyRules: next.policyRules, bootstrap: serializeBootstrap(next) }, requestId);
    return;
  }

  if (req.method === "GET" && pathname === "/api/platform/ops") {
    if (!requirePermission(res, actor, "platform:read", requestId)) return;
    json(res, 200, { ops: getPlatformOps(state) }, requestId);
    return;
  }

  if (req.method === "GET" && pathname === "/api/audit/events") {
    if (!requirePermission(res, actor, "audit:read", requestId)) return;
    json(res, 200, { events: [...(state.auditEvents || [])].slice(-50).reverse() }, requestId);
    return;
  }

  const claimMatch = pathname.match(/^\/api\/claims\/([^/]+)$/);
  if (req.method === "GET" && claimMatch) {
    if (!requirePermission(res, actor, "claims:read", requestId)) return;
    const claim = getClaim(state, decodeURIComponent(claimMatch[1]));
    if (!claim) {
      notFound(res, requestId);
      return;
    }

    json(res, 200, { claim }, requestId);
    return;
  }

  const explanationMatch = pathname.match(/^\/api\/claims\/([^/]+)\/explanation$/);
  if (req.method === "GET" && explanationMatch) {
    if (!requirePermission(res, actor, "claims:read", requestId)) return;
    const claim = getClaim(state, decodeURIComponent(explanationMatch[1]));
    if (!claim) {
      notFound(res, requestId);
      return;
    }

    json(res, 200, { explanation: claim.explanation }, requestId);
    return;
  }

  const clarifyMatch = pathname.match(/^\/api\/claims\/([^/]+)\/clarifications$/);
  if (req.method === "POST" && clarifyMatch) {
    if (!requirePermission(res, actor, "claims:clarify", requestId)) return;
    const claimId = decodeURIComponent(clarifyMatch[1]);
    const body = await readBody(req);
    if (!body) {
      badRequest(res, "Invalid JSON body", requestId);
      return;
    }

    const next = await updateState(async (draft) => {
      const claim = draft.claims.find((item) => item.id === claimId);
      if (!claim) return draft;

      claim.lowConfidenceFields = [];
      claim.missingDocuments = [];
      claim.crossDocumentMismatches = [];
      claim.documentSignals.totalMismatch = false;
      claim.manualStatusOverride = null;
      claim.explanationSummary = "Claimant clarified the missing billing information and the workflow resumed safely.";
      claim.timelineNotes = [
        ...(claim.timelineNotes || []),
        `Clarification received: ${body.invoiceAmount ? `invoice confirmed at INR ${body.invoiceAmount}` : "claimant confirmed required values"}.`,
      ];
      if (body.invoiceAmount) {
        claim.claimAmount = Number(body.invoiceAmount);
        claim.benchmarkAmount = Number(body.invoiceAmount);
      }
      claim.activities = [
        { title: "Intake agent", status: "done", copy: "Claim package validated — all required documents present.", meta: "Completed" },
        { title: "Extraction agent", status: "done", copy: "Manual clarification accepted and low-confidence fields resolved.", meta: "Confidence recovered" },
        { title: "Policy agent", status: "done", copy: "Coverage matched and deductible applied successfully.", meta: "Eligible" },
        { title: "Fraud agent", status: "done", copy: "Duplicate and provider checks passed after clarification.", meta: "Low risk" },
        { title: "Decision agent", status: "active", copy: "Claim returned to the straight-through settlement path.", meta: "Running now" },
        { title: "Settlement agent", status: "pending", copy: "Payout and claimant notification are queued.", meta: "Final step" },
      ];

      recordAuditEvent(draft, {
        actor,
        action: "claim.clarification_resolved",
        entityType: "claim",
        entityId: claimId,
        summary: `${actor.name} resolved clarification inputs for ${claimId}.`,
        requestId,
      });

      return draft;
    });

    const claim = getClaim(next, claimId);
    if (!claim) {
      notFound(res, requestId);
      return;
    }

    json(res, 200, { claim, bootstrap: serializeBootstrap(next) }, requestId);
    return;
  }

  const reviewMatch = pathname.match(/^\/api\/claims\/([^/]+)\/review$/);
  if (req.method === "POST" && reviewMatch) {
    if (!requirePermission(res, actor, "claims:review", requestId)) return;
    const claimId = decodeURIComponent(reviewMatch[1]);
    const body = await readBody(req);
    if (!body || !body.action) {
      badRequest(res, "Review action is required", requestId);
      return;
    }

    const next = await updateState(async (draft) => {
      const claim = draft.claims.find((item) => item.id === claimId);
      if (!claim) return draft;

      claim.reviewNotes = [
        ...(claim.reviewNotes || []),
        {
          action: body.action,
          comment: body.comment || "",
          actorName: actor.name,
          actorRole: actor.role,
          createdAt: new Date().toISOString(),
        },
      ];

      if (body.action === "approve") {
        claim.status = "approved_for_stp";
        claim.manualStatusOverride = "approved_for_stp";
        claim.explanationSummary = "Reviewer approved the claim after investigating the risk signals.";
      } else if (body.action === "reject") {
        claim.status = "closed";
        claim.manualStatusOverride = "closed";
        claim.explanationSummary = "Reviewer rejected the claim and moved it out of the payout workflow.";
      } else {
        claim.status = "verification_queue";
        claim.manualStatusOverride = "verification_queue";
        claim.explanationSummary = "Reviewer kept the claim in a controlled verification queue.";
      }

      claim.activities = [];
      claim.timelineNotes = [
        ...(claim.timelineNotes || []),
        `Reviewer action recorded: ${body.action}.`,
      ];

      recordAuditEvent(draft, {
        actor,
        action: `claim.review.${body.action}`,
        entityType: "claim",
        entityId: claimId,
        summary: `${actor.name} recorded reviewer action ${body.action} for ${claimId}.`,
        requestId,
      });

      return draft;
    });

    const claim = getClaim(next, claimId);
    if (!claim) {
      notFound(res, requestId);
      return;
    }

    json(res, 200, { claim, bootstrap: serializeBootstrap(next) }, requestId);
    return;
  }

  const settleMatch = pathname.match(/^\/api\/claims\/([^/]+)\/settle$/);
  if (req.method === "POST" && settleMatch) {
    if (!requirePermission(res, actor, "claims:settle", requestId)) return;
    const claimId = decodeURIComponent(settleMatch[1]);

    const next = await updateState(async (draft) => {
      const claim = draft.claims.find((item) => item.id === claimId);
      if (!claim) return draft;
      claim.status = "settled";
      claim.manualStatusOverride = "settled";
      claim.timelineNotes = [
        ...(claim.timelineNotes || []),
        "Settlement simulation completed and claimant notification sent.",
      ];
      claim.activities = [];
      recordAuditEvent(draft, {
        actor,
        action: "claim.settle",
        entityType: "claim",
        entityId: claimId,
        summary: `${actor.name} triggered settlement for ${claimId}.`,
        requestId,
      });
      return draft;
    });

    const claim = getClaim(next, claimId);
    if (!claim) {
      notFound(res, requestId);
      return;
    }

    json(res, 200, { claim, bootstrap: serializeBootstrap(next) }, requestId);
    return;
  }

  notFound(res, requestId);
});

server.listen(PORT, () => {
  console.log(`ClaimSwift backend listening on http://localhost:${PORT}`);
});
