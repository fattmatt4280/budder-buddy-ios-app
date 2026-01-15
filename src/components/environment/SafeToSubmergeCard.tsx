import { Waves, CheckCircle, Timer } from 'lucide-react';
import { calculateSubmergeCountdown } from '@/lib/environmentService';
import { cn } from '@/lib/utils';

interface SafeToSubmergeCardProps {
  tattooDate: string;
  compact?: boolean;
}

export default function SafeToSubmergeCard({ tattooDate, compact = false }: SafeToSubmergeCardProps) {
  const countdown = calculateSubmergeCountdown(tattooDate);

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl border",
        countdown.isSafe 
          ? "bg-success/10 border-success/30" 
          : "bg-cyan-500/10 border-cyan-500/30"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          countdown.isSafe ? "bg-success/20" : "bg-cyan-500/20"
        )}>
          {countdown.isSafe ? (
            <CheckCircle className="w-5 h-5 text-success" />
          ) : (
            <Waves className="w-5 h-5 text-cyan-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium",
            countdown.isSafe ? "text-success" : "text-cyan-600 dark:text-cyan-400"
          )}>
            {countdown.isSafe ? 'Safe to Submerge!' : `${countdown.daysRemaining} days until safe`}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {countdown.isSafe ? 'Swimming & gym OK' : 'No swimming, pools, or baths'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl p-5 border animate-fade-in",
      countdown.isSafe 
        ? "bg-gradient-to-br from-success/10 to-emerald-500/10 border-success/30" 
        : "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30"
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          countdown.isSafe ? "bg-success/20" : "bg-cyan-500/20"
        )}>
          {countdown.isSafe ? (
            <CheckCircle className="w-6 h-6 text-success" />
          ) : (
            <Timer className="w-6 h-6 text-cyan-500" />
          )}
        </div>
        <div className="flex-1">
          <h3 className={cn(
            "font-semibold text-lg mb-1",
            countdown.isSafe ? "text-success" : "text-cyan-600 dark:text-cyan-400"
          )}>
            {countdown.isSafe ? '🎉 Safe to Submerge!' : 'Safe to Submerge Countdown'}
          </h3>
          {!countdown.isSafe && (
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-foreground">{countdown.daysRemaining}</span>
              <span className="text-muted-foreground">day{countdown.daysRemaining === 1 ? '' : 's'} remaining</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {countdown.message}
          </p>
          {!countdown.isSafe && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                🏊 No swimming
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                🛁 No baths
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground">
                🏋️ No gym
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
