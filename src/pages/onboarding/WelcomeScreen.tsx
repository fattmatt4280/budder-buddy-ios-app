import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSettings, useTattoos } from '@/hooks/useStorage';
import mascotImage from '@/assets/mascot.png';

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { tattoos } = useTattoos();

  // If the user already has a tattoo/reminders configured, unlock the app and route them in.
  useEffect(() => {
    const shouldUnlock =
      settings.hasCompletedReminderSetup ||
      settings.selectedTattooId !== null ||
      tattoos.length > 0;

    if (!settings.hasCompletedOnboarding && shouldUnlock) {
      updateSettings({ hasCompletedOnboarding: true });
      navigate('/', { replace: true });
    }
  }, [
    settings.hasCompletedOnboarding,
    settings.hasCompletedReminderSetup,
    settings.selectedTattooId,
    tattoos.length,
    updateSettings,
    navigate,
  ]);

  const handleStart = () => {
    updateSettings({ hasAcknowledgedDisclaimer: true });
    navigate('/setup');
  };

  return (
    <div className="h-screen flex flex-col justify-center gradient-background safe-area-top safe-area-bottom px-6 overflow-hidden">
      {/* Hero section */}
      <div className="flex flex-col items-center text-center mb-6">
        {/* Mascot/Logo */}
        <div className="relative mb-4 animate-fade-in">
          <img 
            src={mascotImage} 
            alt="Budder Buddy mascot" 
            className="w-28 h-28 rounded-2xl shadow-2xl"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-1 animate-slide-up">
          Budder Buddy
        </h1>
        <p className="text-base text-muted-foreground mb-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Your Tattoo Aftercare Companion
        </p>
        <p className="text-sm text-muted-foreground/80 max-w-xs animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Daily guidance, reminders, and tips to help your new ink heal beautifully.
        </p>
      </div>

      {/* Bottom section */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        {/* Disclaimer */}
        <div className="bg-card/50 rounded-xl p-3 border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Educational Purposes Only:</span>{' '}
            Budder Buddy provides general aftercare guidance and does not offer medical advice. 
            If you have concerns about your healing tattoo, please contact your tattoo artist 
            or a medical professional.
          </p>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleStart}
          size="lg"
          className="w-full h-12 text-lg font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}