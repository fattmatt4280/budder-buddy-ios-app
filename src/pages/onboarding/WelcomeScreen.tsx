import { useNavigate } from 'react-router-dom';
import { Droplet, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useStorage';

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { updateSettings } = useSettings();

  const handleStart = () => {
    updateSettings({ hasAcknowledgedDisclaimer: true });
    navigate('/setup');
  };

  return (
    <div className="min-h-screen flex flex-col gradient-background safe-area-top safe-area-bottom">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Mascot/Logo */}
        <div className="relative mb-8 animate-fade-in">
          <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center shadow-2xl">
            <Droplet className="w-16 h-16 text-primary-foreground" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-8 h-8 text-accent animate-pulse-soft" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-3 animate-slide-up">
          Budder Buddy
        </h1>
        <p className="text-lg text-muted-foreground mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Your Tattoo Aftercare Companion
        </p>
        <p className="text-sm text-muted-foreground/80 max-w-xs animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Daily guidance, reminders, and tips to help your new ink heal beautifully.
        </p>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-8 space-y-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        {/* Disclaimer */}
        <div className="bg-card/50 rounded-xl p-4 border border-border">
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
          className="w-full h-14 text-lg font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
