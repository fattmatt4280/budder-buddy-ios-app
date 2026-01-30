import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCloudPhotos } from '@/hooks/useCloudPhotos';
import { useAuth } from '@/hooks/useAuth';
import { useTattoos } from '@/hooks/useStorage';
import { cameraService } from '@/lib/cameraService';
import { getDayNumber } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface FirstPhotoPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tattooId?: string;
  tattooLocation?: string;
  tattooDate?: string;
}

export default function FirstPhotoPromptDialog({
  open,
  onOpenChange,
  tattooId,
  tattooLocation,
  tattooDate,
}: FirstPhotoPromptDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadPhoto } = useCloudPhotos();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const handleTakePhoto = () => {
    onOpenChange(false);
    navigate('/ghost-camera', { state: { tattooId } });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tattooId || !tattooDate) return;

    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to upload photos.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Compress the image
      const compressedFile = await cameraService.compressImage(file);
      
      // Calculate day number from tattoo date
      const dayNumber = getDayNumber(tattooDate);

      // Upload to cloud
      const result = await uploadPhoto(compressedFile, tattooId, dayNumber);

      if (result.success) {
        toast({
          title: 'Photo uploaded!',
          description: 'Your first healing photo has been saved.',
        });
        onOpenChange(false);
        navigate('/photos');
      } else {
        toast({
          title: 'Upload failed',
          description: result.error || 'Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      />
      
      {/* Dialog Content */}
      <div className="relative liquid-glass-card border-0 w-full max-w-sm rounded-xl p-6 animate-fade-in text-center">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="sr-only">Close</span>
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <Camera className="w-8 h-8 text-primary" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Add Your First Photo
        </h2>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-6">
          Capture your fresh {tattooLocation?.toLowerCase() || 'ink'} to start tracking your healing journey!
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            onClick={handleTakePhoto}
            className="liquid-glass-primary text-white gap-2"
            disabled={uploading}
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </Button>
          <Button
            onClick={handleUploadClick}
            variant="outline"
            className="gap-2"
            disabled={uploading}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>

        {/* Skip Link */}
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          disabled={uploading}
        >
          Skip for Now
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />
      </div>
    </div>
  );
}
