import { useState } from 'react';
import { Calendar, MapPin, Ruler, Palette, User, Store, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
}

export default function AddTattooDialog({ open, onOpenChange }: AddTattooDialogProps) {
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

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="liquid-glass-card border-0 max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Tattoo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 liquid-glass-primary text-white">
            Add to Vault
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
