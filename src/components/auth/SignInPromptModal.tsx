import { useNavigate } from 'react-router-dom';
import { X, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl border-border">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex flex-col items-center text-center pt-2">
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

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-foreground">
              Unlock Your Healing Journey
            </DialogTitle>
            <p className="text-sm text-muted-foreground px-2">
              Create a free account to track your tattoo's progress, get personalized reminders, and save photos of your healing journey.
            </p>
          </DialogHeader>

          {/* Benefits list */}
          <div className="w-full mt-4 space-y-2 text-left">
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
          <div className="w-full mt-6 space-y-3">
            <Button
              onClick={handleSignIn}
              className="w-full h-12 text-base font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity"
            >
              <User className="w-4 h-4 mr-2" />
              Sign Up — It's Free
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
