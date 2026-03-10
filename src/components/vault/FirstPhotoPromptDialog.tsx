import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  artistName?: string;
}

export default function FirstPhotoPromptDialog({
  open,
  onOpenChange,
  tattooId,
  tattooLocation,
  tattooDate,
  artistName: initialArtistName,
}: FirstPhotoPromptDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { uploadPhoto } = useCloudPhotos();
  const { updateTattoo } = useTattoos();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [artistName, setArtistName] = useState(initialArtistName || '');
  const [artistSocialLink, setArtistSocialLink] = useState('');

  if (!open) return null;

  const saveArtistInfo = () => {
    if (!tattooId) return;
    const updates: Record<string, string | undefined> = {};
    if (artistName.trim()) updates.artistName = artistName.trim();
    if (artistSocialLink.trim()) updates.artistSocialLink = artistSocialLink.trim();
    if (Object.keys(updates).length > 0) {
      updateTattoo(tattooId, updates);
    }
  };

  const handleTakePhoto = () => {
    saveArtistInfo();
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
    saveArtistInfo();

    try {
      const compressedFile = await cameraService.compressImage(file);
      const dayNumber = getDayNumber(tattooDate);
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSkip = () => {
    saveArtistInfo();
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
        <p className="text-muted-foreground text-sm mb-5">
          Capture your fresh {tattooLocation?.toLowerCase() || 'ink'} to start tracking your healing journey!
        </p>

        {/* Artist Info Fields */}
        <div className="text-left space-y-3 mb-5">
          <div>
            <Label htmlFor="artist-name" className="text-xs text-muted-foreground">
              Artist Name (optional)
            </Label>
            <Input
              id="artist-name"
              placeholder="Who did your tattoo?"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              className="mt-1 h-9 text-sm"
              disabled={uploading}
            />
          </div>
          <div>
            <Label htmlFor="artist-social" className="text-xs text-muted-foreground">
              Artist Social / Website (optional)
            </Label>
            <Input
              id="artist-social"
              placeholder="Instagram, TikTok, or website URL"
              value={artistSocialLink}
              onChange={(e) => setArtistSocialLink(e.target.value)}
              className="mt-1 h-9 text-sm"
              disabled={uploading}
            />
          </div>
        </div>

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
