import { useRef, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, Camera, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationBootstrap } from '@/hooks/useNotificationBootstrap';
import { useAppData } from '@/contexts/AppDataContext';
import AppWalkthrough from '@/components/onboarding/AppWalkthrough';
import DailyFeedbackPrompt from '@/components/feedback/DailyFeedbackPrompt';

const tabs = [
  { id: 'home', label: 'Today', icon: Home, path: '/' },
  { id: 'timeline', label: 'Timeline', icon: Clock, path: '/timeline' },
  { id: 'photos', label: 'Photos', icon: Camera, path: '/photos' },
  { id: 'learn', label: 'Learn', icon: BookOpen, path: '/learn' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, updateSettings, isLoading, isAuthenticated, checkins } = useAppData();
  const mainRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // Measure the nav bar's real rendered height (h-16 content + its own
  // safe-area-bottom padding, which varies by device) instead of guessing
  // it with a fixed padding value. Without this, content near the bottom
  // of any page can end up hidden behind the always-on-screen nav bar on
  // devices with a taller safe-area inset (e.g. the home indicator).
  const [navHeight, setNavHeight] = useState(96);
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    // Use offsetHeight (not contentRect, which excludes padding/border) so
    // the safe-area-bottom padding and border-t are both accounted for.
    const observer = new ResizeObserver(() => {
      setNavHeight(nav.offsetHeight);
    });
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  // Verify and reschedule notifications on app boot
  useNotificationBootstrap(settings, !isLoading);

  // Disable native scroll restoration (causes issues on iOS / Capacitor)
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const showWalkthrough = !isLoading &&
    isAuthenticated &&
    settings.hasCompletedOnboarding &&
    !settings.hasSeenWalkthrough;

  // Once-a-day beta feedback prompt — only for engaged users (at least one
  // check-in logged already) and never stacked on top of the walkthrough.
  const todayStr = new Date().toISOString().slice(0, 10);
  const showBetaFeedback = !isLoading &&
    isAuthenticated &&
    settings.hasCompletedOnboarding &&
    !showWalkthrough &&
    checkins.length > 0 &&
    settings.lastBetaFeedbackPromptDate !== todayStr;

  // Scroll to top on route change
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Main content area - scrollable */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain safe-area-top"
        style={{ paddingBottom: navHeight + 16 }}
      >
        <Outlet />
      </main>

      {/* Bottom tab bar - iOS 26 Liquid Glass */}
      <nav ref={navRef} className="fixed bottom-0 left-0 right-0 liquid-glass border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-12 rounded-2xl transition-all duration-200",
                  active
                    ? "liquid-glass-tab-active text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <tab.icon
                  className={cn(
                    "w-5 h-5 mb-0.5 transition-transform duration-200",
                    active && "scale-110"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={cn(
                  "text-[10px] font-medium",
                  active && "font-semibold"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Feature walkthrough overlay (shown once after first sign-in) */}
      {showWalkthrough && (
        <AppWalkthrough onComplete={() => updateSettings({ hasSeenWalkthrough: true })} />
      )}

      {/* Beta feedback prompt (shown at most once a day to active users) */}
      {showBetaFeedback && <DailyFeedbackPrompt />}
    </div>
  );
}
