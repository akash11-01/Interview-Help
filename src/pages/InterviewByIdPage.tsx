import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Briefcase,
  FileText,
  Play,
  ArrowLeft,
  Calendar,
} from "lucide-react";

export default function InterviewByIdPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const interview = useQuery(
    api.aiInterviews.getAiInterviewById,
    id ? { id: id as Id<"aiInterviews"> } : "skip"
  );

  if (!id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Interview ID
          </h1>
          <p className="text-gray-600 mb-6">
            The interview ID is missing or invalid.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (interview === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (interview === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Interview Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The interview you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const handleStartInterview = () => {
    navigate("/ai-interview/questions", {
      state: {
        questionsList: interview.questions,
        formData: {
          jobPosition: interview.jobPosition,
          jobDescription: interview.jobDescription,
          duration: interview.duration,
          type: interview.type,
        },
        aiInterviewId: interview._id,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">AI Interview</h1>
          <p className="text-gray-600">Ready to begin your interview</p>
        </div>
      </div>

      {/* Interview Details Card */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold flex items-center gap-3 mb-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              {interview.jobPosition}
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              {interview.jobDescription}
            </p>
          </div>
          <Badge
            variant={
              interview.source === "openrouter-ai" ? "default" : "secondary"
            }
          >
            {interview.source === "openrouter-ai" ? "AI Generated" : "Fallback"}
          </Badge>
        </div>

        {/* Interview Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium">Duration</p>
              <p className="text-sm text-gray-600">{interview.duration}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium">Type</p>
              <p className="text-sm text-gray-600">{interview.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium">Created</p>
              <p className="text-sm text-gray-600">
                {new Date(interview.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Start Interview Button */}
        <div className="text-center">
          <Button
            onClick={handleStartInterview}
            size="lg"
            className="flex items-center gap-3 px-8 py-6 text-lg"
          >
            <Play className="h-5 w-5" />
            Start Interview ({interview.questions.length} Questions)
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            This interview contains {interview.questions.length} carefully
            crafted questions
          </p>
        </div>
      </Card>

      {/* Questions Preview */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Questions Preview</h3>
        <div className="space-y-3">
          {interview.questions.slice(0, 3).map((question, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg bg-gray-50 flex items-start gap-3"
            >
              <Badge variant="outline" className="mt-0.5">
                {question.type}
              </Badge>
              <div className="flex-1">
                <span className="font-medium text-gray-700 mr-2">
                  Q{index + 1}.
                </span>
                <span className="text-gray-800">{question.question}</span>
              </div>
            </div>
          ))}

          {interview.questions.length > 3 && (
            <p className="text-center text-gray-500 py-2">
              +{interview.questions.length - 3} more questions in this interview
            </p>
          )}
        </div>
      </Card>

      {/* Instructions Card */}
      <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">
          📋 Interview Instructions
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Take your time to read each question carefully</li>
          <li>• Provide detailed answers with specific examples</li>
          <li>• Click "Start Interview" when you're ready to begin</li>
          <li>• You can navigate between questions during the interview</li>
        </ul>
      </Card>
    </div>
  );
}
