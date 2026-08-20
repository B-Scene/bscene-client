import { Navigate } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/api/onboarding/useOnboarding";

export const ModeGuard = ({
  allowedMode,
  children,
}: {
  allowedMode: "FAN" | "BAND";
  children: React.ReactNode;
}) => {
  const { data: onboardingStatus, isLoading } = useOnboardingStatus();

  if (isLoading) return null;

  const currentMode = onboardingStatus?.currentMode;

  if (!currentMode) {
    return <Navigate to="/onboarding/mode" replace />;
  }

  if (currentMode !== allowedMode) {
    return (
      <Navigate
        to={currentMode === "BAND" ? "/band/home" : "/fan/home"}
        replace
      />
    );
  }

  return children;
};
