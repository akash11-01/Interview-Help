import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useUserRole = () => {
  const { user, isLoaded } = useUser();

  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const isLoading = !isLoaded || userData === undefined;
  const hasRole = userData?.role !== undefined && userData?.role !== null;

  return {
    isLoading,
    hasRole,
    isInterviewer: userData?.role === "interviewer",
    isCandidate: userData?.role === "candidate",
    userData,
  };
};
