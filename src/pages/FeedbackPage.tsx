import { useQuery } from "convex/react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Star, Calendar, Clock } from "lucide-react";
import { api } from "../../convex/_generated/api";
import LoaderUI from "@/components/LoaderUI";
import type { Id } from "../../convex/_generated/dataModel";

export default function FeedbackPage() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();

  // Get the interview details
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId: interviewId as Id<"interviews"> } : "skip"
  );

  // Get comments/feedback for this interview
  const comments = useQuery(
    api.comments.getCommentsByInterview,
    interviewId ? { interviewId: interviewId as Id<"interviews"> } : "skip"
  );

  if (interview === undefined || comments === undefined) {
    return <LoaderUI />;
  }

  if (!interview) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">
            Interview Not Found
          </h1>
          <p className="text-muted-foreground mt-2">
            The interview you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate("/schedule")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Interviews
        </button>
      </div>

      {/* Interview Details */}
      <div className="rounded-lg bg-card p-6 border shadow-sm mb-8">
        <h1 className="text-3xl font-bold mb-4">{interview.title}</h1>
        {interview.description && (
          <p className="text-muted-foreground mb-4">{interview.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(interview.startTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                interview.status === "completed"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : interview.status === "ongoing"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
              }`}
            >
              {interview.status.charAt(0).toUpperCase() +
                interview.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Section */}
      <div className="rounded-lg bg-card p-6 border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Interview Feedback</h2>
        </div>

        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No Feedback Yet
            </h3>
            <p className="text-muted-foreground">
              Your interviewer hasn't provided feedback for this interview yet.
              Feedback will appear here once it's submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment: any) => (
              <div
                key={comment._id}
                className="border rounded-lg p-4 bg-background/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        I
                      </span>
                    </div>
                    <span className="font-medium">Interviewer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(comment.rating)}
                    <span className="text-sm text-muted-foreground ml-2">
                      {comment.rating}/5
                    </span>
                  </div>
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {comments.length > 0 && (
        <div className="rounded-lg bg-card p-6 border shadow-sm mt-6">
          <h3 className="text-lg font-semibold mb-4">Feedback Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {comments.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Comments
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {(
                  comments.reduce((sum: number, c: any) => sum + c.rating, 0) /
                  comments.length
                ).toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                Average Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.max(...comments.map((c: any) => c.rating))}
              </div>
              <div className="text-sm text-muted-foreground">
                Highest Rating
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
