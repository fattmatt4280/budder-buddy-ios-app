import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  User, 
  MapPin, 
  Palette, 
  Ruler,
  Camera,
  CheckCircle2,
  Flame,
  BarChart3,
  Edit2,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tattoo, getDayNumber, getHealingPhase, getHealingProgress } from '@/types';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTattoos, useSettings } from '@/hooks/useStorage';
import EditTattooDialog from './EditTattooDialog';
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

interface HealingSummary {
  completedDays: number;
  totalPhotos: number;
  streak: number;
  avgCompletion: number;
}

interface TattooVaultCardProps {
  tattoo: Tattoo;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
  healingSummary: HealingSummary;
  isActive: boolean;
}

export default function TattooVaultCard({
  tattoo,
  isSelected,
  isExpanded,
  onToggleExpand,
  onSelect,
  healingSummary,
  isActive,
}: TattooVaultCardProps) {
  const { deleteTattoo } = useTattoos();
  const { settings, updateSettings } = useSettings();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const dayNumber = getDayNumber(tattoo.tattooDate);
  const phase = getHealingPhase(dayNumber);
  const progress = getHealingProgress(dayNumber);
  
  const formattedDate = format(new Date(tattoo.tattooDate), 'MMM d, yyyy');
  const daysAgo = dayNumber === 0 ? 'Today' : dayNumber === 1 ? 'Yesterday' : `${dayNumber} days ago`;

  const handleDelete = () => {
    deleteTattoo(tattoo.id);
    if (settings.selectedTattooId === tattoo.id) {
      updateSettings({ selectedTattooId: null });
    }
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <div 
        className={cn(
          "liquid-glass-card rounded-xl overflow-hidden transition-all",
          isSelected && "shadow-lg shadow-primary/20",
          isExpanded && "shadow-lg"
        )}
      >
        {/* Main Card Header */}
        <button
          onClick={onToggleExpand}
          className="w-full p-4 text-left"
        >
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
              isActive ? "bg-warning/10" : "bg-success/10"
            )}>
              <Palette className={cn(
                "w-6 h-6",
                isActive ? "text-warning" : "text-success"
              )} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {tattoo.bodyLocation}
                </h3>
                {isSelected && (
                  <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">
                    Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formattedDate}</span>
                <span>•</span>
                <span className={cn(
                  "font-medium",
                  isActive ? "text-warning" : "text-success"
                )}>
                  {isActive ? `Day ${dayNumber}` : 'Healed'}
                </span>
              </div>
            </div>

            {/* Expand Icon */}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          {/* Progress bar for active tattoos */}
          {isActive && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{phase.name}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="border-t border-border animate-fade-in">
            {/* Tattoo Details */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Ruler className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Size:</span>
                  <span className="text-foreground font-medium">{tattoo.sizeTier}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Ink:</span>
                  <span className="text-foreground font-medium">
                    {tattoo.inkType === 'BlackGrey' ? 'B&G' : 'Color'}
                  </span>
                </div>
                {tattoo.artistName && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Artist:</span>
                    <span className="text-foreground font-medium">{tattoo.artistName}</span>
                  </div>
                )}
                {tattoo.shopName && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Shop:</span>
                    <span className="text-foreground font-medium">{tattoo.shopName}</span>
                  </div>
                )}
              </div>

              {tattoo.notes && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">"{tattoo.notes}"</p>
                </div>
              )}
            </div>

            {/* Healing Diary Stats */}
            <div className="px-4 pb-4">
              <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Healing Diary
              </h4>
              <div className="grid grid-cols-4 gap-2">
                <div className="liquid-glass-light rounded-lg p-2 text-center">
                  <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-success" />
                  <p className="text-sm font-semibold text-foreground">{healingSummary.completedDays}</p>
                  <p className="text-[10px] text-muted-foreground">Check-ins</p>
                </div>
                <div className="liquid-glass-light rounded-lg p-2 text-center">
                  <Camera className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <p className="text-sm font-semibold text-foreground">{healingSummary.totalPhotos}</p>
                  <p className="text-[10px] text-muted-foreground">Photos</p>
                </div>
                <div className="liquid-glass-light rounded-lg p-2 text-center">
                  <Flame className="w-4 h-4 mx-auto mb-1 text-warning" />
                  <p className="text-sm font-semibold text-foreground">{healingSummary.streak}</p>
                  <p className="text-[10px] text-muted-foreground">Best Streak</p>
                </div>
                <div className="liquid-glass-light rounded-lg p-2 text-center">
                  <BarChart3 className="w-4 h-4 mx-auto mb-1 text-info" />
                  <p className="text-sm font-semibold text-foreground">{healingSummary.avgCompletion}%</p>
                  <p className="text-[10px] text-muted-foreground">Avg Care</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              {!isSelected && (
                <Button 
                  onClick={onSelect}
                  className="flex-1 liquid-glass-primary text-white"
                  size="sm"
                >
                  Set as Active
                </Button>
              )}
              <Button
                onClick={() => setEditDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </Button>
              <Button
                onClick={() => setDeleteConfirmOpen(true)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <EditTattooDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tattoo={tattoo}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this tattoo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{tattoo.bodyLocation}" from your vault, including all associated photos and check-ins. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
