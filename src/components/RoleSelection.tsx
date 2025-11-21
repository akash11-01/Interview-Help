import { useState } from "react";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Users, UserCheck, Loader2, AlertCircle } from "lucide-react";

interface RoleSelectionProps {
  onRoleSelected: () => void;
}

function RoleSelection({ onRoleSelected }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<
    "candidate" | "interviewer" | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Use the improved user role update that can create users with proper data
  const updateUserWithClerkData = useMutation(
    api.users.updateUserRoleWithClerkData
  );

  const handleRoleSelection = async (role: "candidate" | "interviewer") => {
    if (!user) {
      setError("User not loaded. Please try again.");
      return;
    }

    setSelectedRole(role);
    setIsLoading(true);
    setError(null);

    try {
      console.log("Updating user role to:", role);
      console.log("Clerk user data:", {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl,
      });

      const result = await updateUserWithClerkData({
        role,
        clerkId: user.id,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        fullName: user.fullName || undefined,
        email:
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          undefined,
        imageUrl: user.imageUrl || undefined,
      });

      console.log("Role update successful:", result);
      onRoleSelected();
    } catch (error) {
      console.error("Failed to update user role:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update role. Please try again."
      );
      // Reset selection on error
      setSelectedRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your role to get started with the interview platform
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Error</p>
            </div>
            <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Candidate Card */}
          <Card
            className={`p-8 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedRole === "candidate"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                : "border-muted hover:border-emerald-300"
            } ${isLoading && selectedRole === "candidate" ? "opacity-75" : ""}`}
            onClick={() => !isLoading && handleRoleSelection("candidate")}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Candidate</h3>
              <p className="text-muted-foreground mb-4">
                Join interviews, participate in coding sessions, and receive
                feedback from interviewers.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-6">
                <li>✓ Join scheduled interviews</li>
                <li>✓ Access coding environments</li>
                <li>✓ View interview feedback</li>
                <li>✓ Track interview progress</li>
              </ul>
              {isLoading && selectedRole === "candidate" ? (
                <Button disabled className="w-full">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </Button>
              ) : (
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  Select Candidate
                </Button>
              )}
            </div>
          </Card>

          {/* Interviewer Card */}
          <Card
            className={`p-8 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedRole === "interviewer"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                : "border-muted hover:border-blue-300"
            } ${isLoading && selectedRole === "interviewer" ? "opacity-75" : ""}`}
            onClick={() => !isLoading && handleRoleSelection("interviewer")}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Interviewer</h3>
              <p className="text-muted-foreground mb-4">
                Conduct interviews, schedule sessions, and provide detailed
                feedback to candidates.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 mb-6">
                <li>✓ Create and manage interviews</li>
                <li>✓ Schedule interview sessions</li>
                <li>✓ Provide candidate feedback</li>
                <li>✓ Access interview recordings</li>
              </ul>
              {isLoading && selectedRole === "interviewer" ? (
                <Button disabled className="w-full">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </Button>
              ) : (
                <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Select Interviewer
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Don't worry, you can change your role later in your profile
            settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
