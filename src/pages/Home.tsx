import LoaderUI from "@/components/LoaderUI";
import { useQuery } from "convex/react";
import { Loader2, Video, Calendar, Users, Star, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import { QUICK_ACTIONS } from "../constants";
import { useUserRole } from "../hooks/useUserRole";
import ActionCard from "@/components/ActionCard";
import MeetingModal from "@/components/MeetingModal";
import MeetingCard from "@/components/MeetingCard";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import StreamClientProvider from "@/components/providers/StreamClientProvider";
import AuthenticatedWrapper from "@/components/AuthenticatedWrapper";

export default function Home() {
  return (
    <>
      <SignedIn>
        <AuthenticatedWrapper>
          <StreamClientProvider>
            <main>
              <SignedInHome />
            </main>
          </StreamClientProvider>
        </AuthenticatedWrapper>
      </SignedIn>
      <SignedOut>
        <SignedOutHome />
      </SignedOut>
    </>
  );
}

function SignedInHome() {
  const navigate = useNavigate();

  const { isInterviewer, isLoading } = useUserRole();
  const interviews = useQuery(api.interviews.getMyInterviews);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"start" | "join">();

  const handleQuickAction = (title: string) => {
    switch (title) {
      case "New Call":
        setModalType("start");
        setShowModal(true);
        break;
      case "Join Interview":
        setModalType("join");
        setShowModal(true);
        break;
      default:
        navigate(`/${title.toLowerCase()}`);
    }
  };

  if (isLoading) return <LoaderUI />;

  return (
    <div className="container max-w-7xl mx-auto p-6">
      {/* WELCOME SECTION */}
      <div
        className={`rounded-lg p-8 border shadow-sm mb-10 ${
          isInterviewer
            ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200/50 dark:border-emerald-800/50"
            : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50 dark:border-blue-800/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-4xl font-bold bg-clip-text text-transparent mb-2 ${
                isInterviewer
                  ? "bg-gradient-to-r from-emerald-600 to-teal-500"
                  : "bg-gradient-to-r from-blue-600 to-indigo-500"
              }`}
            >
              {isInterviewer ? "Interviewer Dashboard" : "Candidate Dashboard"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isInterviewer
                ? "Manage your interviews, review candidates, and track your hiring success"
                : "Access your upcoming interviews, prepare for success, and track your progress"}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div
                className={`flex items-center gap-2 text-sm ${
                  isInterviewer
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-blue-600 dark:text-blue-400"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isInterviewer ? "bg-emerald-500" : "bg-blue-500"
                  }`}
                ></div>
                <span>
                  {isInterviewer ? "Active Interviewer" : "Active Candidate"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center ${
                isInterviewer
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
              }`}
            >
              <Users className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {isInterviewer ? (
        <div className="space-y-8">
          {/* STATISTICS SECTION */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-6 border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Interviews
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {interviews?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Upcoming
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {interviews?.filter((i) => i.status === "upcoming")
                      .length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {interviews?.filter(
                      (i) =>
                        i.status === "completed" || i.status === "succeeded"
                    ).length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6 border border-orange-200/50 dark:border-orange-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    This Week
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {interviews?.filter((i) => {
                      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                      return i.startTime > weekAgo;
                    }).length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Quick Actions</h2>
                <p className="text-muted-foreground">
                  Get started with common tasks
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {QUICK_ACTIONS.map((action) => (
                <ActionCard
                  key={action.title}
                  action={action}
                  onClick={() => handleQuickAction(action.title)}
                />
              ))}
            </div>
          </div>

          {/* RECENT INTERVIEWS SECTION */}
          {interviews && interviews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Recent Interviews</h2>
                  <p className="text-muted-foreground">
                    Your latest interview sessions
                  </p>
                </div>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View all →
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {interviews.slice(0, 6).map((interview) => (
                  <MeetingCard key={interview._id} interview={interview} />
                ))}
              </div>
            </div>
          )}

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* CANDIDATE STATISTICS SECTION */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-6 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Interviews
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {interviews?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6 border border-amber-200/50 dark:border-amber-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Upcoming
                  </p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {interviews?.filter((i) => i.status === "upcoming")
                      .length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {interviews?.filter(
                      (i) =>
                        i.status === "completed" || i.status === "succeeded"
                    ).length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-purple-500/10 to-violet-500/10 p-6 border border-purple-200/50 dark:border-purple-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {interviews?.filter((i) => {
                      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                      return i.startTime > monthAgo;
                    }).length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS FOR CANDIDATES */}
          {/* <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Quick Actions</h2>
                <p className="text-muted-foreground">
                  Prepare for your upcoming interviews
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                onClick={() => {
                  setModalType("join");
                  setShowModal(true);
                }}
                className="rounded-lg p-6 border border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 hover:from-blue-500/10 hover:to-indigo-500/10 cursor-pointer transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400">
                      Join Interview
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Enter meeting ID to join
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate("/recordings")}
                className="rounded-lg p-6 border border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 hover:from-emerald-500/10 hover:to-teal-500/10 cursor-pointer transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-600 dark:text-emerald-400">
                      View Recordings
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Check past interview recordings
                    </p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => navigate("/feedback")}
                className="rounded-lg p-6 border border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-r from-purple-500/5 to-violet-500/5 hover:from-purple-500/10 hover:to-violet-500/10 cursor-pointer transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-purple-600 dark:text-purple-400">
                      View Feedback
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Check interview results
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* INTERVIEWS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Your Interviews</h2>
                <p className="text-muted-foreground">
                  View and join your scheduled interviews
                </p>
              </div>
            </div>

            {interviews === undefined ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : interviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {interviews.map((interview) => (
                  <MeetingCard key={interview._id} interview={interview} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No interviews scheduled
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  You don't have any interviews at the moment. Check back later
                  or contact your interviewer for updates.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950/20"
                >
                  Refresh
                </Button>
              </div>
            )}
          </div>

          <MeetingModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={modalType === "join" ? "Join Meeting" : "Start Meeting"}
            isJoinMeeting={modalType === "join"}
          />
        </div>
      )}
    </div>
  );
}

function SignedOutHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-6 py-16">
        {/* HERO SECTION */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent mb-6">
            Interview Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Streamline your technical interviews with our comprehensive
            platform. Conduct live coding sessions, video calls, and
            collaborative assessments all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <SignUpButton mode="modal">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 text-lg"
              >
                Dive in
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 text-lg border-2"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Video Interviews</h3>
            <p className="text-muted-foreground">
              High-quality video calls with screen sharing and recording
              capabilities for seamless remote interviews.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-muted-foreground">
              Easy-to-use scheduling system that syncs with calendars and sends
              automated reminders to all participants.
            </p>
          </div>

          <div className="text-center p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Collaborative Assessment
            </h3>
            <p className="text-muted-foreground">
              Real-time feedback system with rating capabilities and detailed
              interview summaries for better decisions.
            </p>
          </div>
        </div>

        {/* TESTIMONIAL SECTION */}
        <div className="text-center bg-card rounded-lg p-8 border">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
          <blockquote className="text-lg text-muted-foreground mb-4">
            "This platform has revolutionized our hiring process. The seamless
            integration of video calls, code collaboration, and feedback systems
            makes technical interviews so much more efficient."
          </blockquote>
          <cite className="font-semibold">
            - @Dummy User
          </cite>
        </div>

        {/* CTA SECTION */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold mb-4">
            Ready to transform your interviews?
          </h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of companies already using our platform
          </p>
          <SignUpButton mode="modal">
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-3 text-lg"
            >
              Schedule Your Interview
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
