import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeSecureAuth } from "./lib/supabaseClientInit";
import { notificationService } from "./lib/notificationService";
import { purchaseService } from "./lib/purchaseService";
import { logger } from "./lib/logger";

// Initialize secure auth storage before rendering
// This migrates tokens from localStorage to Keychain/Keystore on native platforms
initializeSecureAuth().then(async () => {
  // Initialize RevenueCat (no-op on web)
  await purchaseService.initialize();

  // Initialize notification service (registers action types on iOS)
  await notificationService.initialize();

  // Register notification listeners for handling taps
  notificationService.registerListeners((type) => {
    logger.log('[App] Notification tapped, type:', type);
    // Navigate to check-in screen when notification is tapped
    window.location.href = '/checkin';
  });
  
  createRoot(document.getElementById("root")!).render(<App />);
}).catch((error) => {
  logger.error('[App] Failed to initialize:', error);
  // Render app anyway to prevent blank screen
  createRoot(document.getElementById("root")!).render(<App />);
});
