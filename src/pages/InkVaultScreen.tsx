import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Plus, ChevronRight, Calendar, User, MapPin, Palette, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTattoos, useSettings, useCheckins, usePhotos } from '@/hooks/useStorage';
import { useCloudPhotos } from '@/hooks/useCloudPhotos';
import { getDayNumber, getHealingPhase, HEALING_PHASES } from '@/types';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/mascot.png';
import TattooVaultCard from '@/components/vault/TattooVaultCard';
import AddTattooDialog from '@/components/vault/AddTattooDialog';
import FirstPhotoPromptDialog from '@/components/vault/FirstPhotoPromptDialog';
import { PremiumGate } from '@/components/premium/PremiumGate';
import { useAppData } from '@/contexts/AppDataContext';
import { MilestoneBanner } from '@/components/vault/MilestoneBanner';
import WishlistSection from '@/components/vault/WishlistSection';
import { getUpcomingMilestones } from '@/lib/milestoneService';

export default function InkVaultScreen() {
  const navigate = useNavigate();
  const { tattoos } = useTattoos();
  const { settings, updateSettings } = useSettings();
  const { checkins } = useCheckins();
  const { photos: localPhotos } = usePhotos();
  const { photos: cloudPhotos } = useCloudPhotos();
  const { isPro } = useAppData();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [expandedTattooId, setExpandedTattooId] = useState<string | null>(null);
  const [firstPhotoPrompt, setFirstPhotoPrompt] = useState<{
    tattooId: string;
    bodyLocation: string;
    tattooDate: string;
  } | null>(null);

  const handleTattooAdded = (tattooId: string, bodyLocation: string, tattooDate: string) => {
    setFirstPhotoPrompt({ tattooId, bodyLocation, tattooDate });
  };

  // Combine and sort tattoos - newest first
  const sortedTattoos = [...tattoos].sort((a, b) => 
    new Date(b.tattooDate).getTime() - new Date(a.tattooDate).getTime()
  );

  // Separate into active (healing) and archived (healed) tattoos
  // A tattoo is "active" if NOT manually marked healed AND less than 30 days
  const activeTattoos = sortedTattoos.filter(t => 
    !t.isHealed && getDayNumber(t.tattooDate) <= 30
  );
  const archivedTattoos = sortedTattoos.filter(t => 
    t.isHealed || getDayNumber(t.tattooDate) > 30
  );

  // Get healing summary for a tattoo
  const getHealingSummary = (tattooId: string) => {
    const tattooCheckins = checkins.filter(c => c.tattooId === tattooId);
    const tattooPhotos = [
      ...localPhotos.filter(p => p.tattooId === tattooId),
      ...cloudPhotos.filter(p => p.tattooId === tattooId)
    ];

    const completedDays = tattooCheckins.length;
    const totalPhotos = tattooPhotos.length;
    
    // Calculate streak
    const sortedCheckins = [...tattooCheckins].sort((a, b) => b.dayNumber - a.dayNumber);
    let streak = 0;
    for (let i = 0; i < sortedCheckins.length; i++) {
      if (i === 0 || sortedCheckins[i].dayNumber === sortedCheckins[i - 1].dayNumber - 1) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate average checklist completion
    const avgCompletion = tattooCheckins.length > 0
      ? tattooCheckins.reduce((acc, c) => {
          const items = Object.values(c.checklist).filter(Boolean).length;
          return acc + (items / 5) * 100;
        }, 0) / tattooCheckins.length
      : 0;

    return {
      completedDays,
      totalPhotos,
      streak,
      avgCompletion: Math.round(avgCompletion),
    };
  };

  const handleSelectTattoo = (tattooId: string) => {
    updateSettings({ selectedTattooId: tattooId });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <img 
              src={mascotImage} 
              alt="Budder Buddy" 
              className="w-12 h-12 rounded-xl shadow-md"
            />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Ink Vault</h1>
              <p className="text-muted-foreground text-sm">
                Your tattoo healing history
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              if (!isPro && tattoos.length >= 1) {
                // Show upgrade prompt via PremiumGate in the dialog
                setAddDialogOpen(true);
              } else {
                setAddDialogOpen(true);
              }
            }}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-6">
        {/* Stats Overview */}
        {tattoos.length > 0 && (
          <div className="grid grid-cols-3 gap-3 animate-fade-in">
            <div className="liquid-glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary">{tattoos.length}</p>
              <p className="text-xs text-muted-foreground">Total Tattoos</p>
            </div>
            <div className="liquid-glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-success">{archivedTattoos.length}</p>
              <p className="text-xs text-muted-foreground">Fully Healed</p>
            </div>
            <div className="liquid-glass-card rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-warning">{activeTattoos.length}</p>
              <p className="text-xs text-muted-foreground">Healing Now</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tattoos.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Archive className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start Your Ink Collection
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
              Add your first tattoo to begin tracking your healing journey and build your permanent archive.
            </p>
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Tattoo
            </Button>
          </div>
        )}

        {/* Active Tattoos (Currently Healing) */}
        {activeTattoos.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              <h2 className="text-sm font-medium text-muted-foreground">CURRENTLY HEALING</h2>
            </div>
            <div className="space-y-3">
              {activeTattoos.map((tattoo) => (
                <TattooVaultCard
                  key={tattoo.id}
                  tattoo={tattoo}
                  isSelected={tattoo.id === settings.selectedTattooId}
                  isExpanded={expandedTattooId === tattoo.id}
                  onToggleExpand={() => setExpandedTattooId(
                    expandedTattooId === tattoo.id ? null : tattoo.id
                  )}
                  onSelect={() => handleSelectTattoo(tattoo.id)}
                  healingSummary={getHealingSummary(tattoo.id)}
                  isActive
                />
              ))}
            </div>
          </section>
        )}

        {/* Archived Tattoos (Fully Healed) */}
        {archivedTattoos.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-success" />
              <h2 className="text-sm font-medium text-muted-foreground">HEALED ARCHIVE</h2>
            </div>
            <div className="space-y-3">
              {archivedTattoos.map((tattoo) => (
                <TattooVaultCard
                  key={tattoo.id}
                  tattoo={tattoo}
                  isSelected={tattoo.id === settings.selectedTattooId}
                  isExpanded={expandedTattooId === tattoo.id}
                  onToggleExpand={() => setExpandedTattooId(
                    expandedTattooId === tattoo.id ? null : tattoo.id
                  )}
                  onSelect={() => handleSelectTattoo(tattoo.id)}
                  healingSummary={getHealingSummary(tattoo.id)}
                  isActive={false}
                />
              ))}
            </div>
          </section>
        )}

        {/* Milestone Banners for healed tattoos */}
        {isPro && archivedTattoos.map((tattoo) => {
          const milestones = getUpcomingMilestones(tattoo);
          if (milestones.length === 0) return null;
          return <MilestoneBanner key={`milestone-${tattoo.id}`} tattoo={tattoo} />;
        })}

        {/* Next Tattoo Wishlist (Pro) */}
        <WishlistSection />
      </div>

      {/* Add Tattoo Dialog - gated for 2nd+ tattoo */}
      <AddTattooDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        onTattooAdded={handleTattooAdded}
        premiumGated={!isPro && tattoos.length >= 1}
      />

      {/* First Photo Prompt Dialog */}
      <FirstPhotoPromptDialog
        open={firstPhotoPrompt !== null}
        onOpenChange={(open) => !open && setFirstPhotoPrompt(null)}
        tattooId={firstPhotoPrompt?.tattooId}
        tattooLocation={firstPhotoPrompt?.bodyLocation}
        tattooDate={firstPhotoPrompt?.tattooDate}
      />
    </div>
  );
}
