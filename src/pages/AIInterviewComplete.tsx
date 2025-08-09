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
import { useEffect } from "react";
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
}

export default function AIInterviewComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // Redirect if no data is available
  useEffect(() => {
    if (!state?.completedQuestions || !state?.formData) {
      navigate("/ai-interview");
    }
  }, [state, navigate]);

  if (!state?.completedQuestions || !state?.formData) {
    return null;
  }

  const {
    // completedQuestions,
    // totalQuestions,
    formData,
    feedback,
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
            Great job completing your AI practice session for{" "}
            {formData.jobPosition}
          </p>
        </div>

        {/* AI Feedback */}
        {feedback && (
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
        )}

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
