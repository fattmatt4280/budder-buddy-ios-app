import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTattoos, useSettings, usePhotos, generateId } from '@/hooks/useStorage';
import { useToast } from '@/hooks/use-toast';
import { getDayNumber } from '@/types';
import { cn } from '@/lib/utils';
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

export default function PhotosScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tattoos, getTattoo, addTattoo } = useTattoos();
  const { settings, updateSettings } = useSettings();
  const { getPhotosForTattoo, addPhoto, deletePhoto, updatePhoto } = usePhotos();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingTattooIdRef = useRef<string | null>(null);

  const tattoo = settings.selectedTattooId ? getTattoo(settings.selectedTattooId) : tattoos[0];

  const currentDay = tattoo ? getDayNumber(tattoo.tattooDate) : 1;
  const photos = tattoo ? getPhotosForTattoo(tattoo.id) : [];
  const selectedPhotoData = photos.find((p) => p.id === selectedPhoto);

  // Group photos by day
  const photosByDay = photos.reduce((acc, photo) => {
    if (!acc[photo.dayNumber]) {
      acc[photo.dayNumber] = [];
    }
    acc[photo.dayNumber].push(photo);
    return acc;
  }, {} as Record<number, typeof photos>);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const tattooId = tattoo?.id || pendingTattooIdRef.current;
    if (!file || !tattooId) return;

    // Compute day number - use existing tattoo date or today for new quick tattoos
    const tattooDate = tattoo?.tattooDate || new Date().toISOString().split('T')[0];
    const dayNumber = getDayNumber(tattooDate);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalDataUrl = e.target?.result as string;

      // Downscale to reduce local storage usage (prevents silent failures on some devices)
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

          // JPEG is much smaller than PNG for photos
          return canvas.toDataURL('image/jpeg', 0.82);
        } catch {
          return originalDataUrl;
        }
      };

      const imageData = await toStoredDataUrl();
      const newPhotoId = generateId();

      addPhoto({
        id: newPhotoId,
        tattooId,
        dayNumber,
        date: new Date().toISOString().split('T')[0],
        imageData,
        caption: newCaption || undefined,
      });

      // Verify it actually persisted (localStorage can fail silently when full)
      try {
        const raw = localStorage.getItem('budder_photos');
        const parsed = raw ? (JSON.parse(raw) as Array<{ id: string }>) : [];
        const found = parsed.some((p) => p.id === newPhotoId);
        if (!found) {
          toast({
            title: 'Photo not saved',
            description:
              'Your device storage is full for photos. Try deleting older photos or use smaller images.',
            variant: 'destructive',
          });
        }
      } catch {
        // ignore
      }

      setIsAddingPhoto(false);
      setNewCaption('');
      pendingTattooIdRef.current = null;
      // Navigate to Today screen after capture
      navigate('/');
    };
    reader.readAsDataURL(file);
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  if (!tattoo) {
    return (
      <div className="min-h-screen bg-background safe-area-top">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">Photo Log</h1>
          <p className="text-muted-foreground text-sm">Track your healing progress</p>
        </div>
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
          >
            <Camera className="w-4 h-4 mr-2" />
            Add Your Tattoo
          </Button>
          {/* Hidden file input for quick capture */}
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

  const handleDeletePhoto = () => {
    if (deleteConfirm) {
      deletePhoto(deleteConfirm);
      setDeleteConfirm(null);
      setSelectedPhoto(null);
    }
  };

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
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

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
                      className="aspect-square rounded-xl overflow-hidden bg-muted hover:ring-2 hover:ring-primary/50 transition-all"
                    >
                      <img
                        src={photo.imageData}
                        alt={`Day ${photo.dayNumber}`}
                        className="w-full h-full object-cover"
                      />
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
              >
                <Camera className="w-4 h-4 mr-2" />
                Take Photo
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
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Gallery
              </Button>
            </div>
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
                  src={selectedPhotoData.imageData}
                  alt={`Day ${selectedPhotoData.dayNumber}`}
                  className="w-full max-h-[60vh] object-contain bg-black"
                />
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
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
