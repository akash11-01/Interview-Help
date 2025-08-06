import { useUser } from "@clerk/clerk-react";
import { useCallback } from "react";

// Browser-compatible JWT creation using Web Crypto API with proper base64url encoding
const base64UrlEncode = (str: string) => {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

const createJWT = async (payload: any, secret: string) => {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const encoder = new TextEncoder();
  const headerBase64 = base64UrlEncode(JSON.stringify(header));
  const payloadBase64 = base64UrlEncode(JSON.stringify(payload));

  const data = `${headerBase64}.${payloadBase64}`;

  // Import the secret key
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  // Sign the data
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureArray = new Uint8Array(signature);
  const signatureBase64 = base64UrlEncode(
    String.fromCharCode(...signatureArray)
  );

  return `${data}.${signatureBase64}`;
};

export const useStreamToken = () => {
  const { user, isLoaded } = useUser();

  const generateToken = useCallback(async () => {
    if (!isLoaded || !user) {
      throw new Error("User not authenticated");
    }

    try {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        user_id: user.id,
        iss: import.meta.env.VITE_CLERK_FRONTEND_API_URL, // Use API key as issuer
        sub: user.id,
        iat: now,
        exp: now + 24 * 60 * 60, // 24 hours
      };

      // Use the Stream secret key from environment
      const secret = import.meta.env.VITE_STREAM_SECRET_KEY;

      if (!secret) {
        throw new Error("Stream secret key not found in environment variables");
      }

      const token = await createJWT(payload, secret);

      // console.log("Generated JWT token for user:", user.id);
      // console.log("Token payload:", payload);
      // console.log("Using API key:", import.meta.env.VITE_PUBLIC_STREAM_API_KEY);

      return token;
    } catch (error) {
      console.error("Token generation failed:", error);
      throw error;
    }
  }, [user, isLoaded]);

  return {
    generateToken,
    user,
    isLoaded,
    isReady: isLoaded && !!user,
  };
};
