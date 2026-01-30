import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Clock, Camera, BookOpen, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Main content area - scrollable */}
      <main className="flex-1 overflow-y-auto pb-20 safe-area-top">
        <Outlet />
      </main>

      {/* Bottom tab bar - iOS 26 Liquid Glass */}
      <nav className="fixed bottom-0 left-0 right-0 liquid-glass border-t border-white/10 safe-area-bottom">
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
    </div>
  );
}
