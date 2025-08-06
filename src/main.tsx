import { StrictMode } from "react";
import { Buffer } from "buffer";
import process from "process";

if (typeof window !== "undefined") {
  // @ts-ignore
  window.Buffer = Buffer;
  // @ts-ignore
  window.process = process;
}
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ConvexClerkProvider from "./components/providers/ConvexClerkProvider.tsx";
// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexClerkProvider>
      <App />
    </ConvexClerkProvider>
  </StrictMode>
);
