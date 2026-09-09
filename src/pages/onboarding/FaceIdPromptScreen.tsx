import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, Fingerprint, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { biometricService, type BiometryType } from '@/lib/biometricService';

const NEXT_ROUTE = '/onboarding/sun-guard';

/**
 * Onboarding permission prompt #1 (after account creation): offer to enable
 * Face ID / Touch ID login right away instead of leaving it to be discovered
 * in Settings later. Unlike the old AuthScreen behavior, this requires an
 * explicit confirm (biometricService.authenticate) before turning it on —
 * same pattern SettingsScreen's own toggle already uses.
 */
export default function FaceIdPromptScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checking, setChecking] = useState(true);
  const [available, setAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<BiometryType>('none');
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [isAvailable, type] = await Promise.all([
        biometricService.isAvailable(),
        biometricService.getBiometryType(),
      ]);
      if (!mounted) return;
      if (!isAvailable) {
        // No biometrics on this device — nothing to prompt for.
        navigate(NEXT_ROUTE, { replace: true });
        return;
      }
      setAvailable(isAvailable);
      setBiometryType(type);
      setChecking(false);
    })();
    return () => { mounted = false; };
  }, [navigate]);

  const label = biometryType === 'faceId' ? 'Face ID' : 'Touch ID';

  const handleEnable = async () => {
    setEnabling(true);
    try {
      const result = await biometricService.authenticate(`Confirm ${label} to enable`);
      if (result.success) {
        await biometricService.setEnabled(true);
        toast({ title: `${label} enabled`, description: `You can now sign in with ${label}.` });
      } else {
        toast({
          title: 'Verification failed',
          description: `Could not verify ${label}. You can turn this on later in Settings.`,
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

  if (checking || !available) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-8 animate-fade-in">
          {biometryType === 'faceId' ? (
            <ScanFace className="w-12 h-12 text-primary" />
          ) : (
            <Fingerprint className="w-12 h-12 text-primary" />
          )}
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-4 animate-slide-up">
          Unlock with {label}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xs animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Skip typing your password every time — use {label} to get back into Budder Buddy instantly.
        </p>

        <div className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-3 text-left animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            Your tattoo photos stay private, locked behind {label}. You can turn this off anytime in Settings.
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
              Verifying...
            </>
          ) : (
            `Enable ${label}`
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
