import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useStorage';
import { environmentService } from '@/lib/environmentService';

const NEXT_ROUTE = '/notifications';

/**
 * Onboarding permission prompt #2 (after Face ID): offer Sun Guard — UV
 * alerts based on location — instead of leaving it buried in Settings.
 * environmentService.getCurrentPosition() itself triggers the real native
 * location prompt; there's no separate custom permission dialog in front of
 * it, matching the pattern already used for Sun Guard from Settings.
 */
export default function SunGuardPromptScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateSettings } = useSettings();
  const [enabling, setEnabling] = useState(false);

  const handleEnable = async () => {
    setEnabling(true);
    try {
      const position = await environmentService.getCurrentPosition();
      if (position) {
        updateSettings({ sunGuardEnabled: true });
        toast({ title: 'Sun Guard enabled', description: "We'll warn you when UV is high." });
      } else {
        toast({
          title: 'Location not available',
          description: 'You can turn Sun Guard on later in Settings.',
          variant: 'destructive',
        });
      }
    } finally {
      setEnabling(false);
      navigate(NEXT_ROUTE, { replace: true });
    }
  };

  const handleSkip = () => {
    navigate(NEXT_ROUTE, { replace: true });
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-8 animate-fade-in">
          <Sun className="w-12 h-12 text-amber-500" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4 animate-slide-up">
          Turn On Sun Guard
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Fresh ink and sun don't mix. We'll check the UV index for your location and warn you
          before it's a problem.
        </p>

        <div className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-3 text-left animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-sm text-foreground">
            Uses your location just to check local UV — nothing is shared or tracked.
          </p>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-3">
        <Button
          onClick={handleEnable}
          disabled={enabling}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity"
        >
          {enabling ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Requesting...
            </>
          ) : (
            'Enable Sun Guard'
          )}
        </Button>
        <Button
          onClick={handleSkip}
          disabled={enabling}
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
