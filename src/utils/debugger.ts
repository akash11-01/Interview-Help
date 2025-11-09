// Debugging utility for AI Interview Platform

export class PlatformDebugger {
  private static instance: PlatformDebugger;

  public static getInstance(): PlatformDebugger {
    if (!PlatformDebugger.instance) {
      PlatformDebugger.instance = new PlatformDebugger();
    }
    return PlatformDebugger.instance;
  }

  public async debugAIQuestionGeneration(formData: any) {
    console.group("🤖 AI Question Generation Debug");

    try {
      // Check environment variables
      const convexHttpUrl = import.meta.env.VITE_CONVEX_HTTP_URL;
      console.log("Convex HTTP URL:", convexHttpUrl);

      if (!convexHttpUrl) {
        console.error("❌ VITE_CONVEX_HTTP_URL not configured");
        return { success: false, error: "Backend URL not configured" };
      }

      const apiUrl = `${convexHttpUrl}/generate-questions`;
      console.log("API URL:", apiUrl);
      console.log("Request data:", formData);

      // Test API connectivity
      console.log("Testing API connectivity...");
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);

        // Try to parse error details
        try {
          const errorJson = JSON.parse(errorText);
          console.error("Parsed error details:", errorJson);
        } catch (parseError) {
          console.error("Raw error response:", errorText);
        }

        return { success: false, error: errorText };
      }

      const result = await response.json();
      console.log("API Response:", result);

      // Check if we got fallback questions (indicating API issues)
      if (result.metadata && result.metadata.source === "fallback-error") {
        console.warn(
          "⚠️ Received fallback questions due to API error:",
          result.metadata.error
        );
        console.log(
          "This means the OpenRouter API failed, but fallback questions were provided"
        );
      } else {
        console.log("✅ AI Question Generation successful");
      }

      return { success: true, data: result };
    } catch (error) {
      console.error("❌ AI Question Generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      console.groupEnd();
    }
  }

  public async debugOpenRouterAPI() {
    console.group("🔗 OpenRouter API Debug");

    try {
      const convexHttpUrl = import.meta.env.VITE_CONVEX_HTTP_URL;

      if (!convexHttpUrl) {
        console.error("❌ VITE_CONVEX_HTTP_URL not configured");
        console.groupEnd();
        return { success: false, error: "Backend URL not configured" };
      }

      // Test with a simple request
      const testData = {
        jobPosition: "Software Developer",
        jobDescription: "Test job description for debugging",
        duration: "30 minutes",
        type: "Technical",
        userId: "debug-test",
      };

      console.log("Testing OpenRouter API through backend...");
      const response = await fetch(`${convexHttpUrl}/generate-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      console.log("Response status:", response.status);
      const result = await response.json();
      console.log("Response data:", result);

      if (result.metadata && result.metadata.source === "fallback-error") {
        console.error("❌ OpenRouter API failed:", result.metadata.error);
        console.log("💡 Possible solutions:");
        console.log("  1. Check if OpenRouter API key is valid");
        console.log("  2. Verify OpenRouter account has credits");
        console.log("  3. Check if the model is available");
        console.log("  4. Try again in a few minutes");

        return { success: false, error: result.metadata.error };
      } else {
        console.log("✅ OpenRouter API working correctly");
        return { success: true, data: result };
      }
    } catch (error) {
      console.error("❌ OpenRouter API test failed:", error);
      console.groupEnd();
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      console.groupEnd();
    }
  }

  public debugVAPIConfiguration() {
    console.group("🎤 VAPI Configuration Debug");

    const webToken = import.meta.env.VITE_PUBLIC_VAPI_WEB_TOKEN;
    const workflowId = import.meta.env.VITE_PUBLIC_VAPI_WORKFLOW_ID;

    console.log("Web Token:", webToken ? "✅ Present" : "❌ Missing");
    console.log("Workflow ID:", workflowId ? "✅ Present" : "❌ Missing");

    if (webToken) {
      console.log("Token prefix:", webToken.substring(0, 10) + "...");
      // Validate token format (should be UUID-like)
      const isValidFormat = /^[a-f0-9-]{36}$/.test(webToken);
      console.log(
        "Token format:",
        isValidFormat ? "✅ Valid UUID format" : "⚠️ May be incorrect format"
      );
    }

    if (workflowId) {
      console.log("Workflow prefix:", workflowId.substring(0, 10) + "...");
      // Validate workflow ID format
      const isValidFormat = /^[a-f0-9-]{36}$/.test(workflowId);
      console.log(
        "Workflow format:",
        isValidFormat ? "✅ Valid UUID format" : "⚠️ May be incorrect format"
      );
    }

    // Check if VAPI library is available
    const isVAPIAvailable = typeof window !== "undefined" && "Vapi" in window;
    console.log(
      "VAPI Library:",
      isVAPIAvailable ? "✅ Loaded" : "❌ Not loaded"
    );

    // Check microphone permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("Media Devices API:", "✅ Supported");
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(() => console.log("Microphone Access:", "✅ Granted"))
        .catch((error) =>
          console.log(
            "Microphone Access:",
            "❌ Denied or Error:",
            error.message
          )
        );
    } else {
      console.log("Media Devices API:", "❌ Not supported");
    }

    const canUseVAPI = !!(webToken && workflowId);
    console.log("VAPI Ready:", canUseVAPI ? "✅ Ready" : "❌ Not ready");

    if (!canUseVAPI) {
      console.group("🔧 VAPI Setup Instructions");
      console.log("1. Get your VAPI Web Token from https://vapi.ai/dashboard");
      console.log(
        "2. Get your VAPI Workflow ID from your assistant configuration"
      );
      console.log("3. Add them to your .env file:");
      console.log("   VITE_PUBLIC_VAPI_WEB_TOKEN=your_token_here");
      console.log("   VITE_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id_here");
      console.log("4. Restart your development server");
      console.groupEnd();
    }

    console.groupEnd();

    return {
      configured: canUseVAPI,
      webToken: !!webToken,
      workflowId: !!workflowId,
      libraryLoaded: isVAPIAvailable,
      tokenFormat: webToken ? /^[a-f0-9-]{36}$/.test(webToken) : false,
      workflowFormat: workflowId ? /^[a-f0-9-]{36}$/.test(workflowId) : false,
    };
  }

  public async testVAPIConnection() {
    console.group("🔗 VAPI Connection Test");

    const config = this.debugVAPIConfiguration();

    if (!config.configured) {
      console.error("❌ VAPI not configured properly");
      console.groupEnd();
      return { success: false, error: "VAPI not configured" };
    }

    try {
      // Try to import and initialize VAPI
      const VapiModule = await import("@vapi-ai/web");
      const Vapi = VapiModule.default || VapiModule;

      const vapi = new Vapi(import.meta.env.VITE_PUBLIC_VAPI_WEB_TOKEN);
      console.log("✅ VAPI instance created successfully");

      // Test event listeners
      vapi.on("error", (error: any) => {
        console.log("VAPI Error Handler:", "✅ Working", error);
      });

      console.log("✅ VAPI connection test completed");
      console.groupEnd();
      return { success: true, vapi };
    } catch (error) {
      console.error("❌ VAPI connection test failed:", error);
      console.groupEnd();
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public debugEnvironmentVariables() {
    console.group("🔧 Environment Variables Debug");

    const envVars = {
      // Required
      VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
      VITE_CONVEX_URL: import.meta.env.VITE_CONVEX_URL,
      VITE_CONVEX_HTTP_URL: import.meta.env.VITE_CONVEX_HTTP_URL,
      VITE_PUBLIC_STREAM_API_KEY: import.meta.env.VITE_PUBLIC_STREAM_API_KEY,

      // Optional
      VITE_PUBLIC_VAPI_WEB_TOKEN: import.meta.env.VITE_PUBLIC_VAPI_WEB_TOKEN,
      VITE_PUBLIC_VAPI_WORKFLOW_ID: import.meta.env
        .VITE_PUBLIC_VAPI_WORKFLOW_ID,
      VITE_RAPID_API_KEY: import.meta.env.VITE_RAPID_API_KEY,
    };

    const required = [
      "VITE_CLERK_PUBLISHABLE_KEY",
      "VITE_CONVEX_URL",
      "VITE_CONVEX_HTTP_URL",
      "VITE_PUBLIC_STREAM_API_KEY",
    ];

    const optional = [
      "VITE_PUBLIC_VAPI_WEB_TOKEN",
      "VITE_PUBLIC_VAPI_WORKFLOW_ID",
      "VITE_RAPID_API_KEY",
    ];

    let allRequiredPresent = true;

    console.log("Required Variables:");
    required.forEach((key) => {
      const value = envVars[key as keyof typeof envVars];
      const present = !!value;
      console.log(
        `  ${key}: ${present ? "✅" : "❌"} ${present ? "Present" : "Missing"}`
      );
      if (!present) allRequiredPresent = false;
    });

    console.log("Optional Variables:");
    optional.forEach((key) => {
      const value = envVars[key as keyof typeof envVars];
      const present = !!value;
      console.log(
        `  ${key}: ${present ? "✅" : "⚠️"} ${present ? "Present" : "Not configured"}`
      );
    });

    console.log(
      "Overall Status:",
      allRequiredPresent ? "✅ Ready" : "❌ Missing required variables"
    );

    console.groupEnd();

    return { allRequiredPresent, envVars };
  }

  public async debugBackendConnectivity() {
    console.group("🔗 Backend Connectivity Debug");

    const convexUrl = import.meta.env.VITE_CONVEX_URL;
    const convexHttpUrl = import.meta.env.VITE_CONVEX_HTTP_URL;

    if (!convexUrl || !convexHttpUrl) {
      console.error("❌ Convex URLs not configured");
      console.groupEnd();
      return { success: false, error: "Convex URLs not configured" };
    }

    try {
      // Test HTTP endpoint
      console.log("Testing Convex HTTP endpoint...");
      const response = await fetch(`${convexHttpUrl}/generate-questions`, {
        method: "OPTIONS",
      });

      console.log("HTTP endpoint status:", response.status);
      console.log("CORS headers:", {
        "Access-Control-Allow-Origin": response.headers.get(
          "Access-Control-Allow-Origin"
        ),
        "Access-Control-Allow-Methods": response.headers.get(
          "Access-Control-Allow-Methods"
        ),
        "Access-Control-Allow-Headers": response.headers.get(
          "Access-Control-Allow-Headers"
        ),
      });

      console.log("✅ Backend connectivity verified");
      console.groupEnd();
      return { success: true };
    } catch (error) {
      console.error("❌ Backend connectivity failed:", error);
      console.groupEnd();
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  public debugMicrophoneAccess() {
    console.group("🎤 Microphone Access Debug");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("❌ Media devices API not supported");
      console.groupEnd();
      return { supported: false };
    }

    console.log("✅ Media devices API supported");

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        console.log("✅ Microphone access granted");
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((error) => {
        console.error("❌ Microphone access denied:", error);
      });

    console.groupEnd();
    return { supported: true };
  }

  public runFullDiagnostic() {
    console.group("🔍 Full Platform Diagnostic");
    console.log("Running comprehensive diagnostic...");

    this.debugEnvironmentVariables();
    this.debugVAPIConfiguration();
    this.debugMicrophoneAccess();
    this.debugBackendConnectivity();

    // Test OpenRouter API
    this.debugOpenRouterAPI();

    // Test Feedback Generation
    this.debugFeedbackGeneration();

    // Run VAPI connection test if configured
    const vapiConfig = this.debugVAPIConfiguration();
    if (vapiConfig.configured) {
      this.testVAPIConnection();
    }

    console.log("✅ Diagnostic complete - check individual sections above");
    console.groupEnd();
  }

  public async debugFeedbackGeneration() {
    console.group("🧠 Feedback Generation Debug");

    const convexHttpUrl = import.meta.env.VITE_CONVEX_HTTP_URL;

    if (!convexHttpUrl) {
      console.error("❌ VITE_CONVEX_HTTP_URL not configured");
      console.groupEnd();
      return { success: false, error: "Convex HTTP URL not configured" };
    }

    console.log("✅ Convex HTTP URL configured:", convexHttpUrl);

    // Test with sample conversation data
    const sampleConversation = [
      {
        type: "ai",
        message:
          "Hello! Can you tell me about yourself and your experience with React?",
        timestamp: new Date(),
      },
      {
        type: "user",
        message:
          "Hi! I'm a frontend developer with 3 years of experience in React. I've worked on several e-commerce projects and love building user interfaces.",
        timestamp: new Date(),
      },
      {
        type: "ai",
        message:
          "That's great! Can you describe a challenging project you worked on recently?",
        timestamp: new Date(),
      },
      {
        type: "user",
        message:
          "I recently built a complex dashboard with real-time data visualization using React and D3.js. The challenge was optimizing performance with large datasets.",
        timestamp: new Date(),
      },
    ];

    try {
      console.log("🔄 Testing feedback generation with sample conversation...");

      const response = await fetch(`${convexHttpUrl}/generate-feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation: sampleConversation,
          jobPosition: "Frontend Developer",
        }),
      });

      console.log("📊 Response Status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Feedback generation successful:", result);
        console.groupEnd();
        return { success: true, feedback: result };
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Feedback generation failed:",
          response.status,
          errorText
        );
        console.groupEnd();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }
    } catch (error) {
      console.error("❌ Feedback generation error:", error);
      console.groupEnd();
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Global debug helper
export const platformDebugger = PlatformDebugger.getInstance();

// Make it available globally for easy console access
if (typeof window !== "undefined") {
  (window as any).platformDebugger = platformDebugger;
  console.log("🛠️ Platform debugger available as window.platformDebugger");
  console.log(
    "Run platformDebugger.runFullDiagnostic() for complete system check"
  );
}
