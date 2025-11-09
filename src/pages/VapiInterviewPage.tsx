import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  User,
  Mic,
  MicOff,
  PhoneOff,
  Timer,
  ArrowLeft,
} from "lucide-react";
import Vapi from "@vapi-ai/web";

interface Question {
  question: string;
  type: string;
}

interface LocationState {
  questionsList: Question[];
  formData: {
    jobPosition: string;
    jobDescription: string;
    duration: string;
    type: string;
  };
  aiInterviewId?: string;
  metadata?: any;
}

interface ConversationMessage {
  type: "ai" | "user";
  message: string;
  timestamp: Date;
}

export default function VapiInterviewPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [vapi, setVapi] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] =
    useState<ConversationMessage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize VAPI
  useEffect(() => {
    try {
      const webToken = import.meta.env.VITE_PUBLIC_VAPI_WEB_TOKEN;
      const workflowId = import.meta.env.VITE_PUBLIC_VAPI_WORKFLOW_ID;

      console.log("=== VAPI Configuration Debug ===");
      console.log(
        "VAPI Web Token:",
        webToken ? `Present (${webToken.substring(0, 10)}...)` : "Missing"
      );
      console.log(
        "VAPI Workflow ID:",
        workflowId ? `Present (${workflowId.substring(0, 10)}...)` : "Missing"
      );

      if (!webToken) {
        setError(
          "VAPI Web Token is not configured. Please add VITE_PUBLIC_VAPI_WEB_TOKEN to your environment variables."
        );
        setIsLoading(false);
        return;
      }

      if (!workflowId) {
        setError(
          "VAPI Workflow ID is not configured. Please add VITE_PUBLIC_VAPI_WORKFLOW_ID to your environment variables."
        );
        setIsLoading(false);
        return;
      }

      // Validate token format
      if (!webToken.match(/^[a-f0-9-]{36}$/)) {
        console.warn("VAPI Web Token format may be incorrect");
      }

      console.log("Initializing VAPI instance...");
      const vapiInstance = new Vapi(webToken);

      // Set up VAPI event listeners
      vapiInstance.on("speech-start", () => {
        console.log("VAPI: Speech started");
        setCurrentMessage({
          type: "user",
          message: "Speaking...",
          timestamp: new Date(),
        });
      });

      vapiInstance.on("speech-end", () => {
        console.log("VAPI: Speech ended");
        setCurrentMessage(null);
      });

      vapiInstance.on("message", (message: any) => {
        console.log("VAPI Message received:", message);
        if (message.type === "transcript" && message.transcript) {
          const newMessage: ConversationMessage = {
            type: message.role === "assistant" ? "ai" : "user",
            message: message.transcript,
            timestamp: new Date(),
          };
          setCurrentMessage(newMessage);
          setConversation((prev) => [...prev, newMessage]);
        }
      });

      vapiInstance.on("call-start", () => {
        console.log("VAPI: Call started successfully");
        setIsCallActive(true);
        setError(null); // Clear any previous errors
      });

      vapiInstance.on("call-end", () => {
        console.log("VAPI: Call ended");
        setIsCallActive(false);
        // Navigate to completion page
        navigate("/ai-interview/complete", {
          state: {
            completedQuestions: state?.questionsList?.length || 0,
            totalQuestions: state?.questionsList?.length || 0,
            formData: state?.formData,
            aiInterviewId: state?.aiInterviewId,
            timeElapsed,
            conversation,
            feedback: null,
          },
          replace: true,
        });
      });

      vapiInstance.on("error", (error: any) => {
        console.error("VAPI Error:", error);

        // Handle different types of VAPI errors
        let errorMessage = "Unknown VAPI error";

        if (error && typeof error === "object") {
          if (error.type === "start-method-error") {
            errorMessage =
              "Failed to start VAPI call. Please check your configuration and try again.";
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        setError(`VAPI Error: ${errorMessage}`);
        setIsCallActive(false);
      });

      setVapi(vapiInstance);
      setIsLoading(false);
      console.log("VAPI initialized successfully");
    } catch (error) {
      console.error("Error initializing VAPI:", error);
      setError(
        `Failed to initialize VAPI: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setIsLoading(false);
    }
  }, []);

  // Timer functionality
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCallActive) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCallActive]);

  // Redirect if no interview data
  useEffect(() => {
    if (!state?.questionsList || !state?.formData) {
      navigate("/ai-interview");
    }
  }, [state, navigate]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const startCall = async () => {
    if (!vapi || !state?.questionsList || !state?.formData) {
      setError("Cannot start call: missing VAPI instance or interview data");
      return;
    }

    try {
      setError(null); // Clear any previous errors
      console.log("=== Starting VAPI Call ===");

      // Format questions list
      let questionList = "";
      state.questionsList.forEach((item, index) => {
        questionList += `${index + 1}. ${item.question}\n`;
      });

      const assistantOptions = {
        name: "AI Recruiter",
        firstMessage: `Hi ${user?.fullName || "there"}, welcome to your ${state.formData.jobPosition} interview! I'll be conducting your ${state.formData.type} interview today. Are you ready to begin?`,
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
        },
        voice: {
          provider: "playht",
          voiceId: "jennifer",
        },
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an AI voice assistant conducting a ${state.formData.type} interview for a ${state.formData.jobPosition} position.

Job Description: ${state.formData.jobDescription}
Interview Duration: ${state.formData.duration}
Interview Type: ${state.formData.type}

Questions to ask (one at a time):
${questionList}

Guidelines:
- Be professional but friendly and conversational
- Ask one question at a time and wait for complete responses
- Provide brief encouragement after each answer
- If a candidate struggles, offer gentle hints or rephrase the question
- Keep responses concise and natural (1-2 sentences max)
- End the interview positively after all questions
- Maintain a supportive and encouraging tone throughout

Start with a warm greeting and then proceed with the questions in order. Remember to keep your responses brief and let the candidate do most of the talking.`,
            },
          ],
        },
      };

      console.log("VAPI call options:", {
        ...assistantOptions,
        model: {
          ...assistantOptions.model,
          messages: "[REDACTED FOR BREVITY]",
        },
      });

      console.log("Calling vapi.start()...");
      await vapi.start(assistantOptions);
      console.log("VAPI start call completed");
    } catch (error) {
      console.error("Error starting VAPI call:", error);

      let errorMessage = "Failed to start interview";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as any).message;
      }

      // Check for common error types
      if (
        errorMessage.includes("403") ||
        errorMessage.includes("unauthorized")
      ) {
        errorMessage =
          "Authentication failed. Please check your VAPI credentials.";
      } else if (
        errorMessage.includes("400") ||
        errorMessage.includes("bad request")
      ) {
        errorMessage = "Invalid request. Please check your VAPI configuration.";
      } else if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch")
      ) {
        errorMessage = "Network error. Please check your internet connection.";
      }

      setError(`Failed to start interview: ${errorMessage}`);
    }
  };

  const stopCall = () => {
    if (vapi && isCallActive) {
      vapi.stop();
    }
  };

  const toggleMute = () => {
    if (vapi && isCallActive) {
      setIsMuted(!isMuted);
      vapi.setMuted(!isMuted);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="p-8 bg-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div>
              <h1 className="text-xl font-bold text-white mb-2">
                Initializing VAPI...
              </h1>
              <p className="text-white/70">Setting up voice interview system</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <Card className="p-8 bg-red-900/20 backdrop-blur-sm border-red-500/20 max-w-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-red-400 mb-4">
              VAPI Configuration Issue
            </h1>
            <p className="text-white/70 mb-6 text-sm leading-relaxed">
              {error}
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/ai-interview/live", { state })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Use Regular AI Interview Instead
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate("/ai-interview")}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Setup
                </Button>
                <Button
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    window.location.reload();
                  }}
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Retry VAPI
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-left">
              <h3 className="text-yellow-400 font-semibold mb-2">
                Troubleshooting Tips:
              </h3>
              <ul className="text-yellow-200 text-xs space-y-1">
                <li>• Check if VITE_PUBLIC_VAPI_WEB_TOKEN is configured</li>
                <li>• Verify your VAPI account has sufficient credits</li>
                <li>• Ensure microphone permissions are granted</li>
                <li>• Try refreshing the page</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // No interview data state
  if (!state?.questionsList || !state?.formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="p-8 bg-white/10 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white mb-4">
            No Interview Data
          </h1>
          <p className="text-white/70 mb-6">
            Please start from the AI interview setup page.
          </p>
          <Button
            onClick={() => navigate("/ai-interview")}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go to AI Interview Setup
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/ai-interview")}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h2 className="font-bold text-xl text-white">
                VAPI Interview - {state.formData.jobPosition}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Timer className="h-5 w-5" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 lg:px-16 xl:px-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* AI Interviewer */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/10 h-[400px] flex flex-col gap-4 items-center justify-center relative">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mb-4 relative">
                <Bot className="h-12 w-12 text-white" />
                {isCallActive && (
                  <div className="absolute -inset-4 rounded-full border-2 border-blue-400 animate-pulse"></div>
                )}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                AI Recruiter
              </h3>
              <p className="text-white/70 text-center">
                {isCallActive
                  ? "Interview in progress..."
                  : "Ready to start your interview"}
              </p>
              {isCallActive && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Live</span>
                </div>
              )}
            </div>
          </Card>

          {/* Candidate */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/10 h-[400px] flex flex-col gap-4 items-center justify-center">
            <div className="flex flex-col items-center justify-center h-full">
              <Avatar className="w-24 h-24 ring-4 ring-white/20 mb-4">
                <AvatarImage
                  src={user?.imageUrl}
                  alt={user?.fullName || "User"}
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl">
                  {user?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-white mb-2">
                {user?.fullName || "Candidate"}
              </h3>
              <p className="text-white/70 text-center">
                {isCallActive
                  ? "Speak clearly into your microphone"
                  : "Ready for interview"}
              </p>
            </div>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-12">
          {/* Microphone Toggle */}
          <Button
            onClick={toggleMute}
            size="lg"
            disabled={!isCallActive}
            className={`w-16 h-16 rounded-full ${
              isMuted
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isMuted ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>

          {/* Start/Stop Interview Button */}
          {!isCallActive ? (
            <Button
              onClick={startCall}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-8 py-4"
            >
              Start VAPI Interview
            </Button>
          ) : (
            <Button
              onClick={stopCall}
              size="lg"
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
          )}
        </div>

        {/* Live Conversation Display */}
        {isCallActive && (
          <div className="mt-8">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 max-w-4xl mx-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">
                  Live Conversation
                </h3>
                <div className="min-h-[120px] flex items-center justify-center">
                  {currentMessage ? (
                    <div
                      className={`max-w-3xl w-full p-4 rounded-lg ${
                        currentMessage.type === "ai"
                          ? "bg-blue-500/20 border-l-4 border-blue-500"
                          : "bg-green-500/20 border-l-4 border-green-500"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            currentMessage.type === "ai"
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        >
                          {currentMessage.type === "ai" ? (
                            <Bot className="h-4 w-4 text-white" />
                          ) : (
                            <User className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            currentMessage.type === "ai"
                              ? "text-blue-300"
                              : "text-green-300"
                          }`}
                        >
                          {currentMessage.type === "ai"
                            ? "AI Recruiter"
                            : user?.fullName || "You"}
                        </span>
                        <span className="text-xs text-white/50">
                          {currentMessage.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white text-base leading-relaxed">
                        {currentMessage.message}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-white/70 text-sm">
                          Waiting for conversation...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Interview Info */}
        <div className="text-center mt-8">
          <p className="text-white/70 text-sm">
            {isCallActive
              ? "VAPI interview is in progress. Speak clearly into your microphone."
              : "Click 'Start VAPI Interview' to begin the voice-powered interview."}
          </p>
          {state?.questionsList && (
            <p className="text-white/50 text-xs mt-2">
              {state.questionsList.length} questions prepared
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
