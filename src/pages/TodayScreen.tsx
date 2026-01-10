import { useState, useEffect } from 'react';
import { Camera, Plus, Check, Droplet, Sun, Hand, GlassWater, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useTattoos, useSettings, useCheckins, generateId } from '@/hooks/useStorage';
import { getDayNumber, getHealingPhase, getHealingProgress, DailyChecklist } from '@/types';
import { getDayContent, getAdjustedContent } from '@/data/healingTimeline';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CHECKLIST_ITEMS = [
  { key: 'washed', label: 'Washed gently', icon: Droplet },
  { key: 'moisturized', label: 'Applied thin layer', icon: Sparkles },
  { key: 'avoidedSun', label: 'Avoided sun', icon: Sun },
  { key: 'didNotScratch', label: "Didn't scratch", icon: Hand },
  { key: 'drankWater', label: 'Stayed hydrated', icon: GlassWater },
] as const;

export default function TodayScreen() {
  const navigate = useNavigate();
  const { tattoos, getTattoo } = useTattoos();
  const { settings } = useSettings();
  const { getCheckinForDay, addCheckin, updateCheckin } = useCheckins();

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');

  const tattoo = settings.selectedTattooId ? getTattoo(settings.selectedTattooId) : tattoos[0];

  if (!tattoo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Droplet className="w-16 h-16 text-primary mb-4" />
        <h2 className="text-xl font-bold mb-2">No Tattoo Added</h2>
        <p className="text-muted-foreground mb-6">Add your first tattoo to start tracking.</p>
        <Button onClick={() => navigate('/settings')} className="gradient-primary">
          Go to Settings
        </Button>
      </div>
    );
  }

  const dayNumber = getDayNumber(tattoo.tattooDate);
  const phase = getHealingPhase(dayNumber);
  const progress = getHealingProgress(dayNumber);
  const baseContent = getDayContent(dayNumber);
  const content = getAdjustedContent(baseContent, tattoo.sizeTier, tattoo.inkType);

  const todayDate = new Date().toISOString().split('T')[0];
  const existingCheckin = getCheckinForDay(tattoo.id, dayNumber);

  const [checklist, setChecklist] = useState<DailyChecklist>({
    washed: false,
    moisturized: false,
    avoidedSun: false,
    didNotScratch: false,
    drankWater: false,
    ...existingCheckin?.checklist,
  });

  useEffect(() => {
    if (existingCheckin) {
      setChecklist(existingCheckin.checklist);
      setNoteText(existingCheckin.userNotes || '');
    }
  }, [existingCheckin]);

  const handleChecklistChange = (key: keyof DailyChecklist, checked: boolean) => {
    const newChecklist = { ...checklist, [key]: checked };
    setChecklist(newChecklist);

    if (existingCheckin) {
      updateCheckin(existingCheckin.id, { checklist: newChecklist });
    } else {
      addCheckin({
        id: generateId(),
        tattooId: tattoo.id,
        dayNumber,
        date: todayDate,
        checklist: newChecklist,
      });
    }
  };

  const handleSaveNote = () => {
    if (existingCheckin) {
      updateCheckin(existingCheckin.id, { userNotes: noteText });
    } else {
      addCheckin({
        id: generateId(),
        tattooId: tattoo.id,
        dayNumber,
        date: todayDate,
        checklist,
        userNotes: noteText,
      });
    }
    setNoteDialogOpen(false);
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{tattoo.bodyLocation}</p>
            <h1 className="text-3xl font-bold text-foreground">Day {dayNumber}</h1>
          </div>
          <div className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium",
            phase.color === 'phase-initial' && "bg-phase-initial/20 text-phase-initial",
            phase.color === 'phase-peeling' && "bg-phase-peeling/20 text-phase-peeling",
            phase.color === 'phase-settling' && "bg-phase-settling/20 text-phase-settling",
            phase.color === 'phase-healed' && "bg-phase-healed/20 text-phase-healed",
          )}>
            {phase.name}
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Healing Progress</span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full gradient-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content cards */}
      <div className="px-6 space-y-4 pb-6">
        {/* What's Normal */}
        <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Check className="w-4 h-4 text-success" />
            </div>
            <h3 className="font-semibold text-foreground">What's Normal</h3>
          </div>
          <ul className="space-y-2">
            {content.whatsNormal.slice(0, 3).map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-success mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What To Do */}
        <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Droplet className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">What To Do</h3>
          </div>
          <ul className="space-y-2">
            {content.whatToDo.slice(0, 4).map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What To Avoid */}
        <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Hand className="w-4 h-4 text-destructive" />
            </div>
            <h3 className="font-semibold text-foreground">What To Avoid</h3>
          </div>
          <ul className="space-y-2">
            {content.whatToAvoid.slice(0, 4).map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-destructive mt-0.5">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Daily Checklist */}
        <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Today's Checklist</h3>
            <span className="text-sm text-muted-foreground">{completedCount}/{CHECKLIST_ITEMS.length}</span>
          </div>
          <div className="space-y-3">
            {CHECKLIST_ITEMS.map((item) => (
              <label
                key={item.key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                  checklist[item.key]
                    ? "bg-primary/5 border-primary/30"
                    : "bg-muted/30 border-transparent hover:border-border"
                )}
              >
                <Checkbox
                  checked={checklist[item.key]}
                  onCheckedChange={(checked) => handleChecklistChange(item.key, !!checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <item.icon className={cn(
                  "w-4 h-4",
                  checklist[item.key] ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-sm",
                  checklist[item.key] ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => navigate('/photos')}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-border"
          >
            <Camera className="w-4 h-4 mr-2" />
            Add Photo
          </Button>
          <Button
            onClick={() => setNoteDialogOpen(true)}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-border"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Add a Note</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="How is your tattoo feeling today?"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-[120px] bg-muted border-border"
          />
          <Button onClick={handleSaveNote} className="gradient-primary">
            Save Note
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
