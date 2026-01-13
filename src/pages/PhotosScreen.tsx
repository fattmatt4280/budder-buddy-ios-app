import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, Trash2, X, Image as ImageIcon, Cloud, HardDrive, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTattoos, useSettings, usePhotos as useLocalPhotos, generateId } from '@/hooks/useStorage';
import { useCloudPhotos, CloudPhoto } from '@/hooks/useCloudPhotos';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getDayNumber } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Unified photo type for display
interface DisplayPhoto {
  id: string;
  dayNumber: number;
  date: string;
  imageUrl: string;
  caption?: string;
  isCloud: boolean;
}

export default function PhotosScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { tattoos, getTattoo, addTattoo } = useTattoos();
  const { settings, updateSettings } = useSettings();
  
  // Local storage photos (fallback)
  const { getPhotosForTattoo: getLocalPhotos, addPhoto: addLocalPhoto, deletePhoto: deleteLocalPhoto } = useLocalPhotos();
  
  // Cloud storage photos (preferred)
  const { photos: cloudPhotos, uploadPhoto: uploadCloudPhoto, deletePhoto: deleteCloudPhoto, loading: cloudLoading, getPhotosForTattoo: getCloudPhotos } = useCloudPhotos();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTattooIdRef = useRef<string | null>(null);

  const tattoo = settings.selectedTattooId ? getTattoo(settings.selectedTattooId) : tattoos[0];
  const currentDay = tattoo ? getDayNumber(tattoo.tattooDate) : 1;

  // Merge local and cloud photos for display
  const getDisplayPhotos = (): DisplayPhoto[] => {
    if (!tattoo) return [];

    const localPhotos = getLocalPhotos(tattoo.id).map((p) => ({
      id: p.id,
      dayNumber: p.dayNumber,
      date: p.date,
      imageUrl: p.imageData,
      caption: p.caption,
      isCloud: false,
    }));

    const cloudPhotosForTattoo = getCloudPhotos(tattoo.id).map((p) => ({
      id: p.id,
      dayNumber: p.dayNumber,
      date: p.date,
      imageUrl: p.imageUrl || '',
      caption: p.caption,
      isCloud: true,
    }));

    // Combine and sort by day number descending
    return [...cloudPhotosForTattoo, ...localPhotos].sort((a, b) => b.dayNumber - a.dayNumber);
  };

  const photos = getDisplayPhotos();
  const selectedPhotoData = photos.find((p) => p.id === selectedPhoto);

  // Group photos by day
  const photosByDay = photos.reduce((acc, photo) => {
    if (!acc[photo.dayNumber]) {
      acc[photo.dayNumber] = [];
    }
    acc[photo.dayNumber].push(photo);
    return acc;
  }, {} as Record<number, DisplayPhoto[]>);

  const handleQuickCapture = () => {
    if (!tattoo) {
      // Auto-create a quick tattoo with defaults
      const newId = generateId();
      const today = new Date().toISOString().split('T')[0];
      addTattoo({
        id: newId,
        createdAt: new Date().toISOString(),
        tattooDate: today,
        bodyLocation: 'Other',
        sizeTier: 'Medium',
        inkType: 'BlackGrey',
      });
      updateSettings({ selectedTattooId: newId });
      pendingTattooIdRef.current = newId;
    }
    // Open camera
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const tattooId = tattoo?.id || pendingTattooIdRef.current;
    if (!file || !tattooId) return;

    const tattooDate = tattoo?.tattooDate || new Date().toISOString().split('T')[0];
    const dayNumber = getDayNumber(tattooDate);

    setUploading(true);

    // If logged in, upload to cloud storage
    if (isAuthenticated && user) {
      const result = await uploadCloudPhoto(file, tattooId, dayNumber, newCaption || undefined);
      
      if (result.success) {
        toast({
          title: 'Photo saved to cloud ☁️',
          description: 'Your photo is securely stored online.',
        });
      } else {
        toast({
          title: 'Upload failed',
          description: result.error || 'Could not save photo to cloud.',
          variant: 'destructive',
        });
      }
    } else {
      // Fall back to local storage with compression
      const reader = new FileReader();
      reader.onload = async (e) => {
        const originalDataUrl = e.target?.result as string;

        // Downscale to reduce local storage usage
        const toStoredDataUrl = async () => {
          try {
            const img = new Image();
            img.decoding = 'async';
            img.src = originalDataUrl;
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject(new Error('Image decode failed'));
            });

            const maxDim = 1280;
            const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
            const w = Math.max(1, Math.round(img.width * scale));
            const h = Math.max(1, Math.round(img.height * scale));

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) return originalDataUrl;
            ctx.drawImage(img, 0, 0, w, h);

            return canvas.toDataURL('image/jpeg', 0.82);
          } catch {
            return originalDataUrl;
          }
        };

        const imageData = await toStoredDataUrl();
        const newPhotoId = generateId();

        addLocalPhoto({
          id: newPhotoId,
          tattooId,
          dayNumber,
          date: new Date().toISOString().split('T')[0],
          imageData,
          caption: newCaption || undefined,
        });

        // Verify it actually persisted
        try {
          const raw = localStorage.getItem('budder_photos');
          const parsed = raw ? (JSON.parse(raw) as Array<{ id: string }>) : [];
          const found = parsed.some((p) => p.id === newPhotoId);
          if (!found) {
            toast({
              title: 'Photo not saved',
              description: 'Device storage is full. Sign in to save photos to the cloud instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Photo saved locally 📱',
              description: 'Sign in to back up photos to the cloud.',
            });
          }
        } catch {
          // ignore
        }
      };
      reader.readAsDataURL(file);
    }

    setUploading(false);
    setIsAddingPhoto(false);
    setNewCaption('');
    pendingTattooIdRef.current = null;
    navigate('/');
    event.target.value = '';
  };

  const handleDeletePhoto = async () => {
    if (!deleteConfirm) return;

    const photo = photos.find((p) => p.id === deleteConfirm);
    if (!photo) return;

    if (photo.isCloud) {
      const result = await deleteCloudPhoto(deleteConfirm);
      if (!result.success) {
        toast({
          title: 'Delete failed',
          description: result.error || 'Could not delete photo.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      deleteLocalPhoto(deleteConfirm);
    }

    setDeleteConfirm(null);
    setSelectedPhoto(null);
  };

  if (!tattoo) {
    return (
      <div className="min-h-screen bg-background safe-area-top">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">Photo Log</h1>
          <p className="text-muted-foreground text-sm">Track your healing progress</p>
        </div>
        
        {!isAuthenticated && (
          <div className="px-6 mb-4">
            <Alert className="border-primary/30 bg-primary/5">
              <Cloud className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="text-sm">Sign in to save photos to the cloud</span>
                <Button size="sm" variant="outline" onClick={() => navigate('/auth')} className="ml-2">
                  <LogIn className="w-3 h-3 mr-1" />
                  Sign In
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Add Your Tattoo</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Take a photo to start tracking. You can add details later.
          </p>
          <Button
            onClick={handleQuickCapture}
            className="gradient-primary rounded-xl"
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            {uploading ? 'Saving...' : 'Add Your Tattoo'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Photo Log</h1>
            <p className="text-muted-foreground text-sm">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} • Day {currentDay}
            </p>
          </div>
          <Button
            onClick={() => setIsAddingPhoto(true)}
            size="sm"
            className="gradient-primary rounded-xl"
            disabled={uploading}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Storage indicator */}
      {isAuthenticated ? (
        <div className="px-6 mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Cloud className="w-3 h-3" />
            <span>Photos saved to secure cloud storage</span>
          </div>
        </div>
      ) : (
        <div className="px-6 mb-4">
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <HardDrive className="h-4 w-4 text-amber-500" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm text-amber-200">Photos saved locally only</span>
              <Button size="sm" variant="outline" onClick={() => navigate('/auth')} className="ml-2 border-amber-500/30 text-amber-200 hover:bg-amber-500/10">
                <Cloud className="w-3 h-3 mr-1" />
                Back Up
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Photos grid or empty state */}
      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">No Photos Yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Track your healing progress by taking daily photos of your tattoo.
          </p>
          <Button
            onClick={() => setIsAddingPhoto(true)}
            className="gradient-primary rounded-xl"
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Take First Photo
          </Button>
        </div>
      ) : (
        <div className="px-6 pb-8 space-y-6">
          {Object.entries(photosByDay)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([day, dayPhotos]) => (
              <div key={day} className="animate-fade-in">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Day {day}
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {dayPhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => setSelectedPhoto(photo.id)}
                      className="aspect-square rounded-xl overflow-hidden bg-muted hover:ring-2 hover:ring-primary/50 transition-all relative"
                    >
                      <img
                        src={photo.imageUrl}
                        alt={`Day ${photo.dayNumber}`}
                        className="w-full h-full object-cover"
                      />
                      {photo.isCloud && (
                        <div className="absolute top-1 right-1 bg-black/50 rounded-full p-1">
                          <Cloud className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Add photo dialog */}
      <Dialog open={isAddingPhoto} onOpenChange={setIsAddingPhoto}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Add a caption (optional)"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className="bg-muted border-border"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 gradient-primary"
                disabled={uploading}
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploading ? 'Saving...' : 'Take Photo'}
              </Button>
              <Button
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.capture = '';
                    fileInputRef.current.click();
                  }
                }}
                variant="outline"
                className="flex-1 border-border"
                disabled={uploading}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Gallery
              </Button>
            </div>
            {isAuthenticated ? (
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Cloud className="w-3 h-3" /> Saves to secure cloud
              </p>
            ) : (
              <p className="text-xs text-amber-400 text-center flex items-center justify-center gap-1">
                <HardDrive className="w-3 h-3" /> Saves locally only
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo detail dialog */}
      <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="bg-card border-border max-w-lg p-0 overflow-hidden">
          {selectedPhotoData && (
            <>
              <div className="relative">
                <img
                  src={selectedPhotoData.imageUrl}
                  alt={`Day ${selectedPhotoData.dayNumber}`}
                  className="w-full max-h-[60vh] object-contain bg-black"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                {selectedPhotoData.isCloud && (
                  <div className="absolute top-3 left-3 bg-black/50 rounded-full px-2 py-1 flex items-center gap-1">
                    <Cloud className="w-3 h-3 text-white" />
                    <span className="text-xs text-white">Cloud</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Day {selectedPhotoData.dayNumber}</span>
                  <span className="text-sm text-muted-foreground">{selectedPhotoData.date}</span>
                </div>
                {selectedPhotoData.caption && (
                  <p className="text-sm text-muted-foreground">{selectedPhotoData.caption}</p>
                )}
                <Button
                  onClick={() => setDeleteConfirm(selectedPhotoData.id)}
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Photo
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The photo will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoto}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
