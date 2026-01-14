import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSecureAuth } from "./lib/supabaseClientInit";
import { notificationService } from "./lib/notificationService";

// Initialize secure auth storage before rendering
// This migrates tokens from localStorage to Keychain/Keystore on native platforms
initializeSecureAuth().then(() => {
  // Register notification listeners for handling taps
  notificationService.registerListeners((type) => {
    console.log('[App] Notification tapped, type:', type);
    // Navigate to home screen when notification is tapped
    // The app will naturally show the Today screen
    window.location.href = '/';
  });
  
  createRoot(document.getElementById("root")!).render(<App />);
}).catch((error) => {
  console.error('[App] Failed to initialize secure auth:', error);
  // Render app anyway to prevent blank screen
  createRoot(document.getElementById("root")!).render(<App />);
});
