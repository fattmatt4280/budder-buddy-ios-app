import { logger } from './logger';

interface TimelapsePhoto {
  imageUrl: string;
  dayNumber: number;
}

interface TimelapseResult {
  success: boolean;
  error?: string;
  gifDataUrl?: string;
}

/**
 * Generates an animated GIF timelapse from healing photos.
 * Returns the GIF as a base64 data URL — caller decides how to share/download.
 */
export async function generateTimelapse(
  photos: TimelapsePhoto[],
  tattooName: string
): Promise<TimelapseResult> {
  if (photos.length < 2) {
    return { success: false, error: 'Need at least 2 photos to create a timelapse' };
  }

  try {
    // Sort photos by day number (ascending)
    const sortedPhotos = [...photos].sort((a, b) => a.dayNumber - b.dayNumber);

    // Load all images and add day overlay
    const processedImages = await Promise.all(
      sortedPhotos.map(photo => addDayOverlay(photo.imageUrl, photo.dayNumber))
    );

    // Filter out any failed images
    const validImages = processedImages.filter((img): img is string => img !== null);

    if (validImages.length < 2) {
      return { success: false, error: 'Failed to load enough images for timelapse' };
    }

    // Generate GIF using gifshot — returns base64 data URL
    const gifDataUrl = await createGif(validImages);

    if (!gifDataUrl) {
      return { success: false, error: 'Failed to generate GIF' };
    }

    return { success: true, gifDataUrl };
  } catch (error) {
    logger.error('[TimelapseService] Error generating timelapse:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Saves GIF to device cache and opens native share sheet on iOS.
 * Falls back to browser download on web.
 */
export async function shareTimelapse(
  gifDataUrl: string,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  const isNative = !!(window as any).Capacitor?.isNativePlatform?.();

  if (!isNative) {
    downloadFromDataUrl(gifDataUrl, filename);
    return { success: true };
  }

  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');

    // Extract pure base64 from data URL
    const base64Data = gifDataUrl.split(',')[1];

    // Write to cache directory (auto-cleaned by iOS)
    await Filesystem.writeFile({
      path: filename,
      data: base64Data,
      directory: Directory.Cache,
    });

    // Get the file URI for sharing
    const uriResult = await Filesystem.getUri({
      path: filename,
      directory: Directory.Cache,
    });

    // Show native share sheet
    await Share.share({
      title: 'My Healing Timelapse',
      text: 'Check out my tattoo healing journey!',
      files: [uriResult.uri],
      dialogTitle: 'Share Your Timelapse',
    });

    return { success: true };
  } catch (error: any) {
    // Share.share() throws if user dismisses the share sheet — not a real error
    if (error?.message?.includes('canceled') ||
        error?.message?.includes('cancelled') ||
        error?.message?.includes('dismissed')) {
      return { success: true };
    }

    logger.error('[TimelapseService] Share failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to share timelapse',
    };
  }
}

/**
 * Adds a "Day X" text overlay to an image.
 */
async function addDayOverlay(imageUrl: string, dayNumber: number): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(null);
        return;
      }

      // Set canvas size (max 800px wide for reasonable GIF size)
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Add semi-transparent overlay at bottom
      const overlayHeight = 60;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, canvas.height - overlayHeight, canvas.width, overlayHeight);

      // Add day text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Day ${dayNumber}`, canvas.width / 2, canvas.height - overlayHeight / 2);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = () => {
      logger.error('[TimelapseService] Failed to load image:', imageUrl);
      resolve(null);
    };

    img.src = imageUrl;
  });
}

/**
 * Creates a GIF from an array of image data URLs using gifshot.
 * Returns the GIF as a base64 data URL string.
 */
async function createGif(images: string[]): Promise<string | null> {
  return new Promise((resolve) => {
    import('gifshot').then((gifshot) => {
      const gifshotLib = gifshot.default || gifshot;

      gifshotLib.createGIF({
        images,
        gifWidth: 800,
        gifHeight: 800,
        interval: 0.5,
        numFrames: images.length,
        frameDuration: 1,
        sampleInterval: 10,
        numWorkers: 2,
      }, (result: { error: boolean; errorCode?: string; errorMsg?: string; image?: string }) => {
        if (result.error) {
          logger.error('[TimelapseService] GIF creation error:', result.errorMsg);
          resolve(null);
          return;
        }

        // result.image is a base64 data URL
        resolve(result.image || null);
      });
    }).catch((error) => {
      logger.error('[TimelapseService] Failed to load gifshot:', error);
      resolve(null);
    });
  });
}

/**
 * Web fallback: triggers a file download from a data URL.
 */
function downloadFromDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
