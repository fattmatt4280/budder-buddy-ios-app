import { Camera, CheckSquare, Info, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StartHereCardProps {
  dayNumber: number;
  phaseOneLiner: string;
  onScrollToChecklist: () => void;
  onOpenAddPhoto: () => void;
  onOpenWhatsNormal: () => void;
  onDismiss: () => void;
  isHighlighted?: boolean;
}

export default function StartHereCard({
  dayNumber,
  phaseOneLiner,
  onScrollToChecklist,
  onOpenAddPhoto,
  onOpenWhatsNormal,
  onDismiss,
  isHighlighted = false,
}: StartHereCardProps) {
  return (
    <div 
      className={cn(
        "relative liquid-glass-card rounded-2xl p-5 transition-all duration-500",
        isHighlighted 
          ? "shadow-lg shadow-primary/30 animate-pulse-subtle" 
          : ""
      )}
    >
      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/80 flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Start here</h3>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-foreground font-medium mb-1">Today is Day {dayNumber}</p>
        <p className="text-sm text-muted-foreground">{phaseOneLiner}</p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onScrollToChecklist}
          variant="secondary"
          size="sm"
          className="h-9 rounded-xl text-xs font-medium"
        >
          <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
          Do today's checklist
        </Button>
        <Button
          onClick={onOpenAddPhoto}
          variant="secondary"
          size="sm"
          className="h-9 rounded-xl text-xs font-medium"
        >
          <Camera className="w-3.5 h-3.5 mr-1.5" />
          Add first photo
        </Button>
        <Button
          onClick={onOpenWhatsNormal}
          variant="secondary"
          size="sm"
          className="h-9 rounded-xl text-xs font-medium"
        >
          <Info className="w-3.5 h-3.5 mr-1.5" />
          What's normal today?
        </Button>
      </div>
    </div>
  );
}
