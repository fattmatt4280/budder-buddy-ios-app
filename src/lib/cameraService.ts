import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import { Capacitor } from '@capacitor/core';

export interface CaptureResult {
  base64: string;
  format: 'jpeg' | 'png';
}

const isNative = Capacitor.isNativePlatform();

export const cameraService = {
  /**
   * Check if we're running on a native platform with camera-preview support
   */
  isNativeCamera(): boolean {
    return isNative;
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

    const defaultOptions: CameraPreviewOptions = {
      position: 'rear',
      // Render camera behind the webview - required for overlay functionality
      toBack: true,
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
