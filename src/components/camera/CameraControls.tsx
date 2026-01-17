import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Camera, X, Eye, EyeOff, FlipHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraControlsProps {
  ghostOpacity: number;
  onOpacityChange: (value: number) => void;
  showGhost: boolean;
  onToggleGhost: () => void;
  hasGhostImage: boolean;
  onCapture: () => void;
  onClose: () => void;
  onFlip?: () => void;
  isCapturing: boolean;
  className?: string;
}

export function CameraControls({
  ghostOpacity,
  onOpacityChange,
  showGhost,
  onToggleGhost,
  hasGhostImage,
  onCapture,
  onClose,
  onFlip,
  isCapturing,
  className,
}: CameraControlsProps) {
  return (
    <div className={cn("absolute bottom-0 left-0 right-0 z-20", className)}>
      {/* Opacity slider - only show if ghost image exists */}
      {hasGhostImage && (
        <div className="px-6 py-3 liquid-glass-light">
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-xs font-medium min-w-[60px]">
              Ghost: {ghostOpacity}%
            </span>
            <Slider
              value={[ghostOpacity]}
              onValueChange={(values) => onOpacityChange(values[0])}
              min={10}
              max={80}
              step={5}
              className="flex-1"
              disabled={!showGhost}
            />
          </div>
        </div>
      )}

      {/* Main controls - Liquid Glass */}
      <div className="px-6 py-6 liquid-glass">
        <div className="flex items-center justify-between">
          {/* Left: Close button */}
          <Button
            variant="glass"
            size="icon"
            onClick={onClose}
            className="h-12 w-12 rounded-full text-white"
            disabled={isCapturing}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Center: Capture button */}
          <Button
            onClick={onCapture}
            disabled={isCapturing}
            className="h-20 w-20 rounded-full bg-white hover:bg-white/90 text-black shadow-lg border border-white/20"
            style={{
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.3)'
            }}
          >
            {isCapturing ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <Camera className="h-8 w-8" />
            )}
          </Button>

          {/* Right: Ghost toggle or flip */}
          <div className="flex gap-2">
            {hasGhostImage && (
              <Button
                variant="glass"
                size="icon"
                onClick={onToggleGhost}
                className={cn(
                  "h-12 w-12 rounded-full text-white",
                  showGhost && "bg-primary/40 border-primary/30"
                )}
                disabled={isCapturing}
              >
                {showGhost ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </Button>
            )}
            {onFlip && (
              <Button
                variant="glass"
                size="icon"
                onClick={onFlip}
                className="h-12 w-12 rounded-full text-white"
                disabled={isCapturing}
              >
                <FlipHorizontal className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hint text */}
      {hasGhostImage && showGhost && (
        <div className="absolute -top-12 left-0 right-0 text-center">
          <span className="text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full">
            Align your tattoo with the ghost image
          </span>
        </div>
      )}
    </div>
  );
}
