import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import Navbar from "./components/Navbar";
import { ThemeProvider } from "./components/providers/ThemeProvider";
import StreamClientProvider from "./components/providers/StreamClientProvider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import MeetingPage from "./pages/MeetingPage";
import RecordingsPage from "./pages/RecordingsPage";
import SchedulePage from "./pages/SchedulePage";
import FeedbackPage from "./pages/FeedbackPage";
import AuthenticatedWrapper from "./components/AuthenticatedWrapper";

export default function App() {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <div className="">
            {/* Always show navbar */}
            <Navbar />

            <Routes>
              {/* Home route with its own auth handling */}
              <Route path="/" element={<Home />} />

              {/* Protected routes */}
              <Route
                path="/*"
                element={
                  <SignedIn>
                    <AuthenticatedWrapper>
                      <StreamClientProvider>
                        <main>
                          <Routes>
                            <Route
                              path="/dashboard"
                              element={<DashboardPage />}
                            />
                            <Route
                              path="/schedule"
                              element={<SchedulePage />}
                            />
                            <Route
                              path="/meeting/:id"
                              element={<MeetingPage />}
                            />
                            <Route
                              path="/recordings"
                              element={<RecordingsPage />}
                            />
                            <Route
                              path="/feedback/:interviewId"
                              element={<FeedbackPage />}
                            />
                          </Routes>
                        </main>
                      </StreamClientProvider>
                    </AuthenticatedWrapper>
                  </SignedIn>
                }
              />
            </Routes>

            {/* Global redirect for non-home routes when signed out */}
            <SignedOut>
              <Routes>
                <Route path="/dashboard" element={<RedirectToSignIn />} />
                <Route path="/schedule" element={<RedirectToSignIn />} />
                <Route path="/meeting/:id" element={<RedirectToSignIn />} />
                <Route path="/recordings" element={<RedirectToSignIn />} />
                <Route
                  path="/feedback/:interviewId"
                  element={<RedirectToSignIn />}
                />
              </Routes>
            </SignedOut>
          </div>
        </Router>
      </ThemeProvider>
      <Toaster />
    </>
  );
}
