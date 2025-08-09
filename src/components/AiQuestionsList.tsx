import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Bot,
  Clock,
  Briefcase,
  ArrowLeft,
  Play,
  CheckCircle,
  MicOff,
  RotateCcw,
  Volume2,
  User,
  Copy,
} from "lucide-react";

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

// VAPI types
declare global {
  interface Window {
    Vapi: any;
  }
}

export default function AiQuestionsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);
  const [isVapiActive, setIsVapiActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [vapiAssistant, setVapiAssistant] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const state = location.state as LocationState;

  // Redirect if no data is available
  useEffect(() => {
    if (!state?.questionsList || !state?.formData) {
      navigate("/ai-interview");
    }
  }, [state, navigate]);

  // Copy interview link functionality
  const copyInterviewLink = async () => {
    if (!state?.aiInterviewId) {
      alert("Interview ID not available");
      return;
    }

    const interviewUrl = `${window.location.origin}/interview/${state.aiInterviewId}`;

    try {
      await navigator.clipboard.writeText(interviewUrl);
      alert("Interview link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = interviewUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        alert("Interview link copied to clipboard!");
      } catch (fallbackError) {
        alert(`Copy failed. Please copy manually: ${interviewUrl}`);
      }
      document.body.removeChild(textArea);
    }
  };

  // Timer functionality
  useEffect(() => {
    if (isTimerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerActive(false);
      // Auto move to next question when timer expires
      handleNextQuestion();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerActive, timeRemaining]);

  // Format timer display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // VAPI Integration
  useEffect(() => {
    // Load VAPI SDK
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js";
    script.onload = () => {
      if (window.Vapi) {
        const vapi = new window.Vapi(
          import.meta.env.VITE_PUBLIC_VAPI_WEB_TOKEN
        );
        setVapiAssistant(vapi);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startVoiceQuestion = async () => {
    if (!vapiAssistant) return;

    const currentQuestion = questionsList[currentQuestionIndex];

    try {
      setIsVapiActive(true);
      setTimeRemaining(180); // Reset to 3 minutes
      setIsTimerActive(true);

      await vapiAssistant.start({
        assistantId: import.meta.env.VITE_PUBLIC_VAPI_WORKFLOW_ID,
        message: currentQuestion.question,
      });
    } catch (error) {
      console.error("Error starting VAPI:", error);
      setIsVapiActive(false);
    }
  };

  const stopVoiceQuestion = () => {
    if (vapiAssistant) {
      vapiAssistant.stop();
      setIsVapiActive(false);
      setIsTimerActive(false);
    }
  };

  const resetTimer = () => {
    setTimeRemaining(180);
    setIsTimerActive(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  if (!state?.questionsList || !state?.formData) {
    return null;
  }

  const { questionsList, formData } = state;

  const getTypeColor = (type: string) => {
    const colors = {
      Technical:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      Behavioral:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      Experience:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      "Problem Solving":
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      Leadership:
        "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300",
    };
    return (
      colors[type as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
    );
  };

  const handleStartInterview = () => {
    navigate("/ai-interview/live", {
      state: {
        questionsList: state.questionsList,
        formData: state.formData,
        aiInterviewId: state.aiInterviewId,
        metadata: state.metadata,
      },
    });
  };

  const handleNextQuestion = () => {
    setCompletedQuestions((prev) => [...prev, currentQuestionIndex]);
    if (currentQuestionIndex < questionsList.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Interview completed
      navigate("/ai-interview/complete", {
        state: {
          completedQuestions: completedQuestions.length + 1,
          totalQuestions: questionsList.length,
          formData,
        },
      });
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isInterviewStarted) {
    const currentQuestion = questionsList[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questionsList.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInterviewStarted(false)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Interview
              </Button>
              <div className="text-white">
                <h1 className="text-xl font-bold">{formData.jobPosition}</h1>
                <p className="text-white/70 text-sm">
                  Question {currentQuestionIndex + 1} of {questionsList.length}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-64">
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-white/70 text-xs mt-1 text-center">
                {Math.round(progress)}% Complete
              </p>
            </div>
          </div>
        </div>

        {/* Main Interview Interface */}
        <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Side - AI Interviewer */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Avatar and Question */}
              <Card className="p-8 h-full bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border-white/10 backdrop-blur-sm">
                <div className="flex flex-col h-full">
                  {/* AI Avatar */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                        <Bot className="h-8 w-8 text-white" />
                      </div>
                      {isVapiActive && (
                        <div className="absolute -inset-2 rounded-full border-2 border-blue-400 animate-pulse"></div>
                      )}
                    </div>
                    <div className="text-white">
                      <h3 className="text-xl font-semibold">AI Interviewer</h3>
                      <p className="text-white/70">
                        {isVapiActive
                          ? "Listening to your response..."
                          : "Ready to ask questions"}
                      </p>
                    </div>
                  </div>

                  {/* Current Question */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="mb-6">
                      <Badge className="bg-white/20 text-white border-white/30 mb-4">
                        {currentQuestion.type}
                      </Badge>
                      <h2 className="text-2xl font-semibold text-white leading-relaxed mb-6">
                        {currentQuestion.question}
                      </h2>
                    </div>

                    {/* Voice Controls */}
                    <div className="flex gap-4 justify-center">
                      {!isVapiActive ? (
                        <Button
                          onClick={startVoiceQuestion}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4"
                        >
                          <Volume2 className="h-5 w-5 mr-2" />
                          Start Voice Question
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={stopVoiceQuestion}
                            size="lg"
                            variant="destructive"
                            className="px-8 py-4"
                          >
                            <MicOff className="h-5 w-5 mr-2" />
                            Stop Recording
                          </Button>
                          <Button
                            onClick={resetTimer}
                            size="lg"
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-4"
                          >
                            <RotateCcw className="h-5 w-5 mr-2" />
                            Reset Timer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex justify-between pt-6 border-t border-white/10">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 disabled:opacity-50"
                    >
                      Previous Question
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      {currentQuestionIndex === questionsList.length - 1
                        ? "Finish Interview"
                        : "Next Question"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Side - User Info & Timer */}
            <div className="space-y-6">
              {/* User Info Card */}
              <Card className="p-6 bg-white/10 border-white/10 backdrop-blur-sm">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4 ring-4 ring-white/20">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.fullName || "User"}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-lg">
                      {user?.fullName
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {user?.fullName || "Candidate"}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </p>
                  <Badge className="bg-white/20 text-white border-white/30">
                    Candidate
                  </Badge>
                </div>
              </Card>

              {/* Timer Card */}
              <Card className="p-6 bg-gradient-to-br from-orange-900/50 to-red-900/50 border-white/10 backdrop-blur-sm">
                <div className="text-center">
                  <div className="mb-4">
                    <Clock className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-white">
                      Time Remaining
                    </h3>
                  </div>

                  <div
                    className={`text-4xl font-mono font-bold mb-4 ${
                      timeRemaining <= 60
                        ? "text-red-400"
                        : timeRemaining <= 120
                          ? "text-orange-400"
                          : "text-green-400"
                    }`}
                  >
                    {formatTime(timeRemaining)}
                  </div>

                  <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        timeRemaining <= 60
                          ? "bg-red-500"
                          : timeRemaining <= 120
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                      style={{ width: `${(timeRemaining / 180) * 100}%` }}
                    />
                  </div>

                  <p className="text-white/70 text-sm">
                    {isTimerActive
                      ? "Timer is active"
                      : "Click 'Start Voice Question' to begin"}
                  </p>
                </div>
              </Card>

              {/* Interview Stats */}
              <Card className="p-6 bg-white/10 border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">
                  Interview Progress
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-white">
                    <span>Completed:</span>
                    <span className="font-semibold">
                      {completedQuestions.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Current:</span>
                    <span className="font-semibold">
                      {currentQuestionIndex + 1}
                    </span>
                  </div>
                  <div className="flex justify-between text-white">
                    <span>Total:</span>
                    <span className="font-semibold">
                      {questionsList.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-white border-t border-white/10 pt-2">
                    <span>Remaining:</span>
                    <span className="font-semibold text-blue-400">
                      {questionsList.length - currentQuestionIndex - 1}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Interview Tips */}
              <Card className="p-6 bg-white/10 border-white/10 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-4 text-center">
                  💡 Tips
                </h3>
                <ul className="text-sm text-white/70 space-y-2">
                  <li>• Speak clearly when recording</li>
                  <li>• Use the STAR method for behavioral questions</li>
                  <li>• Take your time to think</li>
                  <li>• Be specific with examples</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/ai-interview")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Interview Ready</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {questionsList.length} questions generated for{" "}
                  {formData.jobPosition}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Details */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Position</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {formData.jobPosition}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Duration</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {formData.duration}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold">Type</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{formData.type}</p>
          </Card>
        </div>

        {/* Questions List */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Generated Questions</h2>
          <div className="space-y-4">
            {questionsList.map((question, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <Badge className={getTypeColor(question.type)}>
                      {question.type}
                    </Badge>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">
                    {question.question}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          {/* Copy Interview Link Button */}
          {state?.aiInterviewId && (
            <div>
              <Button
                onClick={copyInterviewLink}
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8 py-3 mr-4"
              >
                <Copy className="h-5 w-5 mr-2" />
                Copy Interview Link
              </Button>
              <p className="text-sm text-gray-400 mt-2">
                Share this link to allow others to access this interview
              </p>
            </div>
          )}

          {/* Start Interview Button */}
          <Button
            onClick={handleStartInterview}
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-4 text-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Start AI Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
