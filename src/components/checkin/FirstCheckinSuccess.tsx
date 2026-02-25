import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mascotImage from '@/assets/mascot.png';

interface FirstCheckinSuccessProps {
  open: boolean;
  onClose: () => void;
}

export default function FirstCheckinSuccess({ open, onClose }: FirstCheckinSuccessProps) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative liquid-glass-card border-0 w-full max-w-sm rounded-2xl p-8 animate-fade-in text-center">
        {/* Success animation */}
        <div className="relative mb-6">
          <img
            src={mascotImage}
            alt="Budder Buddy"
            className="w-20 h-20 mx-auto rounded-2xl shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-success flex items-center justify-center shadow-lg animate-scale-in">
            <Check className="w-5 h-5 text-success-foreground" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-lg font-bold text-foreground">You're officially on track</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Day 1 logged. Your healing journey has begun!
        </p>

        <Button
          onClick={() => {
            onClose();
            navigate('/');
          }}
          className="w-full liquid-glass-primary text-primary-foreground font-semibold"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
