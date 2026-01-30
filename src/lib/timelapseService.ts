import { logger } from './logger';

interface TimelapsePhoto {
  imageUrl: string;
  dayNumber: number;
}

interface TimelapseResult {
  success: boolean;
  error?: string;
}

/**
 * Generates an animated GIF timelapse from healing photos.
 * Uses gifshot library to create the GIF client-side.
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

    // Generate GIF using gifshot
    const gifBlob = await createGif(validImages);
    
    if (!gifBlob) {
      return { success: false, error: 'Failed to generate GIF' };
    }

    // Trigger download
    const filename = `healing-timelapse-${tattooName.toLowerCase().replace(/\s+/g, '-')}.gif`;
    downloadBlob(gifBlob, filename);

    return { success: true };
  } catch (error) {
    logger.error('[TimelapseService] Error generating timelapse:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
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
 */
async function createGif(images: string[]): Promise<Blob | null> {
  return new Promise((resolve) => {
    // Dynamic import of gifshot
    import('gifshot').then((gifshot) => {
      const gifshotLib = gifshot.default || gifshot;
      
      gifshotLib.createGIF({
        images,
        gifWidth: 800,
        gifHeight: 800,
        interval: 0.5, // 500ms per frame
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

        // Convert base64 to blob
        const base64 = result.image;
        if (!base64) {
          resolve(null);
          return;
        }

        try {
          const byteString = atob(base64.split(',')[1]);
          const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          
          resolve(new Blob([ab], { type: mimeString }));
        } catch (error) {
          logger.error('[TimelapseService] Failed to convert GIF to blob:', error);
          resolve(null);
        }
      });
    }).catch((error) => {
      logger.error('[TimelapseService] Failed to load gifshot:', error);
      resolve(null);
    });
  });
}

/**
 * Triggers a file download in the browser.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
