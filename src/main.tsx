import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";

// Force light mode always.
if (typeof window !== "undefined") {
  document.documentElement.classList.remove("dark");
  localStorage.setItem("safevin-theme", "light");
}

createRoot(document.getElementById("root")!).render(<App />);
