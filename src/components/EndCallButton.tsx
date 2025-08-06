import { useCall, useCallStateHooks } from "@stream-io/video-react-sdk";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function EndCallButton() {
  const call = useCall();
  const navigate = useNavigate();
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const updateInterviewStatus = useMutation(
    api.interviews.updateInterviewStatus
  );

  const interview = useQuery(api.interviews.getInterviewByStreamCallId, {
    streamCallId: call?.id || "",
  });

  console.log("EndCallButton - call:", call);
  console.log("EndCallButton - call.id:", call?.id);
  console.log("EndCallButton - interview:", interview);
  console.log("EndCallButton - localParticipant:", localParticipant);
  console.log("EndCallButton - call.state.createdBy:", call?.state.createdBy);

  if (!call) {
    console.log("EndCallButton returning null - no call");
    return null;
  }

  // For now, let's show the button even without interview data for debugging
  if (!interview) {
    console.log(
      "EndCallButton - no interview found, showing basic end call button"
    );
    return (
      <Button
        variant={"destructive"}
        onClick={async () => {
          try {
            console.log("Ending call and stopping media...");

            // Stop all media tracks before ending call
            const mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });
            const tracks = mediaStream.getTracks();
            tracks.forEach((track) => {
              track.stop();
              console.log(`Stopped ${track.kind} track`);
            });

            // End the call
            await call.endCall();
            console.log("Call ended successfully");

            navigate("/");
            toast.success("Meeting ended");
          } catch (error) {
            console.error("Error ending call:", error);
            navigate("/");
            toast.error("Failed to end meeting");
          }
        }}
      >
        End Call (Debug)
      </Button>
    );
  }

  const isMeetingOwner = localParticipant?.userId === call.state.createdBy?.id;
  console.log("EndCallButton - isMeetingOwner:", isMeetingOwner);

  if (!isMeetingOwner) {
    console.log("EndCallButton returning null - not meeting owner");
    return null;
  }

  const endCall = async () => {
    try {
      await call.endCall();

      await updateInterviewStatus({
        id: interview._id,
        status: "completed",
      });

      navigate("/");
      toast.success("Meeting ended for everyone");
    } catch (error) {
      console.log(error);
      toast.error("Failed to end meeting");
    }
  };

  return (
    <Button variant={"destructive"} onClick={endCall}>
      End Meeting
    </Button>
  );
}
export default EndCallButton;
