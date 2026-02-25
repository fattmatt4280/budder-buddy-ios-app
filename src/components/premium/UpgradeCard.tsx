import { Crown, Sparkles, Camera, MessageCircle, Film, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradeCardProps {
  featureName?: string;
  onUpgrade: () => void;
  isLoading?: boolean;
  compact?: boolean;
}

const PRO_FEATURES = [
  { icon: Camera, label: 'Ghost Camera overlay' },
  { icon: MessageCircle, label: 'AI Healing Guide' },
  { icon: Film, label: 'Timelapse exports' },
  { icon: Star, label: 'Unlimited tattoos' },
];

export function UpgradeCard({ featureName, onUpgrade, isLoading, compact }: UpgradeCardProps) {
  if (compact) {
    return (
      <div className="liquid-glass-card rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">
              {featureName ? `${featureName} is Pro` : 'Upgrade to Pro'}
            </p>
            <p className="text-xs text-muted-foreground">Unlock all premium features</p>
          </div>
        </div>
        <Button
          onClick={onUpgrade}
          disabled={isLoading}
          className="w-full"
          variant="glassPrimary"
          size="sm"
        >
          <Crown className="w-4 h-4 mr-1" />
          Go Pro — $2.99/mo
        </Button>
      </div>
    );
  }

  return (
    <div className="liquid-glass-card rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400/30 to-amber-600/20 flex items-center justify-center">
        <Crown className="w-8 h-8 text-amber-400" />
      </div>

      <h3 className="text-xl font-bold text-foreground mb-1">
        {featureName ? `${featureName} is a Pro Feature` : 'Unlock Budder Buddy Pro'}
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        Get the full tattoo care experience
      </p>

      <div className="space-y-2 mb-6 text-left">
        {PRO_FEATURES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-foreground">{label}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onUpgrade}
        disabled={isLoading}
        className="w-full"
        variant="glassPrimary"
        size="lg"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Go Pro — $2.99/mo
      </Button>

      <p className="text-xs text-muted-foreground mt-3">
        Cancel anytime in Apple Settings • Auto-renews monthly
      </p>
    </div>
  );
}
