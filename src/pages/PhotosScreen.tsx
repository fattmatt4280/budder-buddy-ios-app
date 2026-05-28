import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Plus, Trash2, X, Image as ImageIcon, Cloud, HardDrive, LogIn, Check, Loader2, Archive, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import AddTattooDialog from '@/components/vault/AddTattooDialog';
import FirstPhotoPromptDialog from '@/components/vault/FirstPhotoPromptDialog';
import PhotoUpgradeModal from '@/components/premium/PhotoUpgradeModal';
import TimelapseTeaser from '@/components/premium/TimelapseTeaser';
import { useAppData } from '@/contexts/AppDataContext';
import { analytics } from '@/lib/analyticsService';

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

  // Dialog states for new flow
  const [addTattooDialogOpen, setAddTattooDialogOpen] = useState(false);
  const [firstPhotoPrompt, setFirstPhotoPrompt] = useState<{
    tattooId: string;
    bodyLocation: string;
    tattooDate: string;
    artistName?: string;
  } | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { isPro } = useAppData();

  const tattoo = settings.selectedTattooId ? getTattoo(settings.selectedTattooId) : tattoos[0];
  const currentDay = tattoo ? getDayNumber(tattoo.tattooDate) : 1;

  // Calculate stats
  const totalTattoos = tattoos.length;
  const healedTattoos = tattoos.filter(t => t.isHealed).length;
  const healingNow = totalTattoos - healedTattoos;

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

  // Handle tattoo added callback - show first photo prompt
  const handleTattooAdded = (tattooId: string, bodyLocation: string, tattooDate: string, artistName?: string) => {
    setFirstPhotoPrompt({ tattooId, bodyLocation, tattooDate, artistName });
  };

  const handleAddTattooClick = () => {
    // Require authentication
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save photos securely to the cloud.',
      });
      navigate('/auth');
      return;
    }
    
    // Open the full AddTattooDialog
    setAddTattooDialogOpen(true);
  };

  const handleQuickCapture = () => {
    // Require authentication to take photos
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save photos securely to the cloud.',
      });
      navigate('/auth');
      return;
    }

    // If no tattoo exists, show the AddTattooDialog first
    if (!tattoo) {
      setAddTattooDialogOpen(true);
      return;
    }
    
    // Navigate to ghost camera with existing tattoo + ghost image URL
    const ghostPhoto = getCloudPhotos(tattoo.id).find(p => !!p.imageUrl);
    navigate('/ghost-camera', {
      state: {
        tattooId: tattoo.id,
        ghostImageUrl: ghostPhoto?.imageUrl,
      }
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const tattooId = tattoo?.id || pendingTattooIdRef.current;
    if (!file || !tattooId) return;

    const tattooDate = tattoo?.tattooDate || new Date().toISOString().split('T')[0];
    const dayNumber = getDayNumber(tattooDate);

    setUploading(true);

    // Require authentication
    if (!isAuthenticated || !user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save photos.',
        variant: 'destructive',
      });
      setUploading(false);
      navigate('/auth');
      return;
    }

    // Upload to cloud storage
    const result = await uploadCloudPhoto(file, tattooId, dayNumber, newCaption || undefined);
    
    if (result.success) {
      analytics.track('photo_uploaded', { photoCount: photos.length + 1 });

      // Trigger upgrade modal on 3rd photo for free users
      if (!isPro && photos.length + 1 >= 3) {
        setShowUpgradeModal(true);
        analytics.track('upgrade_viewed', { trigger: 'photo_count' });
      }

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

  // Stats Overview Component
  const StatsOverview = () => (
    <div className="px-6 mb-6">
      <div className="grid grid-cols-3 gap-3">
        <Card variant="glass" className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{totalTattoos}</div>
            <div className="text-xs text-muted-foreground">Total Tattoos</div>
          </CardContent>
        </Card>
        <Card variant="glass" className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{healedTattoos}</div>
            <div className="text-xs text-muted-foreground">Fully Healed</div>
          </CardContent>
        </Card>
        <Card variant="glass" className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-500">{healingNow}</div>
            <div className="text-xs text-muted-foreground">Healing Now</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Ink Vault Button Component
  const InkVaultButton = () => (
    <div className="px-6 mb-4">
      <button
        onClick={() => navigate('/ink-vault')}
        className="w-full liquid-glass-card bg-gradient-to-r from-success/15 via-success/5 to-transparent rounded-2xl p-4 border border-success/20 text-left hover:border-success/40 transition-all duration-200 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center backdrop-blur-sm">
            <Archive className="w-6 h-6 text-success" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-foreground">Ink Vault</h2>
              <span className="text-xs liquid-glass-light text-success px-2 py-0.5 rounded-full font-medium">
                Archive
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your complete tattoo history & healing diaries
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-success group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    </div>
  );

  if (!tattoo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-2xl font-bold text-foreground mb-1">Photo Log</h1>
          <p className="text-muted-foreground text-sm">Track your healing progress</p>
        </div>
        
        {/* Stats Overview - always show */}
        <StatsOverview />

        {/* Ink Vault Button */}
        <InkVaultButton />
        
        <div className="px-6 mb-4">
          <Alert className="border-primary/30 bg-primary/5">
            <Cloud className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">
                {isAuthenticated ? 'Photos are saved securely to the cloud' : 'Sign in to save photos'}
              </span>
              {!isAuthenticated && (
                <Button size="sm" variant="outline" onClick={() => navigate('/auth')} className="ml-2">
                  <LogIn className="w-3 h-3 mr-1" />
                  Sign In
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Camera className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-semibold text-foreground mb-2">Add Your Tattoo</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            {isAuthenticated 
              ? 'Add your tattoo details to start tracking your healing journey.'
              : 'Sign in to start tracking your tattoo healing journey.'}
          </p>
          {isAuthenticated ? (
            <Button
              onClick={handleAddTattooClick}
              className="liquid-glass-primary text-white rounded-xl"
              disabled={uploading}
            >
              <Plus className="w-4 h-4 mr-2" />
              {uploading ? 'Saving...' : 'Add Your Tattoo'}
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              className="liquid-glass-primary text-white rounded-xl"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In to Start
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* AddTattooDialog */}
        <AddTattooDialog
          open={addTattooDialogOpen}
          onOpenChange={setAddTattooDialogOpen}
          onTattooAdded={handleTattooAdded}
        />

        {/* FirstPhotoPromptDialog */}
        <FirstPhotoPromptDialog
          open={firstPhotoPrompt !== null}
          onOpenChange={(open) => !open && setFirstPhotoPrompt(null)}
          tattooId={firstPhotoPrompt?.tattooId}
          tattooLocation={firstPhotoPrompt?.bodyLocation}
          tattooDate={firstPhotoPrompt?.tattooDate}
          artistName={firstPhotoPrompt?.artistName}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
            onClick={handleQuickCapture}
            size="sm"
            className="liquid-glass-primary text-white rounded-xl"
            disabled={uploading}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Ink Vault Button */}
      <InkVaultButton />

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
          <h2 className="font-semibold text-foreground mb-2">No Photos Yet</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Track your healing progress by taking daily photos of your tattoo.
          </p>
          <Button
            onClick={() => setIsAddingPhoto(true)}
            className="liquid-glass-primary text-white rounded-xl"
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
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  Day {day}
                </h2>
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
          {/* Timelapse teaser / export */}
          <div className="px-6">
            <TimelapseTeaser
              photoCount={photos.length}
              photos={photos.map(p => ({ imageUrl: p.imageUrl, dayNumber: p.dayNumber }))}
              tattooName={tattoo?.name || tattoo?.bodyLocation || 'tattoo'}
            />
          </div>
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
        <DialogContent className="liquid-glass-card border-0">
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
                onClick={() => {
                  setIsAddingPhoto(false);
                  const ghostPhoto = tattoo ? getCloudPhotos(tattoo.id).find(p => !!p.imageUrl) : undefined;
                  navigate('/ghost-camera', {
                    state: { tattooId: tattoo?.id, ghostImageUrl: ghostPhoto?.imageUrl }
                  });
                }}
                className="flex-1 liquid-glass-primary text-white"
                disabled={uploading}
              >
                <Camera className="w-4 h-4 mr-2" />
                Ghost Camera
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
            <p className="text-xs text-muted-foreground text-center">
              Ghost Camera overlays your previous photo for alignment
            </p>
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
        <DialogContent className="liquid-glass-card border-0 max-w-lg p-0 overflow-hidden">
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
        <AlertDialogContent className="liquid-glass-card border-0">
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

      {/* AddTattooDialog */}
      <AddTattooDialog
        open={addTattooDialogOpen}
        onOpenChange={setAddTattooDialogOpen}
        onTattooAdded={handleTattooAdded}
      />

      {/* FirstPhotoPromptDialog */}
      <FirstPhotoPromptDialog
        open={firstPhotoPrompt !== null}
        onOpenChange={(open) => !open && setFirstPhotoPrompt(null)}
        tattooId={firstPhotoPrompt?.tattooId}
        tattooLocation={firstPhotoPrompt?.bodyLocation}
        tattooDate={firstPhotoPrompt?.tattooDate}
        artistName={firstPhotoPrompt?.artistName}
      />

      {/* Photo Upgrade Modal */}
      <PhotoUpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
      />
    </div>
  );
}
