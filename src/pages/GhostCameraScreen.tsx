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
import { Capacitor, registerPlugin } from "@capacitor/core";

// Register the native GhostCamera plugin
interface GhostCameraPluginInterface {
  open(options: {
    ghostImageBase64?: string;
    ghostImageUrl?: string;
    opacity?: number;
  }): Promise<{ base64Image?: string; cancelled?: boolean }>;
}

const GhostCameraPlugin = registerPlugin<GhostCameraPluginInterface>('GhostCamera');

const GHOST_OPACITY = 20;

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
  const { uploadPhoto, getPhotosForTattoo, loading: photosLoading } = useCloudPhotos();
  const { tattoos } = useTattoos();
  const { settings } = useSettings();

  const state = location.state as LocationState | null;
  const tattooId = state?.tattooId || settings.selectedTattooId;

  // Find the current tattoo to calculate day number
  const currentTattoo = tattoos.find(t => t.id === tattooId);
  const currentDayNumber = currentTattoo ? getDayNumber(currentTattoo.tattooDate) : 1;

  // Ghost image URL from route state (preferred) or fetched from hook (fallback)
  const routeGhostUrl = state?.ghostImageUrl || null;
  const [ghostImageUrl, setGhostImageUrl] = useState<string | null>(routeGhostUrl);
  const ghostImageUrlRef = useRef<string | null>(routeGhostUrl);
  const ghostRemoteUrlRef = useRef<string | null>(routeGhostUrl);
  const [ghostImageLoaded, setGhostImageLoaded] = useState(!!routeGhostUrl);
  const [ghostOpacity, setGhostOpacity] = useState(40);
  const [showGhost, setShowGhost] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isWebFallback, setIsWebFallback] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | 'loading'>('loading');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNative = cameraService.isNativeCamera();

  // Keep ref in sync with state so openNativeCamera always has the latest value
  useEffect(() => {
    ghostImageUrlRef.current = ghostImageUrl;
  }, [ghostImageUrl]);

  // Load the most recent photo as ghost image if not provided via route state.
  // On native, we just need the remote URL — the Swift side downloads it directly.
  // On web, try to convert to base64 for the overlay.
  useEffect(() => {
    // If we already have a ghost image URL (from route state), we're done
    if (ghostImageUrl || !tattooId) {
      if (!ghostImageLoaded) setGhostImageLoaded(true);
      return;
    }

    // Fallback: try to get the URL from the hook (e.g. DailyCheckinScreen navigation)
    if (photosLoading) {
      console.log('[GhostCamera] Photos still loading from Supabase, waiting...');
      return;
    }

    const photos = getPhotosForTattoo(tattooId);
    console.log('[GhostCamera] Fallback lookup: found', photos.length, 'photos for tattoo', tattooId);
    const ghostPhoto = photos.find(p => !!p.imageUrl);
    if (ghostPhoto) {
      const remoteUrl = ghostPhoto.imageUrl!;
      ghostRemoteUrlRef.current = remoteUrl;

      if (isNative) {
        // Native: just store the URL, Swift will download it
        setGhostImageUrl(remoteUrl);
        setGhostImageLoaded(true);
      } else {
        // Web: try base64 conversion for the overlay
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setGhostImageUrl(dataUrl);
          } catch {
            setGhostImageUrl(remoteUrl);
          }
          setGhostImageLoaded(true);
        };
        img.onerror = () => {
          setGhostImageUrl(remoteUrl);
          setGhostImageLoaded(true);
        };
        img.src = remoteUrl;
      }
    } else {
      console.log('[GhostCamera] No photos found for tattoo, proceeding without ghost');
      setGhostImageLoaded(true);
    }
  }, [tattooId, ghostImageUrl, ghostImageLoaded, photosLoading, getPhotosForTattoo, isNative]);

  // Make body/root transparent so native camera shows through the webview
  useEffect(() => {
    if (!isNative) return;

    const body = document.body;
    const root = document.getElementById('root');
    const prevBodyBg = body.style.backgroundColor;
    const prevRootBg = root?.style.backgroundColor ?? '';

    body.style.backgroundColor = 'transparent';
    if (root) root.style.backgroundColor = 'transparent';

    return () => {
      body.style.backgroundColor = prevBodyBg;
      if (root) root.style.backgroundColor = prevRootBg;
    };
  }, [isNative]);

  // Check permission status on mount
  useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      if (!isNative) {
        setPermissionStatus('granted');
        setIsWebFallback(true);
        setCameraReady(true);
        return;
      }

      const status = await cameraService.checkCameraPermission();
      if (mounted) {
        setPermissionStatus(status);
        if (status === 'granted') {
          startCamera();
        }
      }
    };

    checkPermission();
    return () => { mounted = false; };
  }, [isNative]);

  // On native: once permission granted and ghost loaded, open native camera immediately
  useEffect(() => {
    if (isNative && permissionStatus === 'granted' && ghostImageLoaded && !cameraReady && !isWebFallback) {
      openNativeCamera();
    }
  }, [permissionStatus, ghostImageLoaded, cameraReady, isNative, isWebFallback]);

  const startCamera = async () => {
    try {
      setCameraReady(true);
    } catch (error) {
      console.error('[GhostCamera] Failed to start camera:', error);
      setCameraError('Failed to start camera');
    }
  };

  const openNativeCamera = async () => {
    setCameraReady(true);

    // The ghost image URL comes from route state (preferred) or hook fallback
    const ghostUrl = ghostRemoteUrlRef.current || ghostImageUrlRef.current || undefined;
    // Only send base64 if it's actually a data URL (not a remote URL)
    const ghostBase64 = ghostImageUrlRef.current?.startsWith('data:') ? ghostImageUrlRef.current : undefined;

    console.log('[GhostCamera] Opening native camera, hasUrl:', !!ghostUrl, 'hasBase64:', !!ghostBase64);

    try {
      const result = await GhostCameraPlugin.open({
        ghostImageBase64: ghostBase64,
        ghostImageUrl: ghostUrl,
        opacity: 0.3,
      });

      if (result.cancelled) {
        console.log('[GhostCamera] User cancelled');
        navigate(-1);
        return;
      }

      if (result.base64Image && tattooId) {
        // Convert captured base64 to File and upload
        const file = cameraService.base64ToFile(result.base64Image, `tattoo-${Date.now()}.jpg`);
        const compressedFile = await cameraService.compressImage(file);

        const uploadResult = await uploadPhoto(compressedFile, tattooId, currentDayNumber);

        if (uploadResult.success) {
          toast({
            title: "Photo saved!",
            description: `Day ${currentDayNumber} photo added to your gallery`,
          });
          navigate('/photos', { replace: true });
        } else {
          console.error('[GhostCamera] Upload failed:', uploadResult.error);
          toast({
            title: "Upload failed",
            description: uploadResult.error || "Could not save photo. Please try again.",
            variant: "destructive",
          });
          navigate(-1);
        }
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('[GhostCamera] Native camera error:', error);
      const msg = error instanceof Error ? error.message : String(error);
      toast({
        title: "Camera error",
        description: msg || "Please try again",
        variant: "destructive",
      });
      navigate(-1);
    }
  };

  const handleRequestPermission = async () => {
    setPermissionStatus('loading');
    const status = await cameraService.requestCameraPermission();
    setPermissionStatus(status);
    if (status === 'granted') {
      await startCamera();
    }
    // The useEffect watches permissionStatus and will call openNativeCamera() once 'granted'
  };

  const handleOpenSettings = () => {
    toast({
      title: "Open Settings",
      description: "Go to Settings > Budder Buddy > Camera and enable access",
    });
  };

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
        const result = await cameraService.capture(85);

        let finalFile: File;

        // If ghost image exists, composite it onto the captured photo
        if (ghostImageUrl) {
          finalFile = await cameraService.compositeImages(
            result.base64,
            ghostImageUrl,
            GHOST_OPACITY
          );
        } else {
          const file = cameraService.base64ToFile(result.base64, `tattoo-${Date.now()}.jpg`);
          finalFile = await cameraService.compressImage(file);
        }

        await uploadPhoto(finalFile, tattooId, currentDayNumber);

        toast({
          title: "Photo saved!",
          description: `Day ${currentDayNumber} photo added to your gallery`,
        });

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
  }, [tattooId, currentDayNumber, isNative, isWebFallback, ghostImageUrl, uploadPhoto, toast, navigate]);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [tattooId, currentDayNumber, uploadPhoto, toast, navigate]);

  const handleClose = useCallback(async () => {
    navigate(-1);
  }, [navigate]);

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
          <Button onClick={handleRequestPermission} className="w-full mb-4" size="lg">
            Allow Camera Access
          </Button>
          <Button variant="ghost" onClick={handleClose} className="w-full text-white/60">
            Maybe Later
          </Button>
        </div>
      </div>
    );
  }

  // Permission was denied
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
          <Button onClick={handleOpenSettings} className="w-full mb-4 gap-2" size="lg">
            <Settings className="h-5 w-5" />
            Open Settings Guide
          </Button>
          <Button variant="ghost" onClick={handleClose} className="w-full text-white/60">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Loading state (loading ghost image or opening native camera)
  if (!cameraReady || (isNative && !isWebFallback)) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: 'transparent',
          transform: 'translateZ(0)',
        }}
      >
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>{photosLoading ? 'Loading photos...' : !ghostImageLoaded ? 'Loading overlay...' : 'Opening camera...'}</p>
        </div>
      </div>
    );
  }

  // Web fallback UI (only shown on non-native platforms)
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
