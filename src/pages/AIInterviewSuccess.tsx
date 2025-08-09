import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Copy,
  Plus,
  Eye,
  Clock,
  Briefcase,
  FileText,
  ExternalLink,
  Share2,
} from "lucide-react";

interface Question {
  question: string;
  type: string;
}

interface FormData {
  jobPosition: string;
  jobDescription: string;
  duration: string;
  type: string;
}

interface Metadata {
  jobPosition: string;
  duration: string;
  type: string;
  generatedAt: string;
  source: string;
}

export default function AIInterviewSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const {
    questionsList = [],
    formData = {} as FormData,
    aiInterviewId,
    metadata = {} as Metadata,
  } = location.state || {};

  // Generate unique interview URL
  const interviewUrl = aiInterviewId
    ? `${window.location.origin}/interview/${aiInterviewId}`
    : "Interview ID not available";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(interviewUrl);
      alert("Interview link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
      alert("Failed to copy link");
    }
  };

  const handleCreateAnother = () => {
    navigate("/ai-interview/setup");
  };

  const handleStartInterview = () => {
    if (aiInterviewId) {
      navigate(`/interview/${aiInterviewId}`, {
        state: { questionsList, formData },
      });
    } else {
      navigate("/ai-interview/questions", {
        state: { questionsList, formData },
      });
    }
  };

  const handleViewHistory = () => {
    navigate("/ai-interview/history");
  };

  if (!questionsList.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            No Interview Data Found
          </h1>
          <p className="text-gray-600 mb-6">
            It looks like you navigated here directly. Please create an
            interview first.
          </p>
          <Button onClick={() => navigate("/ai-interview/setup")}>
            Create New Interview
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Success Header */}
      <Card className="mb-6 p-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-green-800">
              Interview Successfully Generated! 🎉
            </h1>
            <p className="text-green-700">
              Your AI-powered interview questions are ready
            </p>
          </div>
        </div>

        {/* Interview Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-gray-600" />
            <span className="font-medium">{formData.jobPosition}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-gray-600" />
            <span>{formData.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-gray-600" />
            <span>{formData.type}</span>
          </div>
        </div>

        {/* Interview Link */}
        {aiInterviewId && (
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Unique Interview Link:
              </label>
              <Badge
                variant={
                  metadata.source === "openrouter-ai" ? "default" : "secondary"
                }
              >
                {metadata.source === "openrouter-ai"
                  ? "AI Generated"
                  : "Fallback"}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Input
                value={interviewUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                title="Copy link"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(interviewUrl, "_blank")}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <Button
          onClick={handleStartInterview}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Start Interview
        </Button>
        <Button
          variant="outline"
          onClick={handleCreateAnother}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Another
        </Button>
        <Button
          variant="outline"
          onClick={handleViewHistory}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          View History
        </Button>
        <Button
          variant="outline"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Link
        </Button>
      </div>

      {/* Generated Questions Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            Generated Questions ({questionsList.length})
          </h2>
          <Button
            variant="outline"
            onClick={() => setShowAllQuestions(!showAllQuestions)}
          >
            {showAllQuestions ? "Show Less" : "Show All"}
          </Button>
        </div>

        <div className="space-y-4">
          {(showAllQuestions ? questionsList : questionsList.slice(0, 3)).map(
            (question: Question, index: number) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    {question.type}
                  </Badge>
                  <div className="flex-1">
                    <span className="font-medium text-gray-700 mr-2">
                      Q{index + 1}.
                    </span>
                    <span className="text-gray-800">{question.question}</span>
                  </div>
                </div>
              </div>
            )
          )}

          {!showAllQuestions && questionsList.length > 3 && (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-2">
                +{questionsList.length - 3} more questions available
              </p>
              <Button
                variant="ghost"
                onClick={() => setShowAllQuestions(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                View all {questionsList.length} questions
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Additional Info */}
      <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-800 mb-2">💡 What's Next?</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Share the unique interview link with candidates</li>
          <li>• Start the interview to practice or conduct it live</li>
          <li>• Create additional interviews for different roles</li>
          <li>• View your interview history anytime</li>
        </ul>
      </Card>
    </div>
  );
}
