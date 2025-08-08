import { useUser } from "@clerk/clerk-react";
import { Bot, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import AIInterviewCard from "@/components/AIInterviewCard";
import { useUserRole } from "@/hooks/useUserRole";
import LoaderUI from "@/components/LoaderUI";

export default function AIInterviewPage() {
  const { user } = useUser();
  const { isInterviewer, isLoading } = useUserRole();
  const navigate = useNavigate();

  if (isLoading) return <LoaderUI />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  AI Interview Platform
                </h1>
                <p className="text-muted-foreground">
                  Welcome, {user?.firstName}! Ready to experience AI-powered interviews?
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full px-4 py-2 border border-violet-200/50 dark:border-violet-800/50">
            <Sparkles className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-medium text-violet-600 dark:text-violet-400">
              AI Powered
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - AI Interview Card */}
          <div className="space-y-6">
            <AIInterviewCard userType={isInterviewer ? "interviewer" : "candidate"} />
            
            {/* Features Overview */}
            <Card className="p-6 border-dashed border-2 border-violet-200/50 dark:border-violet-800/50 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                What makes our AI special?
              </h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 mt-2" />
                  <div>
                    <p className="font-medium text-sm">Advanced Natural Language Processing</p>
                    <p className="text-xs text-muted-foreground">Understands context and provides relevant responses</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 mt-2" />
                  <div>
                    <p className="font-medium text-sm">Real-time Voice Interaction</p>
                    <p className="text-xs text-muted-foreground">Seamless speech-to-text and text-to-speech technology</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 mt-2" />
                  <div>
                    <p className="font-medium text-sm">Intelligent Assessment</p>
                    <p className="text-xs text-muted-foreground">Multi-criteria evaluation with detailed feedback</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side - Instructions & Tips */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">
                {isInterviewer ? "How to Create AI Interviews" : "How to Use AI Practice"}
              </h3>
              <div className="space-y-4">
                {isInterviewer ? (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">1</div>
                      <div>
                        <p className="font-medium">Configure Interview Settings</p>
                        <p className="text-sm text-muted-foreground">Set difficulty level, focus areas, and assessment criteria</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">2</div>
                      <div>
                        <p className="font-medium">AI Generates Questions</p>
                        <p className="text-sm text-muted-foreground">Our AI creates customized questions based on your requirements</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-semibold text-emerald-600 dark:text-emerald-400">3</div>
                      <div>
                        <p className="font-medium">Review & Analyze</p>
                        <p className="text-sm text-muted-foreground">Get detailed reports and candidate assessments</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">1</div>
                      <div>
                        <p className="font-medium">Choose Practice Type</p>
                        <p className="text-sm text-muted-foreground">Select technical, behavioral, or mixed interview practice</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">2</div>
                      <div>
                        <p className="font-medium">Voice Interaction</p>
                        <p className="text-sm text-muted-foreground">Speak your answers naturally - AI listens and responds</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">3</div>
                      <div>
                        <p className="font-medium">Get Instant Feedback</p>
                        <p className="text-sm text-muted-foreground">Receive detailed analysis and improvement suggestions</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200/50 dark:border-yellow-800/50">
              <h3 className="font-semibold mb-3 text-yellow-800 dark:text-yellow-200">Pro Tips</h3>
              <div className="space-y-2 text-sm">
                <p className="text-yellow-700 dark:text-yellow-300">• Ensure you have a quiet environment with good microphone access</p>
                <p className="text-yellow-700 dark:text-yellow-300">• Speak clearly and at a moderate pace for best recognition</p>
                <p className="text-yellow-700 dark:text-yellow-300">• Take your time to think before answering - there's no rush</p>
                <p className="text-yellow-700 dark:text-yellow-300">• Use the feedback to improve your interview skills</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
