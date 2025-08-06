import LoaderUI from "@/components/LoaderUI";
import { useUserRole } from "@/hooks/useUserRole";
import InterviewScheduleUI from "./InterviewScheduleUI";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function SchedulePage() {
  const navigate = useNavigate();
  const { isInterviewer, isLoading } = useUserRole();

  // Handle navigation in useEffect, not in render
  useEffect(() => {
    if (!isLoading && !isInterviewer) {
      navigate("/");
    }
  }, [isLoading, isInterviewer, navigate]);

  if (isLoading) return <LoaderUI />;

  // Return null while redirecting instead of navigate("/")
  if (!isInterviewer) return null;

  return <InterviewScheduleUI />;
}

export default SchedulePage;
