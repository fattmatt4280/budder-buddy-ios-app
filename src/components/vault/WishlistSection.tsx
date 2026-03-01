import { useState, useRef } from 'react';
import { Plus, Sparkles, MapPin, User, Store, DollarSign, FileText, Trash2, ChevronDown, ChevronRight, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWishlist, type WishlistItem } from '@/hooks/useWishlist';
import { useAppData } from '@/contexts/AppDataContext';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { Loader2 } from 'lucide-react';
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

export default function WishlistSection() {
  const { userId, isPro } = useAppData();
  const { items, isLoading, addItem, deleteItem, addImages, removeImage } = useWishlist(userId);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    bodyLocation: '',
    style: '',
    artistName: '',
    shopName: '',
    budget: '',
    notes: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setForm({ title: '', bodyLocation: '', style: '', artistName: '', shopName: '', budget: '', notes: '' });
    setImageFiles([]);
    setImagePreviews([]);
    setShowForm(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        setImagePreviews((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });

    // Reset input so user can select same file again
    if (e.target) e.target.value = '';
  };

  const removePreviewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await addItem(
        {
          title: form.title.trim(),
          bodyLocation: form.bodyLocation.trim() || undefined,
          style: form.style.trim() || undefined,
          artistName: form.artistName.trim() || undefined,
          shopName: form.shopName.trim() || undefined,
          budget: form.budget ? Number(form.budget) : undefined,
          notes: form.notes.trim() || undefined,
        },
        imageFiles.length > 0 ? imageFiles : undefined
      );
      resetForm();
    } catch {
      // error handled in hook
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    await deleteItem(deleteConfirm);
    setDeleteConfirm(null);
  };

  const handleAddMoreImages = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await addImages(itemId, files);
    if (e.target) e.target.value = '';
  };

  return (
    <PremiumGate featureName="Tattoo Wishlist" compact active={!isPro}>
      <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground">NEXT TATTOO WISHLIST</h2>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="ghost"
            size="sm"
            className="gap-1 text-primary"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="liquid-glass-card rounded-xl p-4 mb-3 space-y-3 animate-fade-in">
            {/* Image Upload - Multi */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <ImagePlus className="w-3 h-3" /> Reference Images
              </Label>
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-border">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePreviewImage(idx)}
                        className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm rounded-full p-0.5"
                      >
                        <X className="w-3 h-3 text-foreground" />
                      </button>
                    </div>
                  ))}
                  {/* Add more button inline */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors bg-muted/30"
                  >
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">More</span>
                  </button>
                </div>
              )}
              {imagePreviews.length === 0 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1.5 transition-colors bg-muted/30"
                >
                  <ImagePlus className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Tap to add reference photos</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">What do you want?</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Japanese sleeve, Geometric wolf..."
                className="bg-muted border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Placement
                </Label>
                <Input
                  value={form.bodyLocation}
                  onChange={(e) => setForm({ ...form, bodyLocation: e.target.value })}
                  placeholder="Upper arm"
                  className="bg-muted border-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Style</Label>
                <Input
                  value={form.style}
                  onChange={(e) => setForm({ ...form, style: e.target.value })}
                  placeholder="Traditional, Fine line..."
                  className="bg-muted border-border text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> Artist
                </Label>
                <Input
                  value={form.artistName}
                  onChange={(e) => setForm({ ...form, artistName: e.target.value })}
                  placeholder="Artist name"
                  className="bg-muted border-border text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Budget
                </Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  placeholder="500"
                  className="bg-muted border-border text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3" /> Notes
              </Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Ideas, reference images, inspiration..."
                className="bg-muted border-border text-sm"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={resetForm} variant="outline" size="sm" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleAdd}
                disabled={!form.title.trim() || saving}
                size="sm"
                className="flex-1"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Idea'}
              </Button>
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 && !showForm ? (
          <div className="liquid-glass-card rounded-xl p-6 text-center">
            <Sparkles className="w-8 h-8 text-primary/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No ideas yet — tap <span className="text-primary font-medium">+ Add</span> to start planning your next tattoo
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onDelete={() => setDeleteConfirm(item.id)}
                onAddImages={(files) => addImages(item.id, files)}
                onRemoveImage={removeImage}
              />
            ))}
          </div>
        )}

        <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove from wishlist?</AlertDialogTitle>
              <AlertDialogDescription>This idea will be permanently deleted.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </PremiumGate>
  );
}

function WishlistCard({
  item,
  isExpanded,
  onToggle,
  onDelete,
  onAddImages,
  onRemoveImage,
}: {
  item: WishlistItem;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddImages: (files: File[]) => Promise<void>;
  onRemoveImage: (imageId: string) => Promise<void>;
}) {
  const addInputRef = useRef<HTMLInputElement>(null);
  const firstImage = item.images[0];
  const imageCount = item.images.length;

  return (
    <div className="liquid-glass-card rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full p-3 text-left flex items-center gap-3">
        {/* Thumbnail with count badge */}
        {firstImage?.url ? (
          <div className="relative shrink-0">
            <img
              src={firstImage.url}
              alt={item.title}
              className="w-9 h-9 rounded-lg object-cover"
            />
            {imageCount > 1 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {imageCount}
              </span>
            )}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground text-sm truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            {[item.bodyLocation, item.style, item.budget ? `$${item.budget}` : null]
              .filter(Boolean)
              .join(' • ') || 'Tap to see details'}
          </p>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border p-3 space-y-2 animate-fade-in">
          {/* Image gallery */}
          {item.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {item.images.map((img) => (
                <div key={img.id} className="relative shrink-0 w-28 h-28 rounded-lg overflow-hidden border border-border group">
                  <img
                    src={img.url}
                    alt={`Reference for ${item.title}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveImage(img.id); }}
                    className="absolute top-1 right-1 bg-background/80 backdrop-blur-sm rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-foreground" />
                  </button>
                </div>
              ))}
              {/* Add more photos button */}
              <button
                onClick={(e) => { e.stopPropagation(); addInputRef.current?.click(); }}
                className="shrink-0 w-28 h-28 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors bg-muted/30"
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add more</span>
              </button>
              <input
                ref={addInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) await onAddImages(files);
                  if (e.target) e.target.value = '';
                }}
                className="hidden"
              />
            </div>
          )}

          {/* No images yet — offer to add */}
          {item.images.length === 0 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); addInputRef.current?.click(); }}
                className="w-full h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors bg-muted/30"
              >
                <ImagePlus className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add reference photos</span>
              </button>
              <input
                ref={addInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length) await onAddImages(files);
                  if (e.target) e.target.value = '';
                }}
                className="hidden"
              />
            </>
          )}

          {item.bodyLocation && (
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Placement:</span>
              <span className="text-foreground">{item.bodyLocation}</span>
            </div>
          )}

          {item.artistName && (
            <div className="flex items-center gap-2 text-xs">
              <User className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Artist:</span>
              <span className="text-foreground">{item.artistName}</span>
            </div>
          )}
          {item.shopName && (
            <div className="flex items-center gap-2 text-xs">
              <Store className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Shop:</span>
              <span className="text-foreground">{item.shopName}</span>
            </div>
          )}
          {item.notes && (
            <p className="text-xs text-muted-foreground italic pt-1 border-t border-border">
              "{item.notes}"
            </p>
          )}
          <div className="pt-2 flex justify-end">
            <Button
              onClick={onDelete}
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 gap-1 text-xs"
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
