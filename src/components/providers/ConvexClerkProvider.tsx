"use client";

import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Custom useAuth with debugging
const useAuthWithDebug = () => {
  const auth = useAuth();

  // Add debugging when getting token
  const originalGetToken = auth.getToken;
  auth.getToken = async (options) => {
    const token = await originalGetToken.call(auth, options);
    // if (token) {
    //   // Decode JWT to see its contents (for debugging only)
    //   try {
    //     const payload = JSON.parse(atob(token.split(".")[1]));
    //     console.log("JWT Payload:", payload);
    //     console.log("Issuer:", payload.iss);
    //     console.log("Audience:", payload.aud);
    //   } catch (e) {
    //     console.log("Could not decode JWT for debugging");
    //   }
    // }
    return token;
  };

  return auth;
};

function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuthWithDebug}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

export default ConvexClerkProvider;
