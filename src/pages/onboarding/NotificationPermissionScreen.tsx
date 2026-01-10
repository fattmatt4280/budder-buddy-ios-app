import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useStorage';
import { cn } from '@/lib/utils';

export default function NotificationPermissionScreen() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();

  const handleEnableNotifications = async () => {
    // In a native app, this would request permission
    // For now, we just update settings and proceed to reminder setup
    updateSettings({ 
      notificationsEnabled: true,
    });
    navigate('/reminder-setup');
  };

  const handleSkip = () => {
    updateSettings({ 
      notificationsEnabled: false,
      hasCompletedOnboarding: true 
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Icon */}
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-fade-in">
          <Bell className="w-12 h-12 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-4 animate-slide-up">
          Stay on Track
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Get friendly reminders to wash, moisturize, and check on your healing tattoo.
        </p>

        {/* Benefits */}
        <div className="w-full space-y-3 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {[
            { icon: Clock, text: 'Morning & evening care reminders' },
            { icon: Bell, text: 'Phase-specific healing tips' },
            { icon: BellOff, text: 'Easy to customize or turn off anytime' },
          ].map((item, i) => (
            <div 
              key={i}
              className="flex items-center gap-3 bg-card/50 rounded-xl p-4 border border-border"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-foreground text-left">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Schedule preview */}
        <div className="w-full bg-card rounded-xl p-4 border border-border animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-muted-foreground mb-3">Default schedule:</p>
          <div className="flex justify-center gap-4">
            <div className="text-center">
              <span className="text-lg font-semibold text-foreground">9:00 AM</span>
              <p className="text-xs text-muted-foreground">Morning</p>
            </div>
            <div className="w-px bg-border" />
            <div className="text-center">
              <span className="text-lg font-semibold text-foreground">8:00 PM</span>
              <p className="text-xs text-muted-foreground">Evening</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 space-y-3">
        <Button
          onClick={handleEnableNotifications}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity"
        >
          Enable Reminders
        </Button>
        <Button
          onClick={handleSkip}
          variant="ghost"
          size="lg"
          className="w-full h-12 text-muted-foreground hover:text-foreground"
        >
          Maybe Later
        </Button>
      </div>
    </div>
  );
}
