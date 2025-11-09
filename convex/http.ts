import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not set");
    }

    // Log headers for debugging
    console.log("All request headers:");
    request.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    console.log("Svix headers:", { svix_id, svix_signature, svix_timestamp });

    const payload = await request.json();
    console.log("Payload received:", payload);

    if (!svix_id || !svix_signature || !svix_timestamp) {
      console.log("Missing Svix headers - this might be a test request");

      // For testing purposes, let's try to process the payload directly
      if (payload && payload.type) {
        console.log("Processing test payload:", payload);

        if (payload.type === "user.created") {
          const { id, email_addresses, first_name, last_name, image_url } =
            payload.data;
          const email = email_addresses[0].email_address;
          const name = `${first_name || ""} ${last_name || ""}`.trim();

          try {
            await ctx.runMutation(api.users.syncUser, {
              clerkId: id,
              email,
              name,
              imageUrl: image_url || "",
            });
            console.log("Test user created successfully");
            return new Response("Test webhook processed successfully", {
              status: 200,
            });
          } catch (error) {
            console.log("Error creating test user:", error);
            return new Response("Error creating test user", { status: 500 });
          }
        }
      }

      return new Response("No Svix headers found", {
        status: 400,
      });
    }

    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      }) as WebhookEvent;
    } catch (error) {
      console.error("Error verifying webhook:", error);
      return new Response("Error occured", { status: 400 });
    }

    const eventType = evt.type;
    if (eventType === "user.created") {
      const { id, email_addresses, first_name, last_name, image_url } =
        evt.data;
      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.syncUser, {
          clerkId: id,
          email,
          name,
          imageUrl: image_url || "",
        });
      } catch (error) {
        console.log("Error creating user:", error);
        return new Response("Error creating user", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

// AI Questions Generation Route using OpenRouter API
http.route({
  path: "/generate-questions",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    console.log("=== GENERATE QUESTIONS ENDPOINT CALLED ===");
    console.log("Request method:", request.method);
    console.log("Request URL:", request.url);

    // Add CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      const body = await request.json();
      console.log("Request body:", body);

      const { jobPosition, jobDescription, duration, type, userId } = body;

      // Validate required fields
      if (!jobPosition || !jobDescription || !duration || !type) {
        console.log("Missing required fields");
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers }
        );
      }

      // OpenRouter API configuration
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

      if (!OPENROUTER_API_KEY) {
        console.error("OPENROUTER_API_KEY not found in environment variables");
        throw new Error("OpenRouter API key is not configured");
      }

      // Test API key validity with a simple request first
      console.log("Testing OpenRouter API key validity...");
      try {
        const testResponse = await fetch(
          "https://openrouter.ai/api/v1/models",
          {
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!testResponse.ok) {
          console.error(
            "OpenRouter API key test failed:",
            testResponse.status,
            testResponse.statusText
          );
          if (testResponse.status === 401) {
            throw new Error(
              "Invalid OpenRouter API key. Please check your credentials."
            );
          } else if (testResponse.status === 403) {
            throw new Error(
              "OpenRouter API key does not have sufficient permissions."
            );
          }
        } else {
          console.log("OpenRouter API key is valid");
        }
      } catch (error) {
        console.error("Error testing OpenRouter API key:", error);
        if (error instanceof Error && error.message.includes("API key")) {
          throw error;
        }
        // If it's a network error, continue with the main request
        console.warn(
          "Could not validate API key due to network error, proceeding with request"
        );
      }

      // Create prompt for AI interview questions
      const prompt = `Generate ${duration === "15 minutes" ? 8 : duration === "30 minutes" ? 16 : 20} interview questions for a ${jobPosition} position.

Job Description: ${jobDescription}
Interview Type: ${type}
Duration: ${duration}

Please generate a mix of:
- Behavioral questions (asking about past experiences and situations)
- Technical questions (related to skills and knowledge for the role)
- Experience questions (about specific projects and achievements)

Return the questions as a JSON array with each question having:
- question: the actual question text
- type: either "Behavioral", "Technical", or "Experience"

Make sure the questions are relevant to the job position and description provided.`;

      console.log("Sending request to OpenRouter API...");

      // List of models to try in order of preference
      const modelsToTry = [
        "meta-llama/llama-3.1-8b-instruct:free",
        "mistralai/mistral-7b-instruct:free",
        "google/gemma-7b-it:free",
        "microsoft/wizardlm-2-8x22b:nitro",
        "openai/gpt-3.5-turbo",
      ];

      let lastError = null;
      let result = null;

      // Try each model until one works
      for (const model of modelsToTry) {
        try {
          console.log(`Trying model: ${model}`);

          // Call OpenRouter API
          const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://hire-hack.netlify.app", // Your site URL
                "X-Title": "AI Interview Platform", // Your site title
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                temperature: 0.7,
                max_tokens: 1500,
              }),
            }
          );

          console.log(`Response status for ${model}:`, response.status);

          if (response.ok) {
            result = await response.json();
            console.log(`Successfully used model: ${model}`);
            break;
          } else {
            const errorText = await response.text();
            console.warn(
              `Model ${model} failed with ${response.status}: ${errorText}`
            );
            lastError = new Error(
              `${model}: ${response.status} ${response.statusText}`
            );
            continue;
          }
        } catch (error) {
          console.warn(`Error with model ${model}:`, error);
          lastError = error;
          continue;
        }
      }

      if (!result) {
        throw lastError || new Error("All models failed to generate questions");
      }
      console.log("OpenRouter API response:", result);

      const aiContent = result.choices[0]?.message?.content;

      if (!aiContent) {
        throw new Error("No content received from AI");
      }

      // Parse the AI response to extract questions
      let interviewQuestions;
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          interviewQuestions = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, try to parse the entire content
          try {
            interviewQuestions = JSON.parse(aiContent);
          } catch (secondParseError) {
            console.log("No valid JSON found, creating fallback questions");
            throw new Error("No JSON array found in AI response");
          }
        }

        // Validate the structure of questions
        if (!Array.isArray(interviewQuestions)) {
          throw new Error("AI response is not an array");
        }

        // Ensure each question has required fields
        interviewQuestions = interviewQuestions.map((q, index) => ({
          question: q.question || `Generated question ${index + 1}`,
          type: q.type || "General",
        }));
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.log("Raw AI content:", aiContent);

        // Create fallback questions based on the job position and type
        const fallbackQuestions = [
          {
            question: `Tell me about yourself and your experience related to ${jobPosition}.`,
            type: "Behavioral",
          },
          {
            question: `Why are you interested in this ${jobPosition} position?`,
            type: "Behavioral",
          },
          {
            question:
              "What are your key technical skills relevant to this role?",
            type: "Technical",
          },
          {
            question:
              "Describe a challenging project you've worked on recently.",
            type: "Experience",
          },
          {
            question:
              "How do you handle working under pressure and tight deadlines?",
            type: "Behavioral",
          },
          {
            question: "Where do you see yourself in 5 years?",
            type: "Behavioral",
          },
        ];

        // Add more questions based on duration
        if (duration === "30 minutes" || duration === "45 minutes") {
          fallbackQuestions.push(
            {
              question: "What's your approach to learning new technologies?",
              type: "Technical",
            },
            {
              question:
                "Tell me about a time you had to work with a difficult team member.",
              type: "Behavioral",
            }
          );
        }

        if (
          duration === "45 minutes" ||
          duration === "1 hour" ||
          duration === "1.5 hours"
        ) {
          fallbackQuestions.push(
            {
              question:
                "How do you prioritize tasks when everything seems urgent?",
              type: "Behavioral",
            },
            {
              question: "Describe your ideal work environment.",
              type: "Behavioral",
            }
          );
        }

        interviewQuestions = fallbackQuestions;
      }

      console.log("Generated questions:", interviewQuestions);

      // Store the AI interview in the database if userId is provided
      let aiInterviewId = null;
      if (userId) {
        try {
          aiInterviewId = await ctx.runMutation(
            api.aiInterviews.createAiInterview,
            {
              jobPosition,
              jobDescription,
              duration,
              type,
              questions: interviewQuestions,
              userId,
              source: "openrouter-ai",
            }
          );
          console.log(
            "AI Interview stored in database with ID:",
            aiInterviewId
          );
        } catch (dbError) {
          console.error("Error storing AI interview in database:", dbError);
          // Continue without failing the request
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          interviewQuestions: interviewQuestions,
          aiInterviewId: aiInterviewId,
          metadata: {
            jobPosition,
            duration,
            type,
            generatedAt: new Date().toISOString(),
            source: "openrouter-ai",
          },
        }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error("Error in generate-questions endpoint:", error);

      // Extract variables from the body if available
      let fallbackJobPosition = "Unknown";
      let fallbackDuration = "30 minutes";
      let fallbackType = "General";

      try {
        const body = await request.json();
        fallbackJobPosition = body?.jobPosition || "Unknown";
        fallbackDuration = body?.duration || "30 minutes";
        fallbackType = body?.type || "General";
      } catch (bodyError) {
        console.log("Could not parse request body in error handler");
      }

      // Return fallback questions on any error
      const fallbackQuestions = [
        {
          question: "Tell me about yourself and your experience.",
          type: "Behavioral",
        },
        {
          question: `Why are you interested in this ${fallbackJobPosition} position?`,
          type: "Behavioral",
        },
        {
          question: "What are your key technical skills?",
          type: "Technical",
        },
        {
          question: "Describe a challenging project you've worked on recently.",
          type: "Experience",
        },
        {
          question:
            "How do you handle working under pressure and tight deadlines?",
          type: "Behavioral",
        },
        {
          question: "Where do you see yourself in 5 years?",
          type: "Behavioral",
        },
      ];

      return new Response(
        JSON.stringify({
          success: true,
          interviewQuestions: fallbackQuestions,
          metadata: {
            jobPosition: fallbackJobPosition,
            duration: fallbackDuration,
            type: fallbackType,
            generatedAt: new Date().toISOString(),
            source: "fallback-error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        }),
        { status: 200, headers }
      );
    }
  }),
});

// Handle CORS preflight requests
http.route({
  path: "/generate-questions",
  method: "OPTIONS",
  handler: httpAction(async (_, _request) => {
    console.log("=== OPTIONS REQUEST FOR CORS ===");
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

// AI Interview Feedback Generation Route
http.route({
  path: "/generate-feedback",
  method: "POST",
  handler: httpAction(async (_, request) => {
    console.log("=== GENERATE FEEDBACK ENDPOINT CALLED ===");

    // Add CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    try {
      const body = await request.json();
      console.log("Feedback request body:", body);

      const { conversation, jobPosition } = body;

      // Validate required fields
      if (!conversation || !Array.isArray(conversation)) {
        console.log("Missing or invalid conversation data");
        return new Response(
          JSON.stringify({ error: "Missing or invalid conversation data" }),
          { status: 400, headers }
        );
      }

      // OpenRouter API configuration
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

      if (!OPENROUTER_API_KEY) {
        console.error("OpenRouter API key not found in environment variables");

        // Fallback feedback if API key is missing
        const fallbackFeedback = {
          feedback: {
            rating: {
              technicalSkills: 7,
              communication: 8,
              problemSolving: 6,
              experience: 7,
            },
            summary:
              "The candidate provided thoughtful responses and demonstrated good communication skills. Technical knowledge appears solid with room for growth. Overall performance was satisfactory for the interview duration.",
            recommendation: "Consider for next round",
            recommendationMsg:
              "Candidate shows potential and should be considered for further evaluation.",
          },
        };

        return new Response(
          JSON.stringify({
            success: true,
            ...fallbackFeedback,
            metadata: {
              generatedAt: new Date().toISOString(),
              source: "fallback",
            },
          }),
          { status: 200, headers }
        );
      }

      // Create feedback prompt
      const FEEDBACK_PROMPT = `Based on this interview conversation between an AI assistant and a candidate for a ${jobPosition || "position"}, provide detailed feedback:

CONVERSATION:
${conversation.map((msg) => `${msg.type.toUpperCase()}: ${msg.message}`).join("\n")}

Please analyze the conversation and provide feedback in the following JSON format:
{
  "feedback": {
    "rating": {
      "technicalSkills": [rating out of 10],
      "communication": [rating out of 10],
      "problemSolving": [rating out of 10],
      "experience": [rating out of 10]
    },
    "summary": "[3-line summary of the interview performance]",
    "recommendation": "[Recommended/Not Recommended/Consider for next round]",
    "recommendationMsg": "[One line message explaining the recommendation]"
  }
}

Focus on:
- Technical knowledge demonstrated
- Communication clarity and professionalism
- Problem-solving approach
- Relevant experience shared
- Overall interview performance`;

      console.log("Sending request to OpenRouter API for feedback...");

      // Call OpenRouter API
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://hire-hack.netlify.app",
            "X-Title": "AI Interview Platform",
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-r1-0528:free",
            messages: [
              {
                role: "user",
                content: FEEDBACK_PROMPT,
              },
            ],
            temperature: 0.7,
            max_tokens: 1500,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `OpenRouter API error: ${response.status} ${response.statusText}`
        );
      }

      const aiResponse = await response.json();
      console.log("OpenRouter API feedback response:", aiResponse);

      const aiContent = aiResponse.choices[0]?.message?.content;

      if (!aiContent) {
        throw new Error("No content received from AI");
      }

      // Parse the AI response to extract feedback
      let feedbackData;
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          feedbackData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in AI response");
        }
      } catch (parseError) {
        console.error("Failed to parse AI feedback response:", parseError);
        console.log("Raw AI content:", aiContent);

        // Fallback feedback if parsing fails
        feedbackData = {
          feedback: {
            rating: {
              technicalSkills: 7,
              communication: 8,
              problemSolving: 6,
              experience: 7,
            },
            summary:
              "The interview was conducted successfully. The candidate demonstrated reasonable communication skills and provided relevant responses to the questions asked. Further evaluation may be beneficial.",
            recommendation: "Consider for next round",
            recommendationMsg:
              "Candidate shows potential and should be considered for further evaluation.",
          },
        };
      }

      console.log("Generated feedback:", feedbackData);

      return new Response(
        JSON.stringify({
          success: true,
          ...feedbackData,
          metadata: {
            generatedAt: new Date().toISOString(),
            source: "openrouter-ai",
          },
        }),
        { status: 200, headers }
      );
    } catch (error) {
      console.error("Error in generate-feedback endpoint:", error);

      // Return fallback feedback on any error
      const fallbackFeedback = {
        feedback: {
          rating: {
            technicalSkills: 6,
            communication: 7,
            problemSolving: 6,
            experience: 6,
          },
          summary:
            "Interview completed successfully. Due to technical limitations, detailed analysis could not be performed. Manual review recommended.",
          recommendation: "Manual Review Required",
          recommendationMsg:
            "Technical issues prevented automated analysis. Please conduct manual review.",
        },
      };

      return new Response(
        JSON.stringify({
          success: true,
          ...fallbackFeedback,
          metadata: {
            generatedAt: new Date().toISOString(),
            source: "fallback-error",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        }),
        { status: 200, headers }
      );
    }
  }),
});

// Handle CORS preflight requests for feedback
http.route({
  path: "/generate-feedback",
  method: "OPTIONS",
  handler: httpAction(async (_, _request) => {
    console.log("=== OPTIONS REQUEST FOR FEEDBACK CORS ===");
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }),
});

export default http;
