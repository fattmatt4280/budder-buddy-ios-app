import { useNavigate } from 'react-router-dom';
import { User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mascotImage from '@/assets/mascot.png';

interface SignInPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignInPromptModal({ open, onOpenChange }: SignInPromptModalProps) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ touchAction: 'none' }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 animate-in fade-in-0"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Content - using absolute centering that works on iOS */}
      <div 
        className="relative w-full max-w-sm bg-background rounded-2xl border border-white/10 p-6 shadow-xl animate-in zoom-in-95 fade-in-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          {/* Mascot */}
          <div className="relative mb-4">
            <img
              src={mascotImage}
              alt="Budder Buddy"
              className="w-20 h-20 rounded-2xl shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">
            Unlock Your Healing Journey
          </h2>
          <p className="text-sm text-muted-foreground px-2 mb-4">
            Create a free account to track your tattoo's progress, get personalized reminders, and save photos of your healing journey.
          </p>

          {/* Benefits list */}
          <div className="w-full space-y-2 text-left mb-6">
            {[
              'Track your tattoo healing day by day',
              'Set custom aftercare reminders',
              'Save progress photos securely',
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs">✓</span>
                </div>
                {benefit}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="w-full space-y-3">
            <Button
              onClick={handleSignIn}
              className="w-full h-12 text-base font-semibold rounded-xl liquid-glass-primary text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Sign Up — It's Free
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}