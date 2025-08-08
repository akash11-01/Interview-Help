import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Clock,
  Briefcase,
  ArrowLeft,
  Play,
  CheckCircle,
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
}

export default function AiQuestionsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);

  const state = location.state as LocationState;

  // Redirect if no data is available
  useEffect(() => {
    if (!state?.questionsList || !state?.formData) {
      navigate("/ai-interview");
    }
  }, [state, navigate]);

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
    setIsInterviewStarted(true);
    setCurrentQuestionIndex(0);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInterviewStarted(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Overview
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{formData.jobPosition}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {questionsList.length}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <Card className="p-8 mb-8 shadow-xl">
            <div className="mb-4">
              <Badge className={getTypeColor(currentQuestion.type)}>
                {currentQuestion.type}
              </Badge>
            </div>
            <h2 className="text-xl font-semibold mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
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
          </Card>

          {/* Interview Tips */}
          <Card className="p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200/50">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
              💡 Interview Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <li>• Take your time to think before answering</li>
              <li>
                • Use the STAR method for behavioral questions (Situation, Task,
                Action, Result)
              </li>
              <li>
                • Be specific with examples and quantify achievements where
                possible
              </li>
              <li>• Don't hesitate to ask clarifying questions</li>
            </ul>
          </Card>
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

        {/* Start Interview Button */}
        <div className="text-center">
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
