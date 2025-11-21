import { useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

export const useUserRole = () => {
  const { user, isLoaded } = useUser();
  const [syncAttempted, setSyncAttempted] = useState(false);
  const syncUserWithClerkData = useMutation(api.users.syncUserWithClerkData);

  const userData = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // Sync user if they don't exist and we haven't attempted sync yet
  useEffect(() => {
    const syncUserIfNeeded = async () => {
      if (isLoaded && user && userData === null && !syncAttempted) {
        console.log("User not found in Convex, attempting to sync...");
        console.log("Full Clerk user object:", user);
        console.log("User properties:", {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          emailAddresses: user.emailAddresses,
          imageUrl: user.imageUrl,
          hasImage: user.hasImage,
          primaryEmailAddress: user.primaryEmailAddress,
        });

        setSyncAttempted(true);
        try {
          await syncUserWithClerkData({
            clerkId: user.id,
            firstName: user.firstName || undefined,
            lastName: user.lastName || undefined,
            fullName: user.fullName || undefined,
            email:
              user.primaryEmailAddress?.emailAddress ||
              user.emailAddresses?.[0]?.emailAddress ||
              undefined,
            imageUrl: user.imageUrl || undefined,
          });
          console.log("User sync successful");
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      }
    };

    syncUserIfNeeded();
  }, [isLoaded, user, userData, syncAttempted, syncUserWithClerkData]);

  const isLoading = !isLoaded || (user && userData === undefined);
  const hasRole = userData?.role !== undefined && userData?.role !== null;

  return {
    isLoading,
    hasRole,
    isInterviewer: userData?.role === "interviewer",
    isCandidate: userData?.role === "candidate",
    userData,
  };
};
