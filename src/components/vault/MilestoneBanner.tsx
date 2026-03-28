import { Gift, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { Tattoo } from '@/types';
import { getUpcomingMilestones, formatMilestoneDate } from '@/lib/milestoneService';
import { useCloudPhotos } from '@/hooks/useCloudPhotos';

interface MilestoneBannerProps {
  tattoo: Tattoo;
}

export function MilestoneBanner({ tattoo }: MilestoneBannerProps) {
  const navigate = useNavigate();
  const { getPhotosForTattoo } = useCloudPhotos();
  const milestones = getUpcomingMilestones(tattoo);

  if (milestones.length === 0) return null;

  const milestone = milestones[0]; // Show the most imminent one

  return (
    <div className="liquid-glass-card rounded-xl p-4 border-2 border-primary/20 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-lg">{milestone.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-foreground text-sm">
              {milestone.label} Ink-iversary
            </p>
            <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
              {formatMilestoneDate(milestone.date)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {milestone.message}
          </p>
          <Button
            onClick={() => {
              const ghostPhoto = getPhotosForTattoo(tattoo.id).find(p => !!p.imageUrl);
              navigate('/ghost-camera', { state: { tattooId: tattoo.id, ghostImageUrl: ghostPhoto?.imageUrl } });
            }}
            size="sm"
            variant="glassPrimary"
            className="gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" />
            Take Comparison Photo
          </Button>
        </div>
      </div>
    </div>
  );
}
