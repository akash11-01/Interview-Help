export default {
  providers: [
    {
      // Use environment variable if available, fallback to hardcoded value
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ||
        "https://dynamic-yak-36.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
