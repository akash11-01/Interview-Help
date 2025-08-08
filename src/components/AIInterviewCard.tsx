import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bot, Sparkles, Mic, Brain, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AIInterviewCardProps {
  userType: "interviewer" | "candidate";
}

export default function AIInterviewCard({ userType }: AIInterviewCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleStartAIInterview = () => {
    // Navigate to AI Interview form page for candidates and setup page for interviewers
    if (userType === "candidate") {
      navigate("/ai-interview/setup");
    } else {
      navigate("/ai-interview");
    }
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
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${config.borderColor} ${config.bgGradient} ${isHovered ? "scale-[1.02] shadow-2xl" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-5">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}
        />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-bl from-white/20 to-transparent transform translate-x-20 -translate-y-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-gradient-to-tr from-white/20 to-transparent transform -translate-x-12 translate-y-12" />
      </div>

      <div className="relative p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-xl bg-gradient-to-r ${config.gradient} shadow-lg`}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">{config.title}</h3>
              <p className="text-sm text-muted-foreground">{config.subtitle}</p>
            </div>
          </div>
          <div
            className={`p-2 rounded-lg bg-gradient-to-r ${config.gradient} opacity-80`}
          >
            <Bot className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {config.description}
        </p>

        {/* Features List */}
        <div className="space-y-3 mb-8">
          {config.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient}`}
              />
              <span className="text-sm font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleStartAIInterview}
          className={`w-full bg-gradient-to-r ${config.gradient} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group`}
        >
          <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
          {config.buttonText}
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
        </Button>

        {/* AI Badge */}
        <div className="flex justify-center mt-4">
          <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">
              Powered by Advanced AI
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
