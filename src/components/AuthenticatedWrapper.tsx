import { useUserRole } from "../hooks/useUserRole";
import RoleSelection from "./RoleSelection";
import LoaderUI from "./LoaderUI";
import { useState, useEffect } from "react";

interface AuthenticatedWrapperProps {
  children: React.ReactNode;
}

function AuthenticatedWrapper({ children }: AuthenticatedWrapperProps) {
  const { isLoading, hasRole } = useUserRole();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRoleSelected = () => {
    // Force a refresh by updating state
    setRefreshKey((prev) => prev + 1);
  };

  // Re-check role when refresh key changes
  useEffect(() => {
    // This effect will trigger a re-render when refreshKey changes
  }, [refreshKey]);

  if (isLoading) {
    return <LoaderUI />;
  }

  if (!hasRole) {
    return <RoleSelection onRoleSelected={handleRoleSelected} />;
  }

  return <>{children}</>;
}

export default AuthenticatedWrapper;
