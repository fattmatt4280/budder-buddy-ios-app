import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSettings } from "@/hooks/useStorage";

// Layouts
import AppLayout from "@/components/layout/AppLayout";

// Onboarding screens
import WelcomeScreen from "@/pages/onboarding/WelcomeScreen";
import TattooSetupWizard from "@/pages/onboarding/TattooSetupWizard";
import NotificationPermissionScreen from "@/pages/onboarding/NotificationPermissionScreen";
import ReminderSetupScreen from "@/pages/onboarding/ReminderSetupScreen";

// Main app screens
import TodayScreen from "@/pages/TodayScreen";
import TimelineScreen from "@/pages/TimelineScreen";
import PhotosScreen from "@/pages/PhotosScreen";
import LearnScreen from "@/pages/LearnScreen";
import SettingsScreen from "@/pages/SettingsScreen";
import ArticleScreen from "@/pages/ArticleScreen";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { settings } = useSettings();

  // If onboarding not complete, redirect to welcome
  if (!settings.hasCompletedOnboarding) {
    return (
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/setup" element={<TattooSetupWizard />} />
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
