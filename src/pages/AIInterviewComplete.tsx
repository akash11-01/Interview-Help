import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Trophy, BarChart3, Home, RotateCcw } from "lucide-react";
import { useEffect } from "react";

interface LocationState {
  completedQuestions: number;
  totalQuestions: number;
  formData: {
    jobPosition: string;
    jobDescription: string;
    duration: string;
    type: string;
  };
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

  const { completedQuestions, totalQuestions, formData } = state;
  const completionRate = Math.round(
    (completedQuestions / totalQuestions) * 100
  );

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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200/50">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-blue-600 mb-1">
              {completedQuestions}
            </h3>
            <p className="text-blue-600/80 text-sm">Questions Completed</p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-r from-green-500/10 to-emerald-600/10 border-green-200/50">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-1">
              {completionRate}%
            </h3>
            <p className="text-green-600/80 text-sm">Completion Rate</p>
          </Card>

          <Card className="p-6 text-center bg-gradient-to-r from-purple-500/10 to-violet-600/10 border-purple-200/50">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-purple-600 mb-1">
              {formData.type}
            </h3>
            <p className="text-purple-600/80 text-sm">Interview Type</p>
          </Card>
        </div>

        {/* Interview Summary */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Interview Summary</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">
                Position
              </h3>
              <p className="font-semibold">{formData.jobPosition}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">
                Duration
              </h3>
              <p className="font-semibold">{formData.duration}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">
                Questions Answered
              </h3>
              <p className="font-semibold">
                {completedQuestions} of {totalQuestions}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-600 dark:text-gray-400 mb-2">
                Interview Type
              </h3>
              <p className="font-semibold">{formData.type}</p>
            </div>
          </div>
        </Card>

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
