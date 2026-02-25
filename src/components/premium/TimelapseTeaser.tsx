import { Lock, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';

interface TimelapseTeaserProps {
  photoCount: number;
}

export default function TimelapseTeaser({ photoCount }: TimelapseTeaserProps) {
  const { isPro, purchase } = useAppData();

  // Don't show for Pro users or if no photos
  if (isPro || photoCount < 2) return null;

  return (
    <div className="liquid-glass-card rounded-2xl p-5 relative overflow-hidden">
      {/* Blurred background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-[2px]" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Film className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm">Your healing movie is building…</h3>
            <p className="text-xs text-muted-foreground">{photoCount} frames captured</p>
          </div>
        </div>

        {/* Blurred preview bar */}
        <div className="flex gap-1 mb-4 opacity-60 blur-[2px] pointer-events-none">
          {Array.from({ length: Math.min(photoCount, 8) }).map((_, i) => (
            <div
              key={i}
              className="flex-1 h-12 rounded-md bg-muted"
            />
          ))}
        </div>

        <Button
          onClick={() => purchase()}
          variant="outline"
          size="sm"
          className="w-full border-primary/30 text-primary hover:bg-primary/10"
        >
          <Lock className="w-3.5 h-3.5 mr-1.5" />
          Unlock Timelapse Export (Pro)
        </Button>
      </div>
    </div>
  );
}
