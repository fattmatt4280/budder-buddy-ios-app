import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSettings, useTattoos } from "@/hooks/useStorage";

// Layouts
import AppLayout from "@/components/layout/AppLayout";

// Onboarding screens
import WelcomeScreen from "@/pages/onboarding/WelcomeScreen";
import NotificationPermissionScreen from "@/pages/onboarding/NotificationPermissionScreen";
import ReminderSetupScreen from "@/pages/onboarding/ReminderSetupScreen";

// Main app screens
import TodayScreen from "@/pages/TodayScreen";
import TimelineScreen from "@/pages/TimelineScreen";
import PhotosScreen from "@/pages/PhotosScreen";
import LearnScreen from "@/pages/LearnScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import ArticleScreen from "@/pages/ArticleScreen";
import AuthScreen from "@/pages/AuthScreen";
import PrivacyPolicyScreen from "@/pages/PrivacyPolicyScreen";
import TermsOfServiceScreen from "@/pages/TermsOfServiceScreen";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { settings, updateSettings } = useSettings();
  const { tattoos } = useTattoos();

  // Self-heal onboarding state so users don't get stuck on the welcome screen
  // if they already have enough state to use the app.
  useEffect(() => {
    if (settings.hasCompletedOnboarding) return;

    const shouldUnlock =
      settings.selectedTattooId !== null ||
      tattoos.length > 0;

    if (shouldUnlock) {
      updateSettings({ hasCompletedOnboarding: true });
    }
  }, [
    settings.hasCompletedOnboarding,
    settings.hasCompletedReminderSetup,
    settings.selectedTattooId,
    tattoos.length,
    updateSettings,
  ]);

  // If onboarding not complete, redirect to welcome
  if (!settings.hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/setup" element={<Navigate to="/" replace />} />
        <Route path="/notifications" element={<NotificationPermissionScreen />} />
        <Route path="/reminder-setup" element={<ReminderSetupScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<TodayScreen />} />
        <Route path="/timeline" element={<TimelineScreen />} />
        <Route path="/photos" element={<PhotosScreen />} />
        <Route path="/learn" element={<LearnScreen />} />
        <Route path="/learn/:articleId" element={<ArticleScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Route>
      <Route path="/setup" element={<Navigate to="/" replace />} />
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/privacy" element={<PrivacyPolicyScreen />} />
      <Route path="/terms" element={<TermsOfServiceScreen />} />
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
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
