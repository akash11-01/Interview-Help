import { CodeIcon } from "lucide-react";
import { ModeToggle } from "./ModeToggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import DasboardBtn from "./DashboardBtn";
import JoinInterviewNavButton from "./JoinInterviewNavButton";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import AuthenticatedWrapper from "./AuthenticatedWrapper";
import StreamClientProvider from "./providers/StreamClientProvider";

function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* LEFT SIDE -LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-2xl mr-6 font-mono hover:opacity-80 transition-opacity"
        >
          <CodeIcon className="size-8 text-emerald-500" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            InterviewHelp
          </span>
        </Link>

        {/* RIGHT SIDE - ACTIONS */}
        <div className="flex items-center space-x-3 ml-auto">
          <ModeToggle />

          {/* SIGNED IN USERS */}
          <SignedIn>
            <div className="flex items-center space-x-3">
              <DasboardBtn />
              <AuthenticatedWrapper>
                <StreamClientProvider>
                  <JoinInterviewNavButton />
                </StreamClientProvider>
              </AuthenticatedWrapper>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </SignedIn>

          {/* SIGNED OUT USERS */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
