// Environment variable validation utility

interface EnvConfig {
  // Clerk Authentication
  VITE_CLERK_PUBLISHABLE_KEY: string;

  // Convex Backend
  VITE_CONVEX_URL: string;
  VITE_CONVEX_HTTP_URL: string;

  // Stream API
  VITE_PUBLIC_STREAM_API_KEY: string;

  // VAPI Configuration (Optional)
  VITE_PUBLIC_VAPI_WEB_TOKEN?: string;
  VITE_PUBLIC_VAPI_WORKFLOW_ID?: string;

  // Code Execution (Optional)
  VITE_RAPID_API_URL?: string;
  VITE_RAPID_API_HOST?: string;
  VITE_RAPID_API_KEY?: string;
}

export function validateEnvironmentVariables(): {
  isValid: boolean;
  missingRequired: string[];
  missingOptional: string[];
  config: Partial<EnvConfig>;
} {
  const requiredVars = [
    "VITE_CLERK_PUBLISHABLE_KEY",
    "VITE_CONVEX_URL",
    "VITE_CONVEX_HTTP_URL",
    "VITE_PUBLIC_STREAM_API_KEY",
  ];

  const optionalVars = [
    "VITE_PUBLIC_VAPI_WEB_TOKEN",
    "VITE_PUBLIC_VAPI_WORKFLOW_ID",
    "VITE_RAPID_API_URL",
    "VITE_RAPID_API_HOST",
    "VITE_RAPID_API_KEY",
  ];

  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  const config: Partial<EnvConfig> = {};

  // Check required variables
  requiredVars.forEach((varName) => {
    const value = import.meta.env[varName];
    if (!value) {
      missingRequired.push(varName);
    } else {
      (config as any)[varName] = value;
    }
  });

  // Check optional variables
  optionalVars.forEach((varName) => {
    const value = import.meta.env[varName];
    if (!value) {
      missingOptional.push(varName);
    } else {
      (config as any)[varName] = value;
    }
  });

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    missingOptional,
    config,
  };
}

export function getVapiConfig() {
  const webToken = import.meta.env.VITE_PUBLIC_VAPI_WEB_TOKEN;
  const workflowId = import.meta.env.VITE_PUBLIC_VAPI_WORKFLOW_ID;

  return {
    isConfigured: !!(webToken && workflowId),
    webToken,
    workflowId,
  };
}

export function logEnvironmentStatus() {
  const validation = validateEnvironmentVariables();
  const vapiConfig = getVapiConfig();

  console.group("🔧 Environment Configuration Status");

  if (validation.isValid) {
    console.log("✅ All required environment variables are configured");
  } else {
    console.error(
      "❌ Missing required environment variables:",
      validation.missingRequired
    );
  }

  if (validation.missingOptional.length > 0) {
    console.warn(
      "⚠️ Missing optional environment variables:",
      validation.missingOptional
    );
  }

  console.log(
    "🤖 VAPI Status:",
    vapiConfig.isConfigured ? "✅ Configured" : "❌ Not configured"
  );

  if (validation.missingOptional.includes("VITE_RAPID_API_KEY")) {
    console.warn(
      "⚠️ Code execution features will be limited without RapidAPI configuration"
    );
  }

  console.groupEnd();

  return validation;
}
