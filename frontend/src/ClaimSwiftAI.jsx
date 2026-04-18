import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "./api";
import GlobalStyles from "./claimswift/components/GlobalStyles";
import DashboardLayout from "./claimswift/components/DashboardLayout";
import { ToastContainer } from "./claimswift/components/ui";
import { useToasts } from "./claimswift/hooks";
import {
  AnalyticsScreen,
  DecisionScreen,
  FraudScreen,
  IntakeScreen,
  LandingScreen,
  LoginScreen,
  MobileClarificationScreen,
  MobileHomeScreen,
  OperationsScreen,
  PolicyScreen,
  ReviewerScreen,
} from "./claimswift/pages";

function getModeFromClaim(claim) {
  if (!claim) return "clarification";
  if (claim.status === "human_review" || claim.status === "verification_queue" || claim.fraudBand === "high") return "review";
  if (claim.status === "clarification_required") return "clarification";
  return "approved";
}

function defaultScreenForUser(user) {
  if (!user?.permissions?.length) return "landing";
  if (user.permissions.includes("platform:read")) return "operations";
  if (user.permissions.includes("claims:review")) return "reviewer";
  if (user.permissions.includes("claims:create")) return "intake";
  if (user.permissions.includes("analytics:read")) return "analytics";
  return "intake";
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [intakeMode, setIntakeMode] = useState("clarification");
  const [bootstrap, setBootstrap] = useState(null);
  const [platformOps, setPlatformOps] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState(null);
  const [decisionClaimId, setDecisionClaimId] = useState(null);
  const [reviewClaimId, setReviewClaimId] = useState(null);
  const [clarificationClaimId, setClarificationClaimId] = useState(null);
  const { toasts, addToast } = useToasts();

  const loadPlatformOps = useCallback(async () => {
    try {
      const next = await api.getPlatformOps();
      setPlatformOps(next.ops);
    } catch {
      setPlatformOps(null);
    }
  }, []);

  const loadBootstrap = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [next, ops] = await Promise.all([
        api.getBootstrap(),
        api.getPlatformOps().catch(() => null),
      ]);
      setBootstrap(next);
      setPlatformOps(ops?.ops || null);
      setDecisionClaimId((current) => current || next.featured.approvedId);
      setReviewClaimId((current) => current || next.featured.reviewId);
      setClarificationClaimId((current) => current || next.featured.clarificationId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!api.hasSession()) {
        if (active) setAuthLoading(false);
        return;
      }

      try {
        const me = await api.getMe();
        if (!active) return;
        setUser(me.user);
        setScreen(defaultScreenForUser(me.user));
        await loadBootstrap();
      } catch {
        if (!active) return;
        setUser(null);
        setBootstrap(null);
      } finally {
        if (active) setAuthLoading(false);
      }
    };

    restoreSession();
    return () => {
      active = false;
    };
  }, [loadBootstrap]);

  const claims = bootstrap?.claims || [];
  const dashboard = bootstrap?.dashboard;
  const policyRules = bootstrap?.policyRules;
  const claimsById = useMemo(
    () => Object.fromEntries(claims.map((claim) => [claim.id, claim])),
    [claims],
  );

  const clarificationClaim = claimsById[clarificationClaimId] || claims.find((claim) => claim.status === "clarification_required") || null;
  const approvedClaim = claimsById[decisionClaimId] || claims.find((claim) => claim.status === "approved_for_stp" || claim.status === "settled") || claims[0] || null;
  const reviewQueue = claims.filter((claim) => claim.status === "human_review" || claim.status === "verification_queue");
  const activeReviewClaim = claimsById[reviewClaimId] || reviewQueue[0] || null;
  const intakeClaim = intakeMode === "approved" ? approvedClaim : intakeMode === "review" ? activeReviewClaim : clarificationClaim;
  const decisionClaims = claims;
  const permissions = user?.permissions || [];
  const homeScreen = defaultScreenForUser(user);

  useEffect(() => {
    if (!user) return;
    if (screen === "landing") {
      setScreen(homeScreen);
      return;
    }

    const permissionMap = {
      intake: "claims:read",
      decision: "claims:read",
      reviewer: "claims:review",
      fraud: "claims:read",
      policy: "policy:read",
      operations: "platform:read",
      analytics: "analytics:read",
      mobileHome: "claims:read",
      mobileClarification: "claims:clarify",
    };

    const requiredPermission = permissionMap[screen];
    if (requiredPermission && !permissions.includes(requiredPermission)) {
      setScreen(homeScreen);
    }
  }, [homeScreen, permissions, screen, user]);

  const progressSummary = useMemo(() => {
    if (!intakeClaim?.activities?.length) {
      return { completed: "No active workflow", stage: "Current stage: Waiting for claim data" };
    }

    const completed = intakeClaim.activities.filter((step) => step.status === "done").length;
    return {
      completed: `${completed} of ${intakeClaim.activities.length} checks complete`,
      stage: `Current stage: ${intakeClaim.statusLabel}`,
    };
  }, [intakeClaim]);

  const navigate = useCallback((id) => setScreen(id), []);

  const openDecision = useCallback(
    (mode) => {
      setIntakeMode(mode);
      if (mode === "review" && activeReviewClaim) {
        setReviewClaimId(activeReviewClaim.id);
        setScreen("reviewer");
        addToast(`Claim ${activeReviewClaim.id} opened in reviewer queue`, "rose");
        return;
      }

      if (approvedClaim) {
        setDecisionClaimId(approvedClaim.id);
        setScreen("decision");
        addToast(`Decision workspace opened for ${approvedClaim.id}`, "blue");
      }
    },
    [activeReviewClaim, addToast, approvedClaim],
  );

  const handleClarification = useCallback(() => {
    if (!clarificationClaim) return;
    setClarificationClaimId(clarificationClaim.id);
    setIntakeMode("clarification");
    setScreen("mobileClarification");
  }, [clarificationClaim]);

  const handleSelectIntakeClaim = useCallback(
    (claimId) => {
      const selected = claimsById[claimId];
      if (!selected) return;
      setIntakeMode(getModeFromClaim(selected));
      if (selected.status === "clarification_required") setClarificationClaimId(selected.id);
      if (selected.status === "human_review" || selected.status === "verification_queue") setReviewClaimId(selected.id);
      setDecisionClaimId(selected.id);
    },
    [claimsById],
  );

  const handleSelectDecisionClaim = useCallback((claimId) => {
    setDecisionClaimId(claimId);
  }, []);

  const handleSubmitClarification = useCallback(
    async (invoiceAmount) => {
      if (!clarificationClaim) return;
      try {
        const next = await api.submitClarification(clarificationClaim.id, { invoiceAmount });
        setBootstrap(next.bootstrap);
        await loadPlatformOps();
        setDecisionClaimId(next.claim.id);
        setClarificationClaimId(null);
        setIntakeMode("approved");
        setScreen("decision");
        addToast(`Clarification accepted for ${next.claim.id}`, "teal");
      } catch (err) {
        addToast(err.message, "rose");
      }
    },
    [addToast, clarificationClaim, loadPlatformOps],
  );

  const handleReviewAction = useCallback(
    async (action) => {
      if (!activeReviewClaim) return;
      try {
        const next = await api.reviewClaim(activeReviewClaim.id, { action });
        setBootstrap(next.bootstrap);
        await loadPlatformOps();
        if (action === "approve") {
          setDecisionClaimId(next.claim.id);
          setScreen("decision");
        }
        addToast(`Reviewer action recorded: ${action}`, action === "reject" ? "rose" : "teal");
      } catch (err) {
        addToast(err.message, "rose");
      }
    },
    [activeReviewClaim, addToast, loadPlatformOps],
  );

  const handleSettle = useCallback(async () => {
    if (!approvedClaim) return;
    try {
      const next = await api.settleClaim(approvedClaim.id);
      setBootstrap(next.bootstrap);
      await loadPlatformOps();
      setDecisionClaimId(next.claim.id);
      addToast(`Settlement simulated for ${next.claim.id}`, "teal");
    } catch (err) {
      addToast(err.message, "rose");
    }
  }, [addToast, approvedClaim, loadPlatformOps]);

  const handleSaveRules = useCallback(
    async (nextRules) => {
      try {
        const next = await api.savePolicyRules(nextRules);
        setBootstrap(next.bootstrap);
        await loadPlatformOps();
        addToast("Policy rules saved and applied", "teal");
      } catch (err) {
        addToast(err.message, "rose");
      }
    },
    [addToast, loadPlatformOps],
  );

  const handleCreateClaim = useCallback(
    async (payload) => {
      try {
        const next = await api.createClaim(payload);
        setBootstrap(next.bootstrap);
        await loadPlatformOps();
        setDecisionClaimId(next.claim.id);
        if (next.claim.status === "clarification_required") {
          setClarificationClaimId(next.claim.id);
        }
        if (next.claim.status === "human_review" || next.claim.status === "verification_queue") {
          setReviewClaimId(next.claim.id);
        }
        setIntakeMode(getModeFromClaim(next.claim));
        setScreen("intake");
        addToast(`Claim ${next.claim.id} created`, "teal");
      } catch (err) {
        addToast(err.message, "rose");
      }
    },
    [addToast, loadPlatformOps],
  );

  const handleAnalyzeIntake = useCallback(
    async (payload) => {
      try {
        return await api.analyzeIntake(payload);
      } catch (err) {
        addToast(err.message, "rose");
        throw err;
      }
    },
    [addToast],
  );

  const handleLogin = useCallback(
    async ({ email, password }) => {
      setAuthLoading(true);
      setAuthError("");
      try {
        const next = await api.login(email, password);
        setDecisionClaimId(null);
        setReviewClaimId(null);
        setClarificationClaimId(null);
        setUser(next.user);
        setScreen(defaultScreenForUser(next.user));
        await loadBootstrap();
        addToast(`Signed in as ${next.user.name}`, "teal");
      } catch (err) {
        setAuthError(err.message);
      } finally {
        setAuthLoading(false);
      }
    },
    [addToast, loadBootstrap],
  );

  const handleLogout = useCallback(async () => {
    try {
      await api.logout();
    } catch {}
    setUser(null);
    setBootstrap(null);
    setPlatformOps(null);
    setDecisionClaimId(null);
    setReviewClaimId(null);
    setClarificationClaimId(null);
    setError("");
    setAuthError("");
    setLoading(false);
    setScreen("landing");
  }, []);

  if (!user) {
    return (
      <>
        <GlobalStyles />
        <LoginScreen onLogin={handleLogin} error={authError} loading={authLoading} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  if (screen === "landing") {
    return (
      <>
        <GlobalStyles />
        <LandingScreen
          dashboard={dashboard}
          onPrimary={() => setScreen("intake")}
          onSecondary={permissions.includes("claims:review") ? () => {
            if (activeReviewClaim) setReviewClaimId(activeReviewClaim.id);
            setScreen("reviewer");
          } : () => setScreen("operations")}
          secondaryLabel={permissions.includes("claims:review") ? "View reviewer path" : "Open operations console"}
        />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  const screens = {
    intake: (
      <IntakeScreen
        claim={intakeClaim}
        claimOptions={claims}
        onSelectClaim={handleSelectIntakeClaim}
        intakeMode={intakeMode}
        setIntakeMode={setIntakeMode}
        onRunDecision={() => openDecision("approved")}
        onClarification={handleClarification}
        onReview={() => openDecision("review")}
        onAnalyzeIntake={handleAnalyzeIntake}
        onCreateClaim={handleCreateClaim}
        steps={intakeClaim?.activities || []}
        progressSummary={progressSummary}
        canCreateClaim={permissions.includes("claims:create")}
        canClarifyClaim={permissions.includes("claims:clarify")}
        canRouteReview={permissions.includes("claims:review")}
      />
    ),
    decision: (
      <DecisionScreen
        claim={approvedClaim}
        claimOptions={decisionClaims}
        onSelectClaim={handleSelectDecisionClaim}
        policyRules={policyRules}
        onShowReview={() => setScreen("reviewer")}
        onSettle={handleSettle}
        canOpenReview={permissions.includes("claims:review")}
        canSettle={permissions.includes("claims:settle")}
      />
    ),
    reviewer: (
      <ReviewerScreen
        claim={activeReviewClaim}
        queueClaims={reviewQueue}
        onSelectClaim={setReviewClaimId}
        onShowFraud={() => setScreen("fraud")}
        onReviewAction={handleReviewAction}
        canReview={permissions.includes("claims:review")}
      />
    ),
    fraud: <FraudScreen claim={activeReviewClaim} queueClaims={reviewQueue} onSelectClaim={setReviewClaimId} onShowAnalytics={() => setScreen("analytics")} />,
    policy: <PolicyScreen policyRules={policyRules} onSave={handleSaveRules} addToast={addToast} canEditRules={permissions.includes("policy:write")} />,
    analytics: <AnalyticsScreen dashboard={dashboard} />,
    operations: <OperationsScreen ops={platformOps} user={user} />,
    mobileHome: <MobileHomeScreen claims={claims} dashboard={dashboard} />,
    mobileClarification: (
      <MobileClarificationScreen
        claim={clarificationClaim}
        onResume={handleSubmitClarification}
      />
    ),
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh" }}>
        <DashboardLayout
          screen={screen}
          onNavigate={navigate}
          user={user}
          onLogout={handleLogout}
          readinessStatus={platformOps?.readiness?.status}
          sessionCount={platformOps?.sessions?.active}
        >
          {loading ? <div style={{ padding: 24, fontWeight: 700 }}>Loading ClaimSwift workspace…</div> : error ? <div style={{ padding: 24, color: "#c24d2c", fontWeight: 700 }}>Unable to load data: {error}</div> : screens[screen] ?? null}
        </DashboardLayout>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  );
}
