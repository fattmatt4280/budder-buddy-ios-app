import { cn } from "@/lib/utils";

interface GhostOverlayProps {
  imageUrl: string | null;
  opacity: number;
  visible: boolean;
  className?: string;
}

export function GhostOverlay({ imageUrl, opacity, visible, className }: GhostOverlayProps) {
  if (!imageUrl || !visible) {
    return null;
  }

  return (
    <div 
      className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none z-10",
        className
      )}
      style={{
        // Force GPU compositing layer - critical for visibility over native camera
        transform: 'translateZ(0)',
        willChange: 'transform, opacity',
        // Ensure this layer is above the camera preview
        isolation: 'isolate',
      }}
    >
      <img
        src={imageUrl}
        alt="Previous photo overlay"
        className="max-w-full max-h-full object-contain"
        style={{ 
          opacity: opacity / 100,
          filter: 'grayscale(30%)',
          // Force GPU layer for the image as well
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      />
      
      {/* Alignment guides */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Center crosshair */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
        
        {/* Rule of thirds grid (subtle) */}
        <div className="absolute top-1/3 left-0 right-0 h-px bg-white/15" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-white/15" />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/15" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/15" />
      </div>
    </div>
  );
}
