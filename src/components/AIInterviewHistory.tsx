import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Briefcase, FileText } from "lucide-react";

export default function AIInterviewHistory() {
  const { user } = useUser();
  const aiInterviews = useQuery(
    api.aiInterviews.getAiInterviewsByUser,
    user?.id ? { userId: user.id } : "skip"
  );

  if (!user) {
    return <div>Please log in to view your AI interview history.</div>;
  }

  if (aiInterviews === undefined) {
    return <div>Loading your AI interviews...</div>;
  }

  if (aiInterviews.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No AI interviews yet
        </h3>
        <p className="text-gray-500">
          Create your first AI interview to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Your AI Interview History</h2>
      {aiInterviews.map((interview) => (
        <Card key={interview._id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {interview.jobPosition}
              </h3>
              <p className="text-gray-600 mt-1">{interview.jobDescription}</p>
            </div>
            <Badge
              variant={
                interview.source === "openrouter-ai" ? "default" : "secondary"
              }
            >
              {interview.source === "openrouter-ai"
                ? "AI Generated"
                : "Fallback"}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {interview.duration}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {interview.type}
            </div>
            <div>
              Created: {new Date(interview.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">
              Questions ({interview.questions.length}):
            </h4>
            <div className="space-y-2">
              {interview.questions.slice(0, 3).map((q, index) => (
                <div key={index} className="text-sm">
                  <Badge variant="outline" className="mr-2 text-xs">
                    {q.type}
                  </Badge>
                  <span className="text-gray-700">{q.question}</span>
                </div>
              ))}
              {interview.questions.length > 3 && (
                <p className="text-sm text-gray-500">
                  +{interview.questions.length - 3} more questions...
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
