import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export interface CaptureResult {
  base64: string;
  format: 'jpeg' | 'png';
}

export type PermissionStatus = 'granted' | 'denied' | 'prompt';

const isNative = Capacitor.isNativePlatform();

export const cameraService = {
  /**
   * Check if we're running on a native platform with camera-preview support
   */
  isNativeCamera(): boolean {
    return isNative;
  },

  /**
   * Check and request camera permission using @capacitor/camera
   * This is required on iOS before starting the camera preview
   */
  async requestCameraPermission(): Promise<PermissionStatus> {
    if (!isNative) return 'granted'; // Web handles permissions via browser

    try {
      console.log('[CameraService] Checking camera permission...');
      const status = await Camera.checkPermissions();
      console.log('[CameraService] Current permission status:', status.camera);

      if (status.camera === 'granted') {
        return 'granted';
      }

      if (status.camera === 'denied') {
        // User previously denied - can't re-prompt on iOS, need to go to Settings
        console.log('[CameraService] Permission previously denied');
        return 'denied';
      }

      // Permission not yet asked (prompt or prompt-with-rationale) - request it
      console.log('[CameraService] Requesting camera permission...');
      const request = await Camera.requestPermissions({ permissions: ['camera'] });
      console.log('[CameraService] Permission request result:', request.camera);
      
      return request.camera === 'granted' ? 'granted' : 'denied';
    } catch (error) {
      console.error('[CameraService] Permission check failed:', error);
      return 'denied';
    }
  },

  /**
   * Check current permission status without prompting
   */
  async checkCameraPermission(): Promise<PermissionStatus> {
    if (!isNative) return 'granted';

    try {
      const status = await Camera.checkPermissions();
      if (status.camera === 'granted') return 'granted';
      if (status.camera === 'denied') return 'denied';
      return 'prompt';
    } catch (error) {
      console.error('[CameraService] Permission check failed:', error);
      return 'denied';
    }
  },

  /**
   * Start the camera preview (renders behind the webview)
   * 
   * IMPORTANT: The camera preview renders BEHIND the webview, not inside it.
   * This means:
   * 1. The webview background must be transparent (set in capacitor.config.ts)
   * 2. Any overlay elements (like GhostOverlay) must use GPU compositing
   *    (transform: translateZ(0)) to remain visible above the camera
   * 3. toBack: true is required for this behavior
   * 
   * On iOS, if you see a blank screen instead of the camera, check:
   * - capacitor.config.ts doesn't set an opaque backgroundColor for iOS
   * - The GhostCameraScreen uses transparent backgrounds
   * - Elements use transform: translateZ(0) for GPU layer promotion
   */
  async start(options?: Partial<CameraPreviewOptions>): Promise<void> {
    if (!isNative) {
      console.log('[CameraService] Web environment - camera preview not available');
      return;
    }

    console.log('[CameraService] Starting camera with dimensions:', window.innerWidth, 'x', window.innerHeight);

    const defaultOptions: CameraPreviewOptions = {
      position: 'rear',
      // Render camera behind the webview - required for overlay functionality
      toBack: true,
      // Explicit full-screen positioning - required for camera to fill screen
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      paddingBottom: 0,
      storeToFile: false,
      disableExifHeaderStripping: false,
      enableHighResolution: true,
      lockAndroidOrientation: true,
      ...options,
    };

    try {
      await CameraPreview.start(defaultOptions);
      console.log('[CameraService] Camera started successfully');
    } catch (error) {
      console.error('[CameraService] Failed to start camera:', error);
      throw error;
    }
  },

  /**
   * Stop the camera preview
   */
  async stop(): Promise<void> {
    if (!isNative) return;

    try {
      await CameraPreview.stop();
      console.log('[CameraService] Camera stopped');
    } catch (error) {
      console.error('[CameraService] Failed to stop camera:', error);
    }
  },

  /**
   * Capture a photo from the camera preview
   */
  async capture(quality: number = 85): Promise<CaptureResult> {
    if (!isNative) {
      throw new Error('Camera capture not available in web environment');
    }

    try {
      const result = await CameraPreview.capture({
        quality,
      });

      return {
        base64: result.value,
        format: 'jpeg',
      };
    } catch (error) {
      console.error('[CameraService] Failed to capture:', error);
      throw error;
    }
  },

  /**
   * Flip between front and rear camera
   */
  async flip(): Promise<void> {
    if (!isNative) return;

    try {
      await CameraPreview.flip();
    } catch (error) {
      console.error('[CameraService] Failed to flip camera:', error);
    }
  },

  /**
   * Convert base64 to a File object for upload
   */
  base64ToFile(base64: string, filename: string = 'photo.jpg'): File {
    // Remove data URL prefix if present
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    return new File([blob], filename, { type: 'image/jpeg' });
  },

  /**
   * Composite a ghost image onto a captured photo at a given opacity.
   * Returns a compressed File ready for upload.
   */
  async compositeImages(
    cameraBase64: string,
    ghostImageUrl: string,
    ghostOpacity: number,
    maxDimension: number = 1280,
    quality: number = 0.82
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const cameraImg = new Image();
      const ghostImg = new Image();
      let cameraLoaded = false;
      let ghostLoaded = false;

      const tryComposite = () => {
        if (!cameraLoaded || !ghostLoaded) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Failed to get canvas context'));

        let { width, height } = cameraImg;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw the camera image
        ctx.drawImage(cameraImg, 0, 0, width, height);

        // Draw ghost overlay at specified opacity
        ctx.globalAlpha = ghostOpacity / 100;
        // Scale ghost to fit within canvas while maintaining aspect ratio
        const ghostAspect = ghostImg.width / ghostImg.height;
        const canvasAspect = width / height;
        let gw: number, gh: number, gx: number, gy: number;
        if (ghostAspect > canvasAspect) {
          gw = width;
          gh = width / ghostAspect;
          gx = 0;
          gy = (height - gh) / 2;
        } else {
          gh = height;
          gw = height * ghostAspect;
          gx = (width - gw) / 2;
          gy = 0;
        }
        ctx.drawImage(ghostImg, gx, gy, gw, gh);
        ctx.globalAlpha = 1.0;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], `tattoo-composite-${Date.now()}.jpg`, { type: 'image/jpeg' }));
            } else {
              reject(new Error('Failed to composite images'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      cameraImg.onload = () => { cameraLoaded = true; tryComposite(); };
      ghostImg.onload = () => { ghostLoaded = true; tryComposite(); };
      cameraImg.onerror = () => reject(new Error('Failed to load camera image'));
      ghostImg.onerror = () => reject(new Error('Failed to load ghost image'));

      // Set crossOrigin for ghost image (may be a Supabase URL)
      ghostImg.crossOrigin = 'anonymous';

      const base64Data = cameraBase64.startsWith('data:')
        ? cameraBase64
        : `data:image/jpeg;base64,${cameraBase64}`;
      cameraImg.src = base64Data;
      ghostImg.src = ghostImageUrl;
    });
  },

  /**
   * Compress an image file to the app's standard size (1280px max, JPEG 0.82)
   */
  async compressImage(file: File, maxDimension: number = 1280, quality: number = 0.82): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Scale down if needed
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  },
};
