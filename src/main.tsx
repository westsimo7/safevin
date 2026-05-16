import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Light is default. Apply persisted dark theme before first render to avoid flash.
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("safevin-theme");
  if (saved === "dark") {
    document.documentElement.classList.add("dark");
  }
}

createRoot(document.getElementById("root")!).render(<App />);
