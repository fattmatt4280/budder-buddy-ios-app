import { Button } from "@/components/ui/button";
import { Camera, X, FlipHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraControlsProps {
  onCapture: () => void;
  onClose: () => void;
  onFlip?: () => void;
  isCapturing: boolean;
  className?: string;
}

export function CameraControls({
  onCapture,
  onClose,
  onFlip,
  isCapturing,
  className,
}: CameraControlsProps) {
  return (
    <div className={cn("absolute bottom-0 left-0 right-0 z-20", className)}>
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

          {/* Right: Flip button */}
          <div className="flex gap-2">
            {onFlip ? (
              <Button
                variant="glass"
                size="icon"
                onClick={onFlip}
                className="h-12 w-12 rounded-full text-white"
                disabled={isCapturing}
              >
                <FlipHorizontal className="h-5 w-5" />
              </Button>
            ) : (
              <div className="h-12 w-12" /> // Spacer for alignment
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
