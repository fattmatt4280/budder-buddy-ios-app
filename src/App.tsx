import { useEffect, useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2, ScanFace, Fingerprint } from "lucide-react";
import { AppDataProvider, useAppData } from "@/contexts/AppDataContext";
import { biometricService, type BiometryType } from "@/lib/biometricService";
import IntroVideoScreen from "@/components/IntroVideoScreen";
import { useAttributionCapture } from "@/hooks/useAttributionCapture";

// Layouts
import AppLayout from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/layout/ProtectedRoute";

// Onboarding screens
import WelcomeScreen from "@/pages/onboarding/WelcomeScreen";
import BetaLandingScreen from "@/pages/BetaLandingScreen";
import NotificationPermissionScreen from "@/pages/onboarding/NotificationPermissionScreen";
import ReminderSetupScreen from "@/pages/onboarding/ReminderSetupScreen";

// Main app screens
import TodayScreen from "@/pages/TodayScreen";
import TimelineScreen from "@/pages/TimelineScreen";
import PhotosScreen from "@/pages/PhotosScreen";
import GhostCameraScreen from "@/pages/GhostCameraScreen";
import HealingGuideScreen from "@/pages/HealingGuideScreen";
import InkVaultScreen from "@/pages/InkVaultScreen";
import LearnScreen from "@/pages/LearnScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import ArticleScreen from "@/pages/ArticleScreen";
import AuthScreen from "@/pages/AuthScreen";
import DailyCheckinScreen from "@/pages/DailyCheckinScreen";
import PaywallScreen from "@/pages/PaywallScreen";
import PrivacyPolicyScreen from "@/pages/PrivacyPolicyScreen";
import TermsOfServiceScreen from "@/pages/TermsOfServiceScreen";
import SupportScreen from "@/pages/SupportScreen";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { settings, updateSettings, tattoos, isAuthenticated, isLoading, userId } = useAppData();

  // Flush any pre-auth acquisition data (UTM/referrer) onto this user now
  // that we have a user_id — see src/hooks/useAttributionCapture.ts.
  useAttributionCapture(userId);

  // Biometric lock state
  const [biometricLocked, setBiometricLocked] = useState<boolean | null>(null); // null = checking
  const [biometryType, setBiometryType] = useState<BiometryType>('none');
  const [biometricChecking, setBiometricChecking] = useState(false);

  // Mascot intro plays once per app launch, on top of whatever's loading behind it.
  const [introDone, setIntroDone] = useState(false);

  // On mount, check if biometric lock should be shown
  useEffect(() => {
    (async () => {
      const [enabled, available, type] = await Promise.all([
        biometricService.isEnabled(),
        biometricService.isAvailable(),
        biometricService.getBiometryType(),
      ]);
      setBiometryType(type);
      // Only lock if biometric is both enabled and available, AND user is authenticated
      if (enabled && available) {
        setBiometricLocked(true);
      } else {
        setBiometricLocked(false);
      }
    })();
  }, []);

  const handleBiometricUnlock = useCallback(async () => {
    setBiometricChecking(true);
    try {
      const label = biometryType === 'faceId' ? 'Face ID' : 'Touch ID';
      const result = await biometricService.authenticate(`Use ${label} to unlock Budder Buddy`);
      if (result.success) {
        setBiometricLocked(false);
      }
    } catch {
      // User cancelled — stay locked
    } finally {
      setBiometricChecking(false);
    }
  }, [biometryType]);

  // Auto-trigger Face ID on first load when locked
  useEffect(() => {
    if (biometricLocked === true && isAuthenticated && !isLoading) {
      handleBiometricUnlock();
    }
  }, [biometricLocked, isAuthenticated, isLoading, handleBiometricUnlock]);

  // Self-heal onboarding state so users don't get stuck on the welcome screen
  // if they already have enough state to use the app.
  // Skip while cloud data is still loading - firing this mid-sync would
  // upsert stale/default settings over the real ones still coming in.
  useEffect(() => {
    if (isLoading || settings.hasCompletedOnboarding) return;

    const shouldUnlock =
      isAuthenticated ||
      settings.selectedTattooId !== null ||
      tattoos.length > 0;

    if (shouldUnlock) {
      updateSettings({ hasCompletedOnboarding: true });
    }
  }, [
    settings.hasCompletedOnboarding,
    settings.selectedTattooId,
    tattoos.length,
    isAuthenticated,
    isLoading,
    updateSettings,
  ]);

  // Mascot intro renders on top first; auth/data loading happens behind it
  // regardless, so this rarely adds real wait time.
  if (!introDone) {
    return <IntroVideoScreen onFinish={() => setIntroDone(true)} />;
  }

  // Show loading spinner while auth/data is resolving to prevent
  // flash to welcome screen on app restart for already-signed-in users
  if (isLoading || biometricLocked === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Biometric lock screen — shown when user is authenticated but hasn't passed Face ID yet
  if (biometricLocked && isAuthenticated) {
    const label = biometryType === 'faceId' ? 'Face ID' : 'Touch ID';
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-8 gap-6 safe-area-top safe-area-bottom">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          {biometryType === 'faceId' ? (
            <ScanFace className="w-10 h-10 text-primary" />
          ) : (
            <Fingerprint className="w-10 h-10 text-primary" />
          )}
        </div>
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">Budder Buddy is Locked</h1>
          <p className="text-muted-foreground text-sm">
            Use {label} to unlock your account
          </p>
        </div>
        <button
          onClick={handleBiometricUnlock}
          disabled={biometricChecking}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base disabled:opacity-50 transition-opacity"
        >
          {biometricChecking ? 'Verifying...' : `Unlock with ${label}`}
        </button>
      </div>
    );
  }

  // If onboarding not complete, redirect to welcome
  if (!settings.hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/beta" element={<BetaLandingScreen />} />
        <Route path="/setup" element={<Navigate to="/" replace />} />
        <Route path="/notifications" element={<NotificationPermissionScreen />} />
        <Route path="/reminder-setup" element={<ReminderSetupScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/checkin" element={<DailyCheckinScreen />} />
        {/* Allow Learn to be accessible during onboarding transition */}
        <Route element={<AppLayout />}>
          <Route path="/learn" element={<LearnScreen />} />
          <Route path="/learn/:articleId" element={<ArticleScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Welcome screen for unauthenticated users */}
      <Route path="/welcome" element={<WelcomeScreen />} />
      <Route path="/beta" element={<BetaLandingScreen />} />
      
      <Route element={<AppLayout />}>
        {/* Protected routes - require authentication */}
        <Route path="/" element={<ProtectedRoute><TodayScreen /></ProtectedRoute>} />
        <Route path="/timeline" element={<ProtectedRoute><TimelineScreen /></ProtectedRoute>} />
        <Route path="/photos" element={<ProtectedRoute><PhotosScreen /></ProtectedRoute>} />
        
        {/* Public routes - no auth required */}
        <Route path="/learn" element={<LearnScreen />} />
        <Route path="/learn/:articleId" element={<ArticleScreen />} />
        <Route path="/healing-guide" element={<HealingGuideScreen />} />
        <Route path="/ink-vault" element={<ProtectedRoute><InkVaultScreen /></ProtectedRoute>} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      
      {/* Full-screen camera (outside AppLayout for immersive experience) */}
      <Route path="/ghost-camera" element={<ProtectedRoute><GhostCameraScreen /></ProtectedRoute>} />
      <Route path="/setup" element={<Navigate to="/learn" replace />} />
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/upgrade" element={<PaywallScreen />} />
      <Route path="/checkin" element={<ProtectedRoute><DailyCheckinScreen /></ProtectedRoute>} />
      <Route path="/privacy" element={<PrivacyPolicyScreen />} />
      <Route path="/terms" element={<TermsOfServiceScreen />} />
      <Route path="/support" element={<SupportScreen />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppDataProvider>
          <AppRoutes />
        </AppDataProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
