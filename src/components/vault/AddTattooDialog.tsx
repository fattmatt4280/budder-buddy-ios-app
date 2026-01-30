import { useState } from 'react';
import { Calendar, MapPin, Ruler, Palette, User, Store, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTattoos, useSettings, generateId } from '@/hooks/useStorage';
import { BODY_LOCATIONS, SizeTier, InkType } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AddTattooDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTattooAdded?: (tattooId: string, bodyLocation: string, tattooDate: string) => void;
}

export default function AddTattooDialog({ open, onOpenChange, onTattooAdded }: AddTattooDialogProps) {
  const { addTattoo } = useTattoos();
  const { updateSettings } = useSettings();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tattooDate: new Date().toISOString().split('T')[0],
    bodyLocation: '',
    sizeTier: 'Medium' as SizeTier,
    inkType: 'BlackGrey' as InkType,
    artistName: '',
    shopName: '',
    notes: '',
  });

  const handleSubmit = () => {
    if (!formData.bodyLocation) {
      toast({
        title: 'Missing location',
        description: 'Please select where your tattoo is located.',
        variant: 'destructive',
      });
      return;
    }

    const newTattoo = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...formData,
    };

    addTattoo(newTattoo);
    updateSettings({ selectedTattooId: newTattoo.id });

    toast({
      title: 'Tattoo added!',
      description: `${formData.bodyLocation} tattoo added to your vault.`,
    });

    // Close dialog first
    onOpenChange(false);

    // Trigger callback with new tattoo info
    onTattooAdded?.(newTattoo.id, formData.bodyLocation, formData.tattooDate);

    // Reset form
    setFormData({
      tattooDate: new Date().toISOString().split('T')[0],
      bodyLocation: '',
      sizeTier: 'Medium',
      inkType: 'BlackGrey',
      artistName: '',
      shopName: '',
      notes: '',
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog Content */}
      <div className="relative liquid-glass-card border-0 w-full max-w-md max-h-[80vh] overflow-y-auto rounded-xl p-6 animate-fade-in">
        {/* Close button */}
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-foreground mb-4">Add New Tattoo</h2>

        <div className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              When did you get it?
            </Label>
            <Input
              type="date"
              value={formData.tattooDate}
              onChange={(e) => setFormData({ ...formData, tattooDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Body Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Body location *
            </Label>
            <Select
              value={formData.bodyLocation}
              onValueChange={(value) => setFormData({ ...formData, bodyLocation: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {BODY_LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              Size
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(['Small', 'Medium', 'Large'] as SizeTier[]).map((size) => (
                <Button
                  key={size}
                  type="button"
                  variant={formData.sizeTier === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormData({ ...formData, sizeTier: size })}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Ink Type */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              Ink type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.inkType === 'BlackGrey' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, inkType: 'BlackGrey' })}
              >
                Black & Grey
              </Button>
              <Button
                type="button"
                variant={formData.inkType === 'Color' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFormData({ ...formData, inkType: 'Color' })}
              >
                Color
              </Button>
            </div>
          </div>

          {/* Artist Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Artist name (optional)
            </Label>
            <Input
              value={formData.artistName}
              onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
              placeholder="Who did your tattoo?"
            />
          </div>

          {/* Shop Name */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              Shop name (optional)
            </Label>
            <Input
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              placeholder="Where did you get it?"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Notes (optional)
            </Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any details you want to remember..."
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 liquid-glass-primary text-white">
            Add to Vault
          </Button>
        </div>
      </div>
    </div>
  );
}
