import {
  Calendar,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUserRole } from "../hooks/useUserRole";
import { useUser } from "@clerk/clerk-react";
import type { Id } from "../../convex/_generated/dataModel";

interface Interview {
  _id: Id<"interviews">;
  title: string;
  description?: string;
  startTime: number;
  status: string;
  streamCallId: string;
  candidateId: string;
  interviewerIds: string[];
}

interface MeetingCardProps {
  interview: Interview;
}

function MeetingCard({ interview }: MeetingCardProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isInterviewer } = useUserRole();
  const updateStatus = useMutation(api.interviews.updateInterviewStatus);
  const meetingDate = new Date(interview.startTime);

  // Check if current user is an interviewer for this interview
  const canUpdateStatus =
    isInterviewer && user?.id && interview.interviewerIds.includes(user.id);

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "upcoming":
        return "completed";
      case "completed":
        return "succeeded";
      default:
        return currentStatus;
    }
  };

  const getPreviousStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "succeeded":
        return "completed";
      case "completed":
        return "upcoming";
      default:
        return currentStatus;
    }
  };

  const handleStatusUpdate = async (
    e: React.MouseEvent,
    direction: "forward" | "backward"
  ) => {
    e.stopPropagation(); // Prevent card click navigation

    if (!canUpdateStatus) return;

    const newStatus =
      direction === "forward"
        ? getNextStatus(interview.status)
        : getPreviousStatus(interview.status);

    if (newStatus !== interview.status) {
      try {
        await updateStatus({
          id: interview._id,
          status: newStatus,
        });
      } catch (error) {
        console.error("Failed to update interview status:", error);
      }
    }
  };

  const handleCardClick = () => {
    // Navigate to feedback page for this interview
    navigate(`/feedback/${interview._id}`);
  };

  return (
    <div
      className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer hover:bg-accent/50"
      onClick={handleCardClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg truncate">{interview.title}</h3>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              interview.status === "upcoming"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : interview.status === "completed"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : interview.status === "succeeded"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    : interview.status === "cancelled"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            }`}
          >
            {interview.status}
          </span>
        </div>

        {interview.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {interview.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {meetingDate.toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {meetingDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {interview.interviewerIds.length + 1} participants
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Click to view feedback
          </p>

          {canUpdateStatus && (
            <div className="flex items-center gap-2">
              {/* Backward Button */}
              {interview.status !== "upcoming" && (
                <button
                  onClick={(e) => handleStatusUpdate(e, "backward")}
                  className="px-2 py-1 text-xs rounded-full border border-gray-400 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-950 transition-colors flex items-center gap-1"
                  title={
                    interview.status === "succeeded"
                      ? "Mark as completed"
                      : interview.status === "completed"
                        ? "Mark as upcoming"
                        : ""
                  }
                >
                  <ChevronLeft className="h-3 w-3" />
                  Back
                </button>
              )}

              {/* Forward Button */}
              {interview.status !== "succeeded" && (
                <button
                  onClick={(e) => handleStatusUpdate(e, "forward")}
                  className={`
                    px-3 py-1 text-xs rounded-full border transition-colors flex items-center gap-1
                    ${
                      interview.status === "upcoming"
                        ? "border-blue-500 text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950"
                        : interview.status === "completed"
                          ? "border-green-500 text-green-700 hover:bg-green-50 dark:text-green-300 dark:hover:bg-green-950"
                          : "border-gray-300 text-gray-500 cursor-not-allowed"
                    }
                  `}
                  title={
                    interview.status === "upcoming"
                      ? "Mark as completed"
                      : interview.status === "completed"
                        ? "Mark as succeeded"
                        : "Interview already succeeded"
                  }
                >
                  {interview.status === "upcoming" && "Mark Complete"}
                  {interview.status === "completed" && "Mark Succeeded"}
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}

              {/* Status Display when Succeeded */}
              {interview.status === "succeeded" && (
                <span className="px-3 py-1 text-xs rounded-full border border-emerald-500 text-emerald-700 dark:text-emerald-300">
                  ✓ Succeeded
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MeetingCard;
