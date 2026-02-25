import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useStorage';
import { notificationService } from '@/lib/notificationService';
import { analytics } from '@/lib/analyticsService';

export default function NotificationPermissionScreen() {
  const navigate = useNavigate();
  const { updateSettings } = useSettings();
  const [requesting, setRequesting] = useState(false);

  const handleEnableNotifications = async () => {
    setRequesting(true);
    
    try {
      // Request native notification permission
      const result = await notificationService.requestPermission();
      const granted = result.display === 'granted';
      
      updateSettings({ 
        notificationsEnabled: granted,
        notificationPermissionStatus: granted ? 'granted' : 'denied',
      });

      if (granted) {
        analytics.track('notifications_enabled');
        // Permission granted - proceed to reminder setup
        navigate('/reminder-setup');
      } else {
        // Permission denied - still proceed to reminder setup
        // User can configure schedule but won't get native notifications
        navigate('/reminder-setup');
      }
    } catch (error) {
      console.error('[Notifications] Permission request failed:', error);
      // Proceed anyway, notifications will work on web
      updateSettings({ 
        notificationsEnabled: true,
        notificationPermissionStatus: 'denied',
      });
      navigate('/reminder-setup');
    } finally {
      setRequesting(false);
    }
  };

  const handleSkip = () => {
    updateSettings({ 
      notificationsEnabled: false,
      notificationPermissionStatus: 'denied',
      hasCompletedOnboarding: true 
    });
    navigate('/checkin');
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
          disabled={requesting}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity"
        >
          {requesting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Requesting...
            </>
          ) : (
            'Enable Reminders'
          )}
        </Button>
        <Button
          onClick={handleSkip}
          disabled={requesting}
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
