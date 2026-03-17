import { useState } from 'react';
import { Lock, Film, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { generateTimelapse } from '@/lib/timelapseService';
import { useToast } from '@/hooks/use-toast';

interface TimelapseTeaserProps {
  photoCount: number;
  photos?: { imageUrl: string; dayNumber: number }[];
  tattooName?: string;
}

export default function TimelapseTeaser({ photoCount, photos, tattooName }: TimelapseTeaserProps) {
  const { isPro, purchase } = useAppData();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);

  if (photoCount < 2) return null;

  const handleExport = async () => {
    if (!photos || photos.length < 2) {
      toast({ title: 'Not enough photos', description: 'Need at least 2 photos to create a timelapse.' });
      return;
    }

    setExporting(true);
    try {
      const result = await generateTimelapse(photos, tattooName || 'tattoo');
      if (result.success) {
        toast({ title: '🎬 Timelapse exported!', description: 'Your healing timelapse GIF has been downloaded.' });
      } else {
        toast({ title: 'Export failed', description: result.error || 'Could not generate timelapse.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Export failed', description: 'Something went wrong generating your timelapse.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  // Pro users see export button
  if (isPro) {
    return (
      <div className="liquid-glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Film className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm">Healing Timelapse</h3>
            <p className="text-xs text-muted-foreground">{photoCount} frames ready</p>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting}
          size="sm"
          className="w-full liquid-glass-primary text-primary-foreground"
        >
          {exporting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Timelapse GIF
            </>
          )}
        </Button>
      </div>
    );
  }

  // Free users see teaser
  return (
    <div className="liquid-glass-card rounded-2xl p-5 relative overflow-hidden">
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

        <div className="flex gap-1 mb-4 opacity-60 blur-[2px] pointer-events-none">
          {Array.from({ length: Math.min(photoCount, 8) }).map((_, i) => (
            <div key={i} className="flex-1 h-12 rounded-md bg-muted" />
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
