import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot, Clock, Briefcase, FileText, Sparkles } from "lucide-react";
// import { QUESTION_PROMPT } from "@/constants";

interface FormData {
  jobPosition: string;
  jobDescription: string;
  duration: string;
  type: string;
}

export default function AIInterviewForm() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    jobPosition: "",
    jobDescription: "",
    duration: "",
    type: "",
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the HTTP Actions URL for API calls
      const convexHttpUrl = import.meta.env.VITE_CONVEX_HTTP_URL;
      const apiUrl = `${convexHttpUrl}/generate-questions`;

      console.log("=== API CALL DEBUG INFO ===");
      console.log("Convex HTTP URL from env:", convexHttpUrl);
      console.log("Full API URL:", apiUrl);
      console.log("Form data being sent:", formData);
      console.log("User ID:", user?.id);

      // Prepare data to send including userId for database storage
      const requestData = {
        ...formData,
        userId: user?.id, // Include user ID for database storage
      };

      // Make POST API call to generate questions
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response received:");
      console.log("- Status:", response.status);
      console.log("- Status Text:", response.statusText);
      console.log("- Headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Details:");
        console.error("- Status:", response.status);
        console.error("- Response text:", errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("API Response parsed:", result);

      // Navigate to questions list page with the generated questions
      navigate("/ai-interview/questions", {
        state: {
          questionsList: result.interviewQuestions,
          formData: formData,
        },
      });
    } catch (error) {
      console.error("Full error details:", error);
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      // Handle error - you might want to show a toast or error message
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.jobPosition &&
    formData.jobDescription &&
    formData.duration &&
    formData.type;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <Bot className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Interview Setup
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your personalized AI interview experience
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Position */}
            <div className="space-y-2">
              <Label
                htmlFor="jobPosition"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Briefcase className="h-4 w-4" />
                Job Position
              </Label>
              <Input
                id="jobPosition"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.jobPosition}
                onChange={(e) =>
                  handleInputChange("jobPosition", e.target.value)
                }
                className="h-12"
                required
              />
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label
                htmlFor="jobDescription"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <FileText className="h-4 w-4" />
                Job Description
              </Label>
              <Textarea
                id="jobDescription"
                placeholder="Paste the job description or key requirements here..."
                value={formData.jobDescription}
                onChange={(e) =>
                  handleInputChange("jobDescription", e.target.value)
                }
                className="min-h-[120px]"
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label
                htmlFor="duration"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Clock className="h-4 w-4" />
                Interview Duration
              </Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => handleInputChange("duration", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select interview duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 minutes">15 minutes</SelectItem>
                  <SelectItem value="30 minutes">30 minutes</SelectItem>
                  <SelectItem value="45 minutes">45 minutes</SelectItem>
                  <SelectItem value="1 hour">1 hour</SelectItem>
                  <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interview Type */}
            <div className="space-y-2">
              <Label
                htmlFor="type"
                className="flex items-center gap-2 text-sm font-medium"
              >
                <Sparkles className="h-4 w-4" />
                Interview Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange("type", value)}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical Interview</SelectItem>
                  <SelectItem value="Behavioral">
                    Behavioral Interview
                  </SelectItem>
                  <SelectItem value="Mixed">
                    Mixed (Technical + Behavioral)
                  </SelectItem>
                  <SelectItem value="System Design">System Design</SelectItem>
                  <SelectItem value="Coding">Coding Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Questions...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate AI Questions
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-800/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                How it works
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• AI analyzes your job description and requirements</li>
                <li>
                  • Questions are tailored to the specific role and duration
                </li>
                <li>
                  • Get a mix of technical, behavioral, and role-specific
                  questions
                </li>
                <li>• Practice with realistic interview scenarios</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
