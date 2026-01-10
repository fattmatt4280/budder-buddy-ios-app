import { Bell, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnableNotificationsBannerProps {
  onOpenSettings: () => void;
}

export default function EnableNotificationsBanner({ onOpenSettings }: EnableNotificationsBannerProps) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Bell className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground mb-1">
          Turn on reminders in Settings
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          To get wash/moisturize reminders, enable notifications for Budder Buddy.
        </p>
        <Button
          onClick={onOpenSettings}
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs border-amber-500/30 hover:bg-amber-500/10"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
          Open Settings
        </Button>
      </div>
    </div>
  );
}
