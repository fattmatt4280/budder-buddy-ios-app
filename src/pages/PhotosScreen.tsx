import { useState, useRef } from 'react';
import { Camera, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTattoos, useSettings, usePhotos, generateId } from '@/hooks/useStorage';
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
  const { tattoos, getTattoo } = useTattoos();
  const { settings } = useSettings();
  const { getPhotosForTattoo, addPhoto, deletePhoto, updatePhoto } = usePhotos();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tattoo = settings.selectedTattooId ? getTattoo(settings.selectedTattooId) : tattoos[0];

  if (!tattoo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No tattoo to display photos for.</p>
      </div>
    );
  }

  const currentDay = getDayNumber(tattoo.tattooDate);
  const photos = getPhotosForTattoo(tattoo.id);
  const selectedPhotoData = photos.find(p => p.id === selectedPhoto);

  // Group photos by day
  const photosByDay = photos.reduce((acc, photo) => {
    if (!acc[photo.dayNumber]) {
      acc[photo.dayNumber] = [];
    }
    acc[photo.dayNumber].push(photo);
    return acc;
  }, {} as Record<number, typeof photos>);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      addPhoto({
        id: generateId(),
        tattooId: tattoo.id,
        dayNumber: currentDay,
        date: new Date().toISOString().split('T')[0],
        imageData,
        caption: newCaption || undefined,
      });
      setIsAddingPhoto(false);
      setNewCaption('');
    };
    reader.readAsDataURL(file);
  };

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
