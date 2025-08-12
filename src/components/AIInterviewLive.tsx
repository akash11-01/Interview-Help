import { useState, useEffect, useRef } from "react";
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
  Camera,
  CameraOff,
} from "lucide-react";
import Vapi from "@vapi-ai/web";
import Spline from "@splinetool/react-spline";
import AlertConformation from "./AlertConformation";

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
  metadata?: {
    jobPosition: string;
    duration: string;
    type: string;
    generatedAt: string;
    source: string;
  };
}

interface ConversationMessage {
  type: "ai" | "user";
  message: string;
  timestamp: Date;
}

export default function AIInterviewLive() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [vapi, setVapi] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] =
    useState<ConversationMessage | null>(null);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [feedbackGenerated, setFeedbackGenerated] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const state = location.state as LocationState;

  // Initialize VAPI
  useEffect(() => {
    if (import.meta.env.VITE_PUBLIC_VAPI_WEB_TOKEN) {
      const vapiInstance = new Vapi(import.meta.env.VITE_PUBLIC_VAPI_WEB_TOKEN);

      // Set up VAPI event listeners
      vapiInstance.on("speech-start", () => {
        setCurrentMessage({
          type: "user",
          message: "Speaking...",
          timestamp: new Date(),
        });
      });

      vapiInstance.on("speech-end", () => {
        setCurrentMessage(null);
      });

      vapiInstance.on("message", (message: any) => {
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

      vapiInstance.on("call-end", () => {
        setIsCallActive(false);
        setInterviewEnded(true);
      });

      setVapi(vapiInstance);
    }
  }, []);

  // Prevent back navigation after interview ends
  useEffect(() => {
    if (interviewEnded) {
      const handlePopState = (event: PopStateEvent) => {
        event.preventDefault();
        // Stay on the current page
        window.history.pushState(null, "", window.location.pathname);
      };

      // Push current state and listen for back button
      window.history.pushState(null, "", window.location.pathname);
      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [interviewEnded]);

  // Prevent back navigation during active interview
  useEffect(() => {
    if (isCallActive) {
      const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        event.preventDefault();
        // event.returnValue =
        //   "Are you sure you want to leave? Your interview is still in progress.";
        return "Are you sure you want to leave? Your interview is still in progress.";
      };

      const handlePopState = (event: PopStateEvent) => {
        const confirmed = window.confirm(
          "Are you sure you want to leave? Your interview is still in progress."
        );
        if (!confirmed) {
          event.preventDefault();
          window.history.pushState(null, "", window.location.pathname);
        } else {
          // If user confirms, stop the interview
          if (vapi && isCallActive) {
            vapi.stop();
          }
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);
      window.addEventListener("popstate", handlePopState);
      window.history.pushState(null, "", window.location.pathname);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [isCallActive, vapi]);

  // Redirect if no interview data
  useEffect(() => {
    if (!state?.questionsList || !state?.formData) {
      navigate("/");
    }
  }, [state, navigate]);

  // Start interview automatically when component mounts and VAPI is ready
  useEffect(() => {
    if (vapi && state?.questionsList && state?.formData && !isCallActive) {
      startCall();
    }
  }, [vapi, state]);

  // Timer functionality
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCallActive]);

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Camera functionality
  const toggleCamera = async () => {
    try {
      if (isCameraOn) {
        // Turn off camera
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
          setMediaStream(null);
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
      } else {
        // Turn on camera
        console.log("Requesting camera access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false, // Audio is handled by VAPI
        });

        console.log("Camera stream received:", stream);
        console.log("Video tracks:", stream.getVideoTracks());
        setMediaStream(stream);

        // Wait for next tick to ensure state is updated
        setTimeout(() => {
          if (videoRef.current && stream) {
            console.log("Setting video source...");
            videoRef.current.srcObject = stream;

            // Force video to load and play
            videoRef.current.load();

            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded, attempting to play");
              if (videoRef.current) {
                videoRef.current
                  .play()
                  .then(() => console.log("Video playing successfully"))
                  .catch((e) => console.error("Video play error:", e));
              }
            };

            // Fallback play attempt
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current
                  .play()
                  .catch((e) => console.error("Fallback play error:", e));
              }
            }, 100);
          }
        }, 100);

        setIsCameraOn(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(
        `Unable to access camera: ${errorMessage}. Please check your permissions and try again.`
      );
    }
  };

  // Cleanup camera when component unmounts or interview ends
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaStream]);

  // Stop camera when interview ends
  useEffect(() => {
    if (interviewEnded && mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      setIsCameraOn(false);
    }
  }, [interviewEnded, mediaStream]);

  // Effect to handle video stream assignment
  useEffect(() => {
    if (mediaStream && videoRef.current && isCameraOn) {
      console.log("Assigning stream to video element via useEffect");
      videoRef.current.srcObject = mediaStream;

      const videoElement = videoRef.current;

      const handleLoadedMetadata = () => {
        console.log("Video metadata loaded in useEffect");
        videoElement
          .play()
          .then(() => console.log("Video playing via useEffect"))
          .catch((e) => console.error("Video play error in useEffect:", e));
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);

      // Cleanup
      return () => {
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      };
    }
  }, [mediaStream, isCameraOn]);

  // Handle navigation when interview ends
  useEffect(() => {
    if (interviewEnded && !isCallActive && !feedbackGenerated) {
      setFeedbackGenerated(true);

      // Navigate immediately to complete page
      navigate("/ai-interview/complete", {
        state: {
          completedQuestions: state?.questionsList?.length || 0,
          totalQuestions: state?.questionsList?.length || 0,
          formData: state?.formData,
          aiInterviewId: state?.aiInterviewId,
          timeElapsed,
          conversation,
          feedback: null, // Will be generated on the complete page
        },
        replace: true,
      });
    }
  }, [
    interviewEnded,
    isCallActive,
    feedbackGenerated,
    timeElapsed,
    conversation,
    navigate,
    state,
  ]);

  const startCall = () => {
    if (!vapi || !state?.questionsList || !state?.formData) return;

    // Format questions list
    let questionList = "";
    state.questionsList.forEach((item, index) => {
      questionList += `${index + 1}. ${item.question}\n`;
    });

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage:
        "Hi " +
        (user?.fullName || "there") +
        ", how are you? Ready for your interview for the " +
        state.formData.jobPosition +
        " position?",
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
            content: `
You are an AI voice assistant conducting interviews for a ${state.formData.jobPosition} position.
Your job is to ask candidates the provided interview questions and assess their responses.

Job Description: ${state.formData.jobDescription}
Interview Duration: ${state.formData.duration} minutes
Interview Type: ${state.formData.type}

Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey there! Welcome to your ${state.formData.jobPosition} interview. Let's get started with a few questions!"

Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below are the questions to ask one by one:

Questions:
${questionList}

Guidelines:
✅ Be friendly, engaging, and professional 🎤
✅ Keep responses short and natural, like a real conversation
✅ Provide brief, encouraging feedback after each answer
✅ If the candidate struggles, offer hints or rephrase the question
✅ After all questions, wrap up the interview smoothly
✅ End on a positive note

Key Points:
- Ask questions in order
- Wait for complete responses
- Provide constructive feedback
- Keep the conversation flowing naturally
- Focus on the ${state.formData.jobPosition} role requirements
`.trim(),
          },
        ],
      },
    };

    try {
      vapi.start(assistantOptions);
      setIsCallActive(true);
    } catch (error) {
      console.error("Error starting VAPI:", error);
    }
  };

  const toggleMute = () => {
    if (vapi && isCallActive) {
      setIsMuted(!isMuted);
      vapi.setMuted(!isMuted);
    }
  };

  const stopInterview = async () => {
    if (vapi && isCallActive) {
      vapi.stop();
      setIsCallActive(false);
    }
    setInterviewEnded(true);
    setFeedbackGenerated(true); // Prevent the useEffect from also navigating

    // Navigate immediately to complete page
    navigate("/ai-interview/complete", {
      state: {
        completedQuestions: state?.questionsList?.length || 0,
        totalQuestions: state?.questionsList?.length || 0,
        formData: state?.formData,
        aiInterviewId: state?.aiInterviewId,
        timeElapsed,
        conversation,
        feedback: null, // Will be generated on the complete page
      },
      replace: true, // This prevents going back to this page
    });
  };

  // Show loading if no interview data
  if (!state?.questionsList || !state?.formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="p-8 bg-white/10 backdrop-blur-sm">
          <h1 className="text-xl font-bold text-white mb-4">
            Loading Interview...
          </h1>
          <p className="text-white/70">
            Please wait while we prepare your interview.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-bold text-xl text-white flex justify-between items-center">
            <span>AI Interview Session - {state.formData.jobPosition}</span>
            <span className="flex gap-2 items-center text-green-400">
              <Timer className="h-5 w-5" />
              {formatTime(timeElapsed)}
            </span>
          </h2>
        </div>
      </div>

      {/* Main Content */}

      <div className="p-8 lg:px-16 xl:px-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* AI Interviewer */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/10 h-[400px] flex flex-col gap-4 items-center justify-center relative overflow-hidden">
            {/* Spline 3D Model */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <Spline
                  scene="https://prod.spline.design/WW8S3qmY9K7DUqfh/scene.splinecode"
                  className="w-full h-full"
                  style={{
                    background: "transparent",
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
                  }}
                />
              </div>

              {/* Animated border when active */}
              {isCallActive && (
                <div className="absolute inset-2 rounded-lg border-2 border-blue-400/50 animate-pulse pointer-events-none"></div>
              )}

              {/* AI Recruiter Info Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="rounded-lg px-4 py-3">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    AI Recruiter
                  </h3>

                  {/* Live indicator */}
                  {isCallActive && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs font-medium">
                        Live Interview
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Candidate */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/10 h-[400px] flex flex-col gap-4 items-center justify-center relative overflow-hidden">
            {/* Camera Video or Avatar */}
            <div className="relative w-full h-full flex items-center justify-center">
              {isCameraOn ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover rounded-lg bg-black"
                    style={{ transform: "scaleX(-1)" }} // Mirror the video for better user experience
                    onError={(e) => console.error("Video element error:", e)}
                    onLoadedData={() => console.log("Video data loaded")}
                    onPlay={() => console.log("Video started playing")}
                  />
                  {/* Camera overlay info */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-green-600/80 backdrop-blur-sm rounded-full">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-100 text-xs font-medium">
                      Camera On
                    </span>
                  </div>
                  {/* Name overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {user?.fullName || "Candidate"}
                      </h3>
                      {/* <p className="text-white/70 text-sm">
                        {user?.emailAddresses?.[0]?.emailAddress}
                      </p> */}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 items-center justify-center">
                  <Avatar className="w-18 h-18 ring-4 mt-18 ring-white/20">
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
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {user?.fullName || "Candidate"}
                    </h3>
                    {/* <p className="text-white/70 text-sm">
                      {user?.emailAddresses?.[0]?.emailAddress}
                    </p> */}
                  </div>
                  {/* Camera off indicator */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600/20 rounded-full">
                    <CameraOff className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Camera Off</span>
                  </div>
                </div>
              )}
            </div>

            {/* Interview Info - Always visible */}
          </Card>
        </div>

        {/* Interview Controls */}
        <div className="flex items-center justify-center gap-6 mt-12">
          {/* Camera Toggle */}
          <Button
            onClick={toggleCamera}
            size="lg"
            className={`w-16 h-16 rounded-full ${
              isCameraOn
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
          >
            {isCameraOn ? (
              <Camera className="h-8 w-8" />
            ) : (
              <CameraOff className="h-8 w-8" />
            )}
          </Button>

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

          {/* End Interview Button */}
          <AlertConformation stopInterview={stopInterview}>
            <Button
              size="lg"
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
          </AlertConformation>
        </div>

        {/* Live Conversation Display */}
        {isCallActive && (
          <div className="mt-8">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 max-w-4xl mx-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">
                  Live Conversation
                </h3>

                {/* Current Message Display */}
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

        {/* Status */}
        <div className="text-center mt-8">
          <p className="text-white/70 text-sm">
            {isCallActive
              ? "Interview is in progress. Speak clearly into your microphone."
              : "Preparing to start interview..."}
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                isCameraOn ? "bg-blue-600/20" : "bg-gray-600/20"
              }`}
            >
              {isCameraOn ? (
                <Camera className="h-4 w-4 text-blue-400" />
              ) : (
                <CameraOff className="h-4 w-4 text-gray-400" />
              )}
              <span
                className={`text-xs ${isCameraOn ? "text-blue-400" : "text-gray-400"}`}
              >
                Camera {isCameraOn ? "On" : "Off"}
              </span>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                !isMuted && isCallActive ? "bg-green-600/20" : "bg-gray-600/20"
              }`}
            >
              {!isMuted && isCallActive ? (
                <Mic className="h-4 w-4 text-green-400" />
              ) : (
                <MicOff className="h-4 w-4 text-gray-400" />
              )}
              <span
                className={`text-xs ${!isMuted && isCallActive ? "text-green-400" : "text-gray-400"}`}
              >
                Mic {!isMuted && isCallActive ? "On" : "Off"}
              </span>
            </div>
          </div>
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
