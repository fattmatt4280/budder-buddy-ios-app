import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSecureAuth } from "./lib/supabaseClientInit";

// Initialize secure auth storage before rendering
// This migrates tokens from localStorage to Keychain/Keystore on native platforms
initializeSecureAuth().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
}).catch((error) => {
  console.error('[App] Failed to initialize secure auth:', error);
  // Render app anyway to prevent blank screen
  createRoot(document.getElementById("root")!).render(<App />);
});
