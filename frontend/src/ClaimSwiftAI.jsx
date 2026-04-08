import { useCallback, useMemo, useState } from "react";
import GlobalStyles from "./claimswift/components/GlobalStyles";
import DashboardLayout from "./claimswift/components/DashboardLayout";
import { ToastContainer } from "./claimswift/components/ui";
import { approvedSteps, clarificationSteps, reviewSteps } from "./claimswift/data";
import { useToasts } from "./claimswift/hooks";
import {
  AnalyticsScreen,
  DecisionScreen,
  FraudScreen,
  IntakeScreen,
  LandingScreen,
  MobileClarificationScreen,
  MobileHomeScreen,
  PolicyScreen,
  ReviewerScreen,
} from "./claimswift/pages";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [intakeMode, setIntakeMode] = useState("clarification");
  const { toasts, addToast } = useToasts();

  const intakeSteps = useMemo(() => {
    if (intakeMode === "approved") return approvedSteps;
    if (intakeMode === "review") return reviewSteps;
    return clarificationSteps;
  }, [intakeMode]);

  const progressSummary = useMemo(() => {
    if (intakeMode === "approved") return { completed: "5 of 6 checks complete", stage: "Current stage: Decision prepared" };
    if (intakeMode === "review") return { completed: "5 of 6 checks complete", stage: "Current stage: Manual review required" };
    return { completed: "3 of 6 checks complete", stage: "Current stage: Clarification required" };
  }, [intakeMode]);

  const navigate = useCallback((id) => setScreen(id), []);

  const openDecision = useCallback(
    (mode) => {
      setIntakeMode(mode);
      setScreen(mode === "review" ? "reviewer" : "decision");
      addToast(mode === "review" ? "Claim escalated to reviewer queue" : "Decision orchestrator running…", mode === "review" ? "rose" : "blue");
    },
    [addToast],
  );

  const handleClarification = useCallback(() => {
    setIntakeMode("clarification");
    setScreen("mobileClarification");
  }, []);

  if (screen === "landing") {
    return (
      <>
        <GlobalStyles />
        <LandingScreen onPrimary={() => setScreen("intake")} onSecondary={() => setScreen("reviewer")} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  const screens = {
    intake: (
      <IntakeScreen
        intakeMode={intakeMode}
        setIntakeMode={setIntakeMode}
        onRunDecision={() => openDecision("approved")}
        onClarification={handleClarification}
        onReview={() => openDecision("review")}
        steps={intakeSteps}
        progressSummary={progressSummary}
      />
    ),
    decision: <DecisionScreen onShowReview={() => setScreen("reviewer")} addToast={addToast} />,
    reviewer: <ReviewerScreen onShowFraud={() => setScreen("fraud")} addToast={addToast} />,
    fraud: <FraudScreen onShowAnalytics={() => setScreen("analytics")} />,
    policy: <PolicyScreen addToast={addToast} />,
    analytics: <AnalyticsScreen />,
    mobileHome: <MobileHomeScreen />,
    mobileClarification: (
      <MobileClarificationScreen
        onResume={() => {
          setIntakeMode("approved");
          setScreen("decision");
          addToast("Clarification accepted — claim resumed", "teal");
        }}
      />
    ),
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh" }}>
        <DashboardLayout screen={screen} onNavigate={navigate}>
          {screens[screen] ?? null}
        </DashboardLayout>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  );
}
