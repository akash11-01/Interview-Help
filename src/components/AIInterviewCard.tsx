import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Mic, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Spline from "@splinetool/react-spline";
interface AIInterviewCardProps {
  userType: "interviewer" | "candidate";
}

export default function AIInterviewCard({ userType }: AIInterviewCardProps) {
  const navigate = useNavigate();

  const handleStartAIInterview = () => {
    // Navigate to AI Interview form page for candidates and setup page for interviewers
    navigate("/ai-interview/setup");
    // if (userType === "candidate") {
    // } else {
    //   navigate("/ai-interview");
    // }
  };

  const cardConfig = {
    interviewer: {
      title: "AI-Powered Interview Creation",
      subtitle: "Create intelligent interviews with AI assistance",
      description:
        "Generate customized interview questions, set difficulty levels, and get AI insights on candidate responses.",
      features: [
        "Auto-generate technical questions",
        "Real-time candidate analysis",
        "Intelligent scoring system",
        "Automated interview reports",
      ],
      gradient: "from-emerald-500 to-teal-500",
      bgGradient:
        "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
      borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
      buttonText: "Create AI Interview",
      icon: Brain,
    },
    candidate: {
      title: "AI Interview Practice",
      subtitle: "Practice with AI-powered mock interviews",
      description:
        "Prepare for real interviews with AI-generated questions, voice interaction, and instant feedback.",
      features: [
        "Voice-enabled practice sessions",
        "Instant AI feedback",
        "Multiple difficulty levels",
        "Performance analytics",
      ],
      gradient: "from-blue-500 to-indigo-500",
      bgGradient:
        "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
      borderColor: "border-blue-200/50 dark:border-blue-800/50",
      buttonText: "Start AI Practice",
      icon: Mic,
    },
  };

  const config = cardConfig[userType];
  const Icon = config.icon;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${config.borderColor} ${config.bgGradient} group`}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-5">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}
        />
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-bl from-white/20 to-transparent transform translate-x-10 -translate-y-10" />
      </div>

      <div className="relative p-6">
        {/* AI Model Container */}
        <div className="absolute top-4 right-4 w-32 h-32 overflow-hidden rounded-lg">
          <Spline
            scene="https://prod.spline.design/wDg4sVxPhE0Qbpbt/scene.splinecode"
            className="w-full h-full scale-150"
            style={{
              background: "transparent",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
            }}
          />
        </div>

        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4 pr-36">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-lg bg-gradient-to-r ${config.gradient} shadow-md`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{config.title}</h3>
              <p className="text-xs text-muted-foreground">{config.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
            </div>
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">
              AI
            </span>
          </div>
        </div>

        {/* Compact Description */}
        <p
          className="text-sm text-muted-foreground mb-4 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {config.description}
        </p>

        {/* Compact Features - Show only first 3 */}
        <div className="grid grid-cols-1 gap-2 mb-4">
          {config.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${config.gradient}`}
              />
              <span className="text-xs font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* Enhanced Action Button */}
        <Button
          onClick={handleStartAIInterview}
          className={`
            w-full relative overflow-hidden group
            bg-gradient-to-r ${config.gradient} 
            hover:shadow-2xl hover:shadow-purple-500/25
            hover:scale-[1.02] active:scale-[0.98]
            text-white font-semibold py-3.5 px-6 
            rounded-xl transition-all duration-300 
            flex items-center justify-center gap-3 
            border-0 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
          `}
        >
          {/* Button Content */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-5 w-5 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              <div className="absolute inset-0 h-5 w-5 group-hover:animate-pulse">
                <Sparkles className="h-5 w-5 opacity-50" />
              </div>
            </div>
            <span className="font-semibold tracking-wide">
              {config.buttonText}
            </span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" />
          </div>

          {/* Animated shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/10 to-white/5" />
        </Button>
      </div>
    </Card>
  );
}
