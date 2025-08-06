import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const useMeetingActions = () => {
  const navigate = useNavigate();
  const client = useStreamVideoClient();

  const createInstantMeeting = async () => {
    if (!client) return;

    try {
      const id = crypto.randomUUID();
      const call = client.call("default", id);

      await call.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: {
            description: "Instant Meeting",
          },
        },
      });

      navigate(`/meeting/${call.id}`);
      toast.success("Meeting Created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create meeting");
    }
  };

  const joinMeeting = (callId: string) => {
    if (!client)
      return toast.error("Failed to join meeting. Please try again.");
    navigate(`/meeting/${callId}`);
  };

  return { createInstantMeeting, joinMeeting };
};

export default useMeetingActions;
