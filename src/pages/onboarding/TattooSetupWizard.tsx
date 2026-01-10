import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Ruler, Palette, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTattoos, useSettings, generateId } from '@/hooks/useStorage';
import { BODY_LOCATIONS, SizeTier, InkType } from '@/types';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'date', title: 'When did you get tattooed?', icon: Calendar },
  { id: 'location', title: 'Where is your tattoo?', icon: MapPin },
  { id: 'size', title: 'How big is it?', icon: Ruler },
  { id: 'ink', title: 'Color or black & grey?', icon: Palette },
  { id: 'artist', title: 'Artist details (optional)', icon: User },
];

export default function TattooSetupWizard() {
  const navigate = useNavigate();
  const { addTattoo } = useTattoos();
  const { updateSettings } = useSettings();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    tattooDate: new Date().toISOString().split('T')[0],
    bodyLocation: '',
    sizeTier: '' as SizeTier | '',
    inkType: '' as InkType | '',
    artistName: '',
    shopName: '',
  });

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (step) {
      case 0: return !!formData.tattooDate;
      case 1: return !!formData.bodyLocation;
      case 2: return !!formData.sizeTier;
      case 3: return !!formData.inkType;
      case 4: return true; // Optional step
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Complete setup
      const tattooId = generateId();
      addTattoo({
        id: tattooId,
        createdAt: new Date().toISOString(),
        tattooDate: formData.tattooDate,
        bodyLocation: formData.bodyLocation,
        sizeTier: formData.sizeTier as SizeTier,
        inkType: formData.inkType as InkType,
        artistName: formData.artistName || undefined,
        shopName: formData.shopName || undefined,
      });
      updateSettings({ selectedTattooId: tattooId });
      navigate('/notifications');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={handleBack}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full gradient-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <currentStep.icon className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {currentStep.title}
          </h1>
        </div>

        {/* Step content */}
        <div className="animate-fade-in">
          {step === 0 && (
            <div className="space-y-4">
              <p className="text-muted-foreground mb-6">
                We'll track your healing journey from this date.
              </p>
              <Input
                type="date"
                value={formData.tattooDate}
                onChange={(e) => setFormData({ ...formData, tattooDate: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="h-14 text-lg bg-card border-border"
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <p className="text-muted-foreground mb-4">
                Different areas heal differently—this helps us give better advice.
              </p>
              <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto hide-scrollbar">
                {BODY_LOCATIONS.map((location) => (
                  <button
                    key={location}
                    onClick={() => setFormData({ ...formData, bodyLocation: location })}
                    className={cn(
                      "p-4 rounded-xl text-left transition-all border",
                      formData.bodyLocation === location
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-card border-border text-muted-foreground hover:border-primary/50"
                    )}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-muted-foreground mb-6">
                Larger tattoos may need extra care and attention.
              </p>
              {(['Small', 'Medium', 'Large'] as SizeTier[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFormData({ ...formData, sizeTier: size })}
                  className={cn(
                    "w-full p-5 rounded-xl text-left transition-all border",
                    formData.sizeTier === size
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-lg font-medium text-foreground">{size}</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {size === 'Small' && 'About the size of a coin to a palm'}
                    {size === 'Medium' && 'Palm-sized to about half a limb'}
                    {size === 'Large' && 'Half-sleeve, back piece, or larger'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-muted-foreground mb-6">
                Color tattoos may need extra sun protection to stay vibrant.
              </p>
              {([
                { value: 'BlackGrey', label: 'Black & Grey', desc: 'Shading and linework in black/grey tones' },
                { value: 'Color', label: 'Color', desc: 'Contains colored inks' },
              ] as const).map((ink) => (
                <button
                  key={ink.value}
                  onClick={() => setFormData({ ...formData, inkType: ink.value })}
                  className={cn(
                    "w-full p-5 rounded-xl text-left transition-all border",
                    formData.inkType === ink.value
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-lg font-medium text-foreground">{ink.label}</span>
                  <p className="text-sm text-muted-foreground mt-1">{ink.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <p className="text-muted-foreground mb-2">
                Save your artist's info for future reference or touch-ups.
              </p>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="artistName" className="text-muted-foreground">Artist Name</Label>
                  <Input
                    id="artistName"
                    placeholder="e.g., John Smith"
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    className="h-12 mt-2 bg-card border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="shopName" className="text-muted-foreground">Shop Name</Label>
                  <Input
                    id="shopName"
                    placeholder="e.g., Ink Masters Studio"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="h-12 mt-2 bg-card border-border"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8">
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <span>{step === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}</span>
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
