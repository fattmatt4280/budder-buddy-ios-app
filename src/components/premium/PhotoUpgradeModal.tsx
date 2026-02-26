import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoUpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PhotoUpgradeModal({ open, onOpenChange }: PhotoUpgradeModalProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/upgrade');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative liquid-glass-card border-0 w-full max-w-sm rounded-xl p-6 animate-fade-in text-center">
        {/* Visual preview */}
        <div className="mb-5">
          <div className="flex justify-center gap-2 mb-4">
            {/* Misaligned photos */}
            <div className="w-20 h-20 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center rotate-[-3deg]">
              <Camera className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div className="w-20 h-20 rounded-lg bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center rotate-[2deg] -ml-3">
              <Camera className="w-6 h-6 text-muted-foreground/50" />
            </div>
            {/* Aligned photo with glow */}
            <div className="w-20 h-20 rounded-lg bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-lg shadow-primary/20 -ml-3">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-2">
          You're building your healing journey
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Unlock Ghost Camera for precision-aligned progress photos that show your healing side by side.
        </p>

        <div className="space-y-3">
          <Button
            onClick={handleUpgrade}
            className="w-full liquid-glass-primary text-primary-foreground font-semibold"
          >
            <Lock className="w-4 h-4 mr-2" />
            Go Pro
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
          >
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}
