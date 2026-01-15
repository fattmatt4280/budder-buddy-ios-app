import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GhostOverlay } from "@/components/camera/GhostOverlay";
import { CameraControls } from "@/components/camera/CameraControls";
import { cameraService } from "@/lib/cameraService";
import { useCloudPhotos } from "@/hooks/useCloudPhotos";
import { useTattoos, useSettings } from "@/hooks/useStorage";
import { useToast } from "@/hooks/use-toast";
import { getDayNumber } from "@/types";
import { Loader2, Camera, ImageOff } from "lucide-react";

interface LocationState {
  tattooId?: string;
  ghostImageUrl?: string;
}

export default function GhostCameraScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { uploadPhoto, getPhotosForTattoo } = useCloudPhotos();
  const { tattoos } = useTattoos();
  const { settings } = useSettings();

  const state = location.state as LocationState | null;
  const tattooId = state?.tattooId || settings.selectedTattooId;
  
  // Find the current tattoo to calculate day number
  const currentTattoo = tattoos.find(t => t.id === tattooId);
  const currentDayNumber = currentTattoo ? getDayNumber(currentTattoo.tattooDate) : 1;

  const [ghostImageUrl, setGhostImageUrl] = useState<string | null>(state?.ghostImageUrl || null);
  const [ghostOpacity, setGhostOpacity] = useState(40);
  const [showGhost, setShowGhost] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isWebFallback, setIsWebFallback] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNative = cameraService.isNativeCamera();

  // Load the most recent photo as ghost image if not provided
  useEffect(() => {
    if (!ghostImageUrl && tattooId) {
      const photos = getPhotosForTattoo(tattooId);
      if (photos.length > 0) {
        // Get the most recent photo (they're sorted by dayNumber descending)
        const mostRecentPhoto = photos[0];
        setGhostImageUrl(mostRecentPhoto.imageUrl);
      }
    }
  }, [tattooId, ghostImageUrl, getPhotosForTattoo]);

  // Initialize camera on mount
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (!isNative) {
        console.log('[GhostCamera] Web environment detected, using fallback');
        setIsWebFallback(true);
        setCameraReady(true);
        return;
      }

      try {
        await cameraService.start();
        if (mounted) {
          setCameraReady(true);
        }
      } catch (error) {
        console.error('[GhostCamera] Failed to initialize camera:', error);
        if (mounted) {
          setCameraError('Unable to access camera. Please check permissions.');
          setIsWebFallback(true);
          setCameraReady(true);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (isNative) {
        cameraService.stop();
      }
    };
  }, [isNative]);

  const handleCapture = useCallback(async () => {
    if (!tattooId) {
      toast({
        title: "No tattoo selected",
        description: "Please select a tattoo first",
        variant: "destructive",
      });
      return;
    }

    setIsCapturing(true);

    try {
      if (isNative && !isWebFallback) {
        // Native capture
        const result = await cameraService.capture(85);
        const file = cameraService.base64ToFile(result.base64, `tattoo-${Date.now()}.jpg`);
        const compressedFile = await cameraService.compressImage(file);
        
        await uploadPhoto(compressedFile, tattooId, currentDayNumber);
        
        toast({
          title: "Photo saved!",
          description: `Day ${currentDayNumber} photo added to your gallery`,
        });
        
        // Stop camera before navigating
        await cameraService.stop();
        navigate('/photos', { replace: true });
      } else {
        // Web fallback - trigger file input
        fileInputRef.current?.click();
      }
    } catch (error) {
      console.error('[GhostCamera] Capture failed:', error);
      toast({
        title: "Capture failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
    }
  }, [tattooId, currentDayNumber, isNative, isWebFallback, uploadPhoto, toast, navigate]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !tattooId) return;

    setIsCapturing(true);
    try {
      const compressedFile = await cameraService.compressImage(file);
      await uploadPhoto(compressedFile, tattooId, currentDayNumber);
      
      toast({
        title: "Photo saved!",
        description: `Day ${currentDayNumber} photo added to your gallery`,
      });
      
      navigate('/photos', { replace: true });
    } catch (error) {
      console.error('[GhostCamera] Upload failed:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCapturing(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [tattooId, currentDayNumber, uploadPhoto, toast, navigate]);

  const handleFlip = useCallback(async () => {
    if (isNative && !isWebFallback) {
      await cameraService.flip();
    }
  }, [isNative, isWebFallback]);

  const handleClose = useCallback(async () => {
    if (isNative) {
      await cameraService.stop();
    }
    navigate(-1);
  }, [isNative, navigate]);

  // Loading state
  if (!cameraReady) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Starting camera...</p>
        </div>
      </div>
    );
  }

  // Web fallback UI
  if (isWebFallback) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col z-50">
        {/* Ghost overlay for reference */}
        <div className="flex-1 relative flex items-center justify-center">
          {ghostImageUrl && showGhost ? (
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={ghostImageUrl}
                alt="Previous photo reference"
                className="max-w-full max-h-full object-contain rounded-lg"
                style={{ opacity: ghostOpacity / 100 }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white/80 bg-black/50 px-4 py-2 rounded-lg">
                  <Camera className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">Reference: Align your new photo with this</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/60 p-8">
              <ImageOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No previous photo</p>
              <p className="text-sm">Take your first photo to start tracking</p>
            </div>
          )}
        </div>

        {/* Camera controls for web */}
        <CameraControls
          ghostOpacity={ghostOpacity}
          onOpacityChange={setGhostOpacity}
          showGhost={showGhost}
          onToggleGhost={() => setShowGhost(!showGhost)}
          hasGhostImage={!!ghostImageUrl}
          onCapture={handleCapture}
          onClose={handleClose}
          isCapturing={isCapturing}
        />

        {/* Hidden file input for web fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {cameraError && (
          <div className="absolute top-safe-area-inset-top left-0 right-0 p-4 pt-12">
            <div className="bg-destructive/90 text-destructive-foreground text-sm p-3 rounded-lg">
              {cameraError}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Native camera UI (camera renders behind transparent webview)
  // The camera-preview plugin renders the camera BEHIND the webview.
  // We must ensure the webview is transparent and use GPU compositing
  // to keep overlay elements visible on top of the camera feed.
  return (
    <div 
      className="fixed inset-0 z-50" 
      style={{ 
        backgroundColor: 'transparent',
        // Force GPU compositing for the entire container
        transform: 'translateZ(0)',
        // Ensure proper layer stacking
        isolation: 'isolate',
      }}
    >
      {/* Ghost overlay layer - sits above the camera */}
      <div 
        className="absolute inset-0 z-10"
        style={{
          transform: 'translateZ(0)',
          pointerEvents: 'none',
        }}
      >
        <GhostOverlay
          imageUrl={ghostImageUrl}
          opacity={ghostOpacity}
          visible={showGhost}
        />
      </div>

      {/* Day indicator layer */}
      <div 
        className="absolute top-safe-area-inset-top left-0 right-0 p-4 pt-12 z-20"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="flex justify-center">
          <span className="bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
            Day {currentDayNumber}
          </span>
        </div>
      </div>

      {/* Camera controls layer */}
      <CameraControls
        ghostOpacity={ghostOpacity}
        onOpacityChange={setGhostOpacity}
        showGhost={showGhost}
        onToggleGhost={() => setShowGhost(!showGhost)}
        hasGhostImage={!!ghostImageUrl}
        onCapture={handleCapture}
        onClose={handleClose}
        onFlip={handleFlip}
        isCapturing={isCapturing}
      />

      {/* No ghost image hint */}
      {!ghostImageUrl && (
        <div 
          className="absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center px-8 z-10"
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="bg-black/50 text-white p-4 rounded-xl backdrop-blur-sm">
            <Camera className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">This is your first photo for this tattoo!</p>
            <p className="text-xs text-white/70 mt-1">Future photos will show a ghost overlay for alignment</p>
          </div>
        </div>
      )}
    </div>
  );
}
