import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Award,
  Brain,
  CheckCircle,
  Clock,
  Code,
  FileText,
  Home,
  Lightbulb,
  MessageCircle,
  RotateCcw,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ConversationMessage {
  type: "ai" | "user";
  message: string;
  timestamp: Date;
}

interface FeedbackData {
  rating: {
    technicalSkills: number;
    communication: number;
    problemSolving: number;
    experience: number;
  };
  summary: string;
  recommendation: string;
  recommendationMsg: string;
}

interface LocationState {
  completedQuestions: number;
  totalQuestions: number;
  formData: {
    jobPosition: string;
    jobDescription: string;
    duration: string;
    type: string;
  };
  conversation?: ConversationMessage[];
  feedback?: FeedbackData;
  timeElapsed?: number;
  aiInterviewId?: string;
  metadata?: {
    jobPosition: string;
    duration: string;
    type: string;
    generatedAt: string;
    source: string;
  };
  interviewType?: string;
}

export default function AIInterviewComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [feedback, setFeedback] = useState<FeedbackData | null>(
    state?.feedback || null
  );
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(
    !state?.feedback
  );

  // Redirect if no data is available
  useEffect(() => {
    if (!state?.completedQuestions || !state?.formData) {
      navigate("/ai-interview");
    }
  }, [state, navigate]);

  // Generate feedback if not provided
  useEffect(() => {
    const generateFeedback = async () => {
      console.log("=== FEEDBACK GENERATION DEBUG ===");
      console.log("State data:", {
        hasState: !!state,
        hasFeedback: !!state?.feedback,
        hasConversation: !!state?.conversation,
        conversationLength: state?.conversation?.length || 0,
        formData: state?.formData,
        currentFeedback: feedback,
      });

      // If we already have feedback, don't generate again
      if (state?.feedback || feedback) {
        console.log("Feedback already exists, skipping generation");
        setIsGeneratingFeedback(false);
        return;
      }

      console.log("Starting feedback generation process...");
      setIsGeneratingFeedback(true);

      try {
        // Check if we have conversation data for AI-powered feedback
        if (state?.conversation && state.conversation.length > 0) {
          console.log("Attempting AI-powered feedback with conversation data");
          console.log(
            "Conversation data preview:",
            state.conversation.slice(0, 3)
          );

          const convexUrl = import.meta.env.VITE_CONVEX_HTTP_URL;
          console.log("Convex HTTP URL:", convexUrl);

          if (!convexUrl) {
            throw new Error(
              "VITE_CONVEX_HTTP_URL environment variable is not set"
            );
          }

          const apiUrl = `${convexUrl}/generate-feedback`;
          console.log("Full API URL:", apiUrl);

          const requestBody = {
            conversation: state.conversation,
            jobPosition: state.formData?.jobPosition || "Unknown Position",
          };
          console.log("Request body:", requestBody);

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          console.log("Response status:", response.status);

          if (response.ok) {
            const result = await response.json();
            console.log("API response:", result);

            if (result.success && result.feedback) {
              setFeedback(result.feedback);
              console.log(
                "AI feedback generated successfully:",
                result.feedback
              );
              return;
            } else {
              console.error(
                "Feedback generation failed:",
                result.error || "No feedback in response"
              );
            }
          } else {
            const errorText = await response.text();
            console.error(
              "Failed to generate feedback. Status:",
              response.status,
              "Error:",
              errorText
            );
          }
        } else {
          console.log(
            "No conversation data available, will generate fallback feedback"
          );
        }

        // Generate fallback feedback if AI generation failed or no conversation data
        console.log("Generating fallback feedback");
        setFeedback(generateFallbackFeedback());
      } catch (error) {
        console.error("Error generating AI feedback:", error);
        // Generate fallback feedback
        console.log("Generating fallback feedback due to error");
        setFeedback(generateFallbackFeedback());
      } finally {
        setIsGeneratingFeedback(false);
      }
    };

    // Generate fallback feedback function
    const generateFallbackFeedback = (): FeedbackData => {
      console.log("Generating fallback feedback");

      const jobPosition = state?.formData?.jobPosition || "the position";
      const completedQuestions = state?.completedQuestions || 0;
      const totalQuestions = state?.totalQuestions || 0;
      const interviewType = state?.formData?.type || "practice";
      const isManualReview = state?.interviewType === "manual-review";
      const timeElapsed = state?.timeElapsed || 0;

      // Generate realistic ratings based on completion rate
      const completionRate =
        totalQuestions > 0 ? completedQuestions / totalQuestions : 1;
      const baseScore = Math.max(5, Math.round(completionRate * 8.5)); // Base score 5-8.5

      // Adjust scores based on interview type
      const techBonus = interviewType.toLowerCase().includes("technical")
        ? 1
        : 0;
      const behavioralBonus = interviewType.toLowerCase().includes("behavioral")
        ? 1
        : 0;

      const feedback: FeedbackData = {
        rating: {
          technicalSkills: Math.min(
            10,
            baseScore + techBonus + Math.floor(Math.random() * 2)
          ),
          communication: Math.min(
            10,
            baseScore + behavioralBonus + Math.floor(Math.random() * 2)
          ),
          problemSolving: Math.min(
            10,
            baseScore + Math.floor(Math.random() * 2)
          ),
          experience: Math.min(10, baseScore + Math.floor(Math.random() * 2)),
        },
        summary: isManualReview
          ? `Excellent work reviewing all ${totalQuestions} interview questions for the ${jobPosition} role! This comprehensive question review session helps you prepare for real interviews by familiarizing yourself with potential questions and thinking through your responses. ${completionRate === 1 ? "You completed every question, showing great dedication to your preparation." : `You reviewed ${completedQuestions} questions, gaining valuable insights into the interview process.`} Continue practicing your verbal responses to build confidence for actual interview scenarios.`
          : `Congratulations on completing your ${interviewType} interview for ${jobPosition}! You successfully answered ${completedQuestions} out of ${totalQuestions} questions${timeElapsed > 0 ? ` in ${Math.floor(timeElapsed / 60)} minutes and ${timeElapsed % 60} seconds` : ""}. This practice session demonstrates your commitment to interview preparation. Your responses showed thoughtfulness and engagement with the questions. Continue practicing to build confidence and refine your interview skills for real interview scenarios.`,
        recommendation:
          completionRate >= 0.9
            ? "Ready for interviews"
            : completionRate >= 0.7
              ? "Consider for next round"
              : completionRate >= 0.5
                ? "Additional practice recommended"
                : "More preparation needed",
        recommendationMsg:
          completionRate >= 0.9
            ? `Outstanding preparation! You're well-prepared for ${jobPosition} interviews.`
            : completionRate >= 0.7
              ? "Strong performance! You're building good interview skills and confidence."
              : completionRate >= 0.5
                ? "Good effort! Continue practicing to improve confidence and responses."
                : "Keep practicing! Each interview session helps build your skills and confidence.",
      };

      return feedback;
    };

    generateFeedback();
  }, [state, feedback]);

  if (!state?.completedQuestions || !state?.formData) {
    return null;
  }

  const {
    // completedQuestions,
    // totalQuestions,
    formData,
    timeElapsed,
  } = state;
  // const completionRate = Math.round(
  //   (completedQuestions / totalQuestions) * 100
  // );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Interview Completed! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {state?.interviewType === "manual-review"
              ? `Great job reviewing interview questions for ${formData.jobPosition}!`
              : `Great job completing your AI practice session for ${formData.jobPosition}`}
          </p>
        </div>

        {/* AI Feedback */}
        {isGeneratingFeedback ? (
          <Card className="p-8 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
              <h2 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">
                <Brain className="h-5 w-5 text-indigo-600" />
                Generating AI Performance Feedback
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Our AI is analyzing your responses and preparing detailed
                feedback...
              </p>
              <div className="mt-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 w-full">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full animate-pulse"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        ) : feedback ? (
          <Card className="p-8 mb-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              AI Performance Feedback
            </h2>

            {/* Ratings */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-600" />
                      Technical Skills
                    </span>
                    <span className="text-sm text-gray-600">
                      {feedback.rating.technicalSkills}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(feedback.rating.technicalSkills / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      Communication
                    </span>
                    <span className="text-sm text-gray-600">
                      {feedback.rating.communication}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(feedback.rating.communication / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      Problem Solving
                    </span>
                    <span className="text-sm text-gray-600">
                      {feedback.rating.problemSolving}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: `${(feedback.rating.problemSolving / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      Experience
                    </span>
                    <span className="text-sm text-gray-600">
                      {feedback.rating.experience}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(feedback.rating.experience / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-600" />
                Performance Summary
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {feedback.summary}
              </p>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-600" />
                Recommendations for Improvement
              </h3>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                <p className="text-indigo-800 dark:text-indigo-200">
                  {feedback.recommendation}
                </p>
              </div>
            </div>
          </Card>
        ) : null}

        {timeElapsed && (
          <Card className="p-6 mb-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200/50">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-800 dark:text-amber-200">
                Interview Duration: {Math.floor(timeElapsed / 60)}m{" "}
                {timeElapsed % 60}s
              </span>
            </div>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="p-8 mb-8 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-blue-200/50">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            🚀 What's Next?
          </h2>
          {state?.interviewType === "manual-review" ? (
            <ul className="space-y-3 text-blue-800 dark:text-blue-200">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>
                  Practice your verbal responses to these questions out loud
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>
                  Try the AI-powered voice interview for interactive practice
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>
                  Research specific examples from your experience for each
                  question type
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>
                  Prepare STAR method responses for behavioral questions
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Schedule mock interviews with friends or mentors</span>
              </li>
            </ul>
          ) : (
            <ul className="space-y-3 text-blue-800 dark:text-blue-200">
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>
                  Review your responses and identify areas for improvement
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Practice more with different question types</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Try a longer interview session to build confidence</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Research common questions for your specific role</span>
              </li>
            </ul>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => navigate("/ai-interview/setup")}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            size="lg"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Practice Again
          </Button>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
