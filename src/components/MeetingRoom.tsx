import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  CallingState,
  CallControls,
  CallParticipantsList,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from "@stream-io/video-react-sdk";
import { LayoutListIcon, LoaderIcon, UsersIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CodeEditor from "./CodeEditor";

function MeetingRoom() {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<"grid" | "speaker">("speaker");
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState, useMicrophoneState, useCameraState } =
    useCallStateHooks();
  const call = useCall();

  const callingState = useCallCallingState();
  const { microphone } = useMicrophoneState();
  const { camera } = useCameraState();

  // Navigate away when call ends and stop media devices
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      const cleanupAndNavigate = async () => {
        console.log("Call ended, starting comprehensive cleanup...");

        try {
          // Step 1: Use Stream.io SDK to properly disable devices
          if (microphone && microphone.enabled) {
            console.log("Disabling microphone via Stream.io...");
            await microphone.disable();
          }

          if (camera && camera.enabled) {
            console.log("Disabling camera via Stream.io...");
            await camera.disable();
          }

          // Step 2: Use the call object to leave and cleanup
          if (call) {
            console.log("Leaving call and cleaning up...");
            await call.leave();
          }

          // Step 3: Additional cleanup for any remaining media tracks
          const stopAllMediaTracks = () => {
            return new Promise<void>((resolve) => {
              // Stop all video and audio elements
              const mediaElements = document.querySelectorAll("video, audio");
              mediaElements.forEach((element: any) => {
                if (
                  element.srcObject &&
                  element.srcObject instanceof MediaStream
                ) {
                  element.srcObject
                    .getTracks()
                    .forEach((track: MediaStreamTrack) => {
                      console.log(
                        `Stopping ${track.kind} track - state: ${track.readyState}`
                      );
                      track.stop();
                    });
                  element.srcObject = null;
                }
              });

              // Additional delay to ensure all cleanup is complete
              setTimeout(() => {
                console.log("Media cleanup completed");
                resolve();
              }, 100);
            });
          };

          await stopAllMediaTracks();
        } catch (error) {
          console.error("Error during cleanup:", error);
        } finally {
          // Navigate with a delay to ensure cleanup is complete
          setTimeout(() => {
            console.log("Navigating to home page...");
            navigate("/");
          }, 300);
        }
      };

      cleanupAndNavigate();
    }
  }, [callingState, navigate, microphone, camera, call]);

  // Cleanup on component unmount - only when actually leaving
  useEffect(() => {
    return () => {
      // Only perform cleanup if we're not in an active call
      if (callingState !== CallingState.JOINED) {
        console.log("MeetingRoom unmounting with cleanup...");

        if (microphone && microphone.enabled) {
          microphone.disable().catch(console.error);
        }
        if (camera && camera.enabled) {
          camera.disable().catch(console.error);
        }

        // Stop all media tracks when component unmounts
        const mediaElements = document.querySelectorAll("video, audio");
        mediaElements.forEach((element: any) => {
          if (element.srcObject && element.srcObject instanceof MediaStream) {
            element.srcObject.getTracks().forEach((track: MediaStreamTrack) => {
              if (track.readyState === "live") {
                track.stop();
                console.log(`Unmount cleanup - stopped ${track.kind} track`);
              }
            });
            element.srcObject = null;
          }
        });
      } else {
        console.log(
          "MeetingRoom unmounting but call is active - skipping cleanup"
        );
      }
    };
  }, [callingState, microphone, camera]);

  // Simplified page unload handler - only for true emergencies
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only cleanup when page is being hidden and call is not active
      if (
        document.visibilityState === "hidden" &&
        callingState === CallingState.LEFT
      ) {
        console.log("Page hidden and call ended - emergency cleanup...");
        document.querySelectorAll("video, audio").forEach((element: any) => {
          if (element.srcObject && element.srcObject instanceof MediaStream) {
            element.srcObject.getTracks().forEach((track: MediaStreamTrack) => {
              track.stop();
            });
            element.srcObject = null;
          }
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [callingState]);

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoaderIcon className="size-6 animate-spin" />
        <span className="ml-2">Connecting... ({callingState})</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem-1px)]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={25}
          maxSize={100}
          className="relative"
        >
          {/* VIDEO LAYOUT */}
          <div className="absolute inset-0">
            {layout === "grid" ? <PaginatedGridLayout /> : <SpeakerLayout />}

            {/* PARTICIPANTS LIST OVERLAY */}
            {showParticipants && (
              <div className="absolute right-0 top-0 h-full w-[300px] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CallParticipantsList
                  onClose={() => setShowParticipants(false)}
                />
              </div>
            )}
          </div>

          {/* VIDEO CONTROLS */}
          <div className="absolute bottom-4 left-0 right-0 z-50">
            <div className="flex flex-col items-center gap-4">
              {/* Stream.io CallControls */}
              <CallControls />

              <div className="flex items-center gap-2 flex-wrap justify-center px-4 bg-black/50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="size-10">
                        <LayoutListIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setLayout("grid")}>
                        Grid View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLayout("speaker")}>
                        Speaker View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10"
                    onClick={() => setShowParticipants(!showParticipants)}
                  >
                    <UsersIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={65} minSize={25}>
          <CodeEditor />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
export default MeetingRoom;
