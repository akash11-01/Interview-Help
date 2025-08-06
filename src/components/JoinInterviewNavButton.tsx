import { Users } from "lucide-react";
import { useState } from "react";
import { useUserRole } from "../hooks/useUserRole";
import MeetingModal from "./MeetingModal";

function JoinInterviewNavButton() {
  const { isInterviewer, isLoading } = useUserRole();
  const [showModal, setShowModal] = useState(false);

  // Only show for candidates (non-interviewers)
  if (isLoading || isInterviewer) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center cursor-pointer gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-md transition-all duration-200 shadow-sm hover:shadow-md border border-green-500/20"
        title="Join an interview meeting"
      >
        <Users className="h-4 w-4" />
        <span>Join Interview</span>
      </button>

      <MeetingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Join Meeting"
        isJoinMeeting={true}
      />
    </>
  );
}

export default JoinInterviewNavButton;
