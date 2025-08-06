import { useEffect, useState } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import LoaderUI from "../LoaderUI";
import { useUser } from "@clerk/clerk-react";
import { useStreamToken } from "../../actions/stream.actions";

const StreamClientProvider = ({ children }: { children: React.ReactNode }) => {
  const [streamVideoClient, setStreamVideoClient] =
    useState<StreamVideoClient>();
  const { user, isLoaded } = useUser();
  const { generateToken } = useStreamToken();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const client = new StreamVideoClient({
      apiKey: import.meta.env.VITE_PUBLIC_STREAM_API_KEY!,
      user: {
        id: user?.id,
        name:
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.id,
        image: user?.imageUrl,
      },
      tokenProvider: generateToken,
    });

    setStreamVideoClient(client);
  }, [user, isLoaded, generateToken]);

  if (!streamVideoClient) return <LoaderUI />;

  return <StreamVideo client={streamVideoClient}>{children}</StreamVideo>;
};

export default StreamClientProvider;
