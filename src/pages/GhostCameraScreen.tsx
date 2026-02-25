import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GhostOverlay } from "@/components/camera/GhostOverlay";
import { CameraControls } from "@/components/camera/CameraControls";
import { cameraService, PermissionStatus } from "@/lib/cameraService";
import { useCloudPhotos } from "@/hooks/useCloudPhotos";
import { useTattoos, useSettings } from "@/hooks/useStorage";
import { useToast } from "@/hooks/use-toast";
import { getDayNumber } from "@/types";
import { Loader2, Camera, ImageOff, Settings, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumGate } from "@/components/premium/PremiumGate";

interface LocationState {
  tattooId?: string;
  ghostImageUrl?: string;
}

export default function GhostCameraScreen() {
  return (
    <PremiumGate featureName="Ghost Camera">
      <GhostCameraContent />
    </PremiumGate>
  );
}

function GhostCameraContent() {
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
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | 'loading'>('loading');
  
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

  // Check permission status on mount
  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      if (!isNative) {
        // Web doesn't need native permissions
        setPermissionStatus('granted');
        setIsWebFallback(true);
        setCameraReady(true);
        return;
      }

      const status = await cameraService.checkCameraPermission();
      if (mounted) {
        setPermissionStatus(status);
        
        // If already granted, start the camera
        if (status === 'granted') {
          startCamera();
        }
      }
    };

    checkPermission();

    return () => {
      mounted = false;
    };
  }, [isNative]);

  const startCamera = async () => {
    console.log('[GhostCamera] Starting native camera preview...');
    try {
      await cameraService.start();
      console.log('[GhostCamera] Camera started successfully');
      setCameraReady(true);
    } catch (error) {
      console.error('[GhostCamera] Failed to start camera:', error);
      setCameraError('Unable to start camera. Please try again.');
      setIsWebFallback(true);
      setCameraReady(true);
    }
  };

  const handleRequestPermission = async () => {
    setPermissionStatus('loading');
    const status = await cameraService.requestCameraPermission();
    setPermissionStatus(status);
    
    if (status === 'granted') {
      await startCamera();
    }
  };

  const handleOpenSettings = () => {
    // On iOS, we can't directly open settings from the app
    // But we can show instructions
    toast({
      title: "Open Settings",
      description: "Go to Settings > Budder Buddy > Camera and enable access",
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isNative && cameraReady) {
        cameraService.stop();
      }
    };
  }, [isNative, cameraReady]);

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
    if (isNative && cameraReady) {
      await cameraService.stop();
    }
    navigate(-1);
  }, [isNative, cameraReady, navigate]);

  // Permission checking state
  if (permissionStatus === 'loading') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Checking camera access...</p>
        </div>
      </div>
    );
  }

  // Permission needs to be requested (first time)
  if (permissionStatus === 'prompt' && isNative) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-8">
        <div className="text-center text-white max-w-sm">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Camera className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold mb-3">Camera Access Needed</h1>
          <p className="text-white/70 mb-8">
            To take photos of your healing tattoo, Budder Buddy needs access to your camera.
          </p>
          <Button
            onClick={handleRequestPermission}
            className="w-full mb-4"
            size="lg"
          >
            Allow Camera Access
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full text-white/60"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    );
  }

  // Permission was denied - show settings prompt
  if (permissionStatus === 'denied' && isNative) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 p-8">
        <div className="text-center text-white max-w-sm">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold mb-3">Camera Access Denied</h1>
          <p className="text-white/70 mb-4">
            Camera access was previously denied. To take photos, you'll need to enable it in your device settings.
          </p>
          <div className="bg-white/10 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-white/80 font-medium mb-2">How to enable:</p>
            <ol className="text-sm text-white/60 space-y-1 list-decimal list-inside">
              <li>Open the <strong>Settings</strong> app</li>
              <li>Scroll down and tap <strong>Budder Buddy</strong></li>
              <li>Enable <strong>Camera</strong> access</li>
              <li>Return here and try again</li>
            </ol>
          </div>
          <Button
            onClick={handleOpenSettings}
            className="w-full mb-4 gap-2"
            size="lg"
          >
            <Settings className="h-5 w-5" />
            Open Settings Guide
          </Button>
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full text-white/60"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Loading state (starting camera after permission granted)
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

      {/* Budder Buddy title - transparent header */}
      <div 
        className="absolute top-0 left-0 right-0 pt-safe-area-inset-top z-20 pointer-events-none"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="flex flex-col items-center pt-3">
          <h1 
            className="text-white/70 text-xl font-semibold tracking-wide"
            style={{ 
              textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              transform: 'translateZ(0)',
            }}
          >
            Budder Buddy
          </h1>
          {/* Day indicator below title */}
          <span className="bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm mt-2">
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
