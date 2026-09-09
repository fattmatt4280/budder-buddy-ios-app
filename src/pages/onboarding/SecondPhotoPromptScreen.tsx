import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mascotImage from '@/assets/mascot.png';

interface LocationState {
  tattooId?: string;
}

/**
 * Shown right after a brand-new user's first tattoo photo, before their
 * account exists. Explains the Ghost Camera comparison feature and sends
 * them to take a second photo so they actually see it work (the ghost
 * overlay needs a prior photo to compare against).
 */
export default function SecondPhotoPromptScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const handleContinue = () => {
    navigate('/ghost-camera', {
      replace: true,
      state: { tattooId: state?.tattooId, onboarding: true, onboardingPhotoStep: 'second' },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-8 animate-fade-in">
          <img
            src={mascotImage}
            alt="Budder Buddy mascot"
            className="w-28 h-28 rounded-3xl shadow-lg"
          />
          <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center border-4 border-background">
            <Ghost className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3 animate-slide-up">
          Nice first photo!
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xs animate-slide-up" style={{ animationDelay: '0.05s' }}>
          Now take a second one so you can see the Ghost Camera in action — it overlays your
          last photo right on the screen so you can line up the exact same shot every time.
        </p>

        <div className="w-full bg-card rounded-xl p-4 border border-border flex items-center gap-3 text-left animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm text-foreground">
            Consistent angle & lighting across every check-in makes your healing timelapse look great.
          </p>
        </div>
      </div>

      <div className="px-6 pb-8">
        <Button
          onClick={handleContinue}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity"
        >
          Take 2nd Photo
        </Button>
      </div>
    </div>
  );
}
