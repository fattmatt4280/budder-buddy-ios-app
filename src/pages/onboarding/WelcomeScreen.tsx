import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/useStorage';
import mascotImage from '@/assets/mascot.png';
import { 
  removeBackground, 
  loadImage, 
  getCachedTransparentImage, 
  setCachedTransparentImage 
} from '@/lib/removeBackground';

export default function WelcomeScreen() {
  const navigate = useNavigate();
  const { updateSettings } = useSettings();
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processImage = async () => {
      // Check cache first
      const cached = getCachedTransparentImage();
      if (cached) {
        setProcessedImage(cached);
        setIsProcessing(false);
        return;
      }

      try {
        const img = await loadImage(mascotImage);
        const transparentDataUrl = await removeBackground(img);
        setCachedTransparentImage(transparentDataUrl);
        setProcessedImage(transparentDataUrl);
      } catch (error) {
        console.error('Failed to remove background, using original:', error);
        setProcessedImage(mascotImage);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, []);

  const handleStart = () => {
    updateSettings({ hasAcknowledgedDisclaimer: true });
    navigate('/setup');
  };

  return (
    <div className="min-h-screen flex flex-col gradient-background safe-area-top safe-area-bottom">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Mascot/Logo */}
        <div className="relative mb-8 animate-fade-in">
          {isProcessing ? (
            <Skeleton className="w-40 h-40 rounded-3xl" />
          ) : (
            <img 
              src={processedImage || mascotImage} 
              alt="Budder Buddy mascot" 
              className="w-40 h-40 rounded-3xl shadow-2xl"
            />
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-3 animate-slide-up">
          Budder Buddy
        </h1>
        <p className="text-lg text-muted-foreground mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Your Tattoo Aftercare Companion
        </p>
        <p className="text-sm text-muted-foreground/80 max-w-xs animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Daily guidance, reminders, and tips to help your new ink heal beautifully.
        </p>
      </div>

      {/* Bottom section */}
      <div className="px-6 pb-8 space-y-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        {/* Disclaimer */}
        <div className="bg-card/50 rounded-xl p-4 border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Educational Purposes Only:</span>{' '}
            Budder Buddy provides general aftercare guidance and does not offer medical advice. 
            If you have concerns about your healing tattoo, please contact your tattoo artist 
            or a medical professional.
          </p>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={handleStart}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
