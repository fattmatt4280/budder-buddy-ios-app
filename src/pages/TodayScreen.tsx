import { useState, useEffect, useRef, useMemo } from 'react';
import { Camera, Plus, Check, Droplet, Sun, Hand, GlassWater, Sparkles, Bell, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useTattoos, useSettings, useCheckins, usePhotos, generateId } from '@/hooks/useStorage';
import { getDayNumber, getHealingPhase, getHealingProgress, DailyChecklist, HEALING_PHASES } from '@/types';
import { getDayContent, getAdjustedContent } from '@/data/healingTimeline';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import mascotImage from '@/assets/mascot.png';
import StartHereCard from '@/components/reminders/StartHereCard';
import EnableNotificationsBanner from '@/components/reminders/EnableNotificationsBanner';
import { generateReminderTimes, formatTimeForDisplay } from '@/lib/reminderScheduler';
import SafeToSubmergeCard from '@/components/environment/SafeToSubmergeCard';
import SunGuardCard from '@/components/environment/SunGuardCard';
import { environmentService } from '@/lib/environmentService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DAILY_TIPS = [
  "Drink plenty of water to keep your skin hydrated from within.",
  "Avoid tight clothing that rubs against your new tattoo.",
  "Pat dry after washing – never rub your healing tattoo.",
  "Use fragrance-free moisturizer to avoid irritation.",
  "Keep your tattoo out of direct sunlight for at least 2 weeks.",
  "Don't submerge your tattoo in water (pools, baths) while healing.",
  "Clean hands before touching your tattoo to prevent infection.",
  "Light peeling is normal – resist the urge to pick at it!",
  "Apply a very thin layer of moisturizer – less is more.",
  "Wear loose, breathable fabrics over your healing tattoo.",
];

const CHECKLIST_ITEMS = [
  { key: 'washed', label: 'Washed gently', icon: Droplet },
  { key: 'moisturized', label: 'Applied thin layer', icon: Sparkles },
  { key: 'avoidedSun', label: 'Avoided sun', icon: Sun },
  { key: 'didNotScratch', label: "Didn't scratch", icon: Hand },
  { key: 'drankWater', label: 'Stayed hydrated', icon: GlassWater },
] as const;

// Get a short phase description
function getPhaseOneLiner(phaseName: string): string {
  switch (phaseName) {
    case 'Fresh':
      return 'Your tattoo is fresh and needs gentle care. Keep it clean and moisturized.';
    case 'Early Healing':
      return 'The initial healing has begun. You may see some redness and slight swelling.';
    case 'Peeling':
      return 'Peeling is normal! Don\'t pick at it. Let the skin shed naturally.';
    case 'Settling':
      return 'Almost there! The tattoo is settling into your skin beautifully.';
    case 'Healed':
      return 'Your tattoo has healed! Keep moisturizing and protecting from sun.';
    default:
      return 'Keep up the great aftercare routine!';
  }
}

export default function TodayScreen() {
  const navigate = useNavigate();
  const { tattoos, getTattoo } = useTattoos();
  const { settings, updateSettings } = useSettings();
  const { getCheckinForDay, addCheckin, updateCheckin } = useCheckins();
  const { getPhotosForTattoo } = usePhotos();
  
  const checklistRef = useRef<HTMLDivElement>(null);
  const whatsNormalRef = useRef<HTMLDivElement>(null);

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showStartHereHighlight, setShowStartHereHighlight] = useState(false);

  const tattoo = settings.selectedTattooId ? getTattoo(settings.selectedTattooId) : tattoos[0];

  // Generate scheduled reminders based on settings
  const scheduledReminders = useMemo(() => {
    if (!settings.notificationsEnabled) return { times: [], awakeWindowMinutes: 0 };
    return generateReminderTimes(
      settings.wakeTime,
      settings.bedTime,
      settings.notifSchedule.frequencyPreset,
      settings.reminderTypesEnabled,
      settings.quietHoursEnabled
    );
  }, [settings]);

  // Get a random daily tip (stable for the day)
  const dailyTip = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    return DAILY_TIPS[seed % DAILY_TIPS.length];
  }, []);

  // Check if we just saved reminders
  useEffect(() => {
    if (settings.remindersJustSaved) {
      setShowStartHereHighlight(true);
      // Clear the flag after showing
      const timer = setTimeout(() => {
        updateSettings({ remindersJustSaved: false });
        setShowStartHereHighlight(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [settings.remindersJustSaved, updateSettings]);

  if (!tattoo) {
    return (
      <div className="min-h-screen bg-background safe-area-top px-6 pt-6 pb-6 space-y-4">
        {/* No Tattoo CTA */}
        <div className="flex flex-col items-center justify-center text-center py-8">
          <img 
            src={mascotImage} 
            alt="Budder Buddy mascot" 
            className="w-24 h-24 rounded-2xl shadow-lg mb-4 animate-fade-in"
          />
          <h2 className="text-xl font-bold mb-2">No Tattoo Added</h2>
          <p className="text-muted-foreground mb-6">Add your first tattoo to start tracking.</p>
          <Button onClick={() => navigate('/settings')} className="gradient-primary">
            Go to Settings
          </Button>
        </div>

        {/* Today's Reminders Card (even without tattoo) */}
        {settings.notificationsEnabled && scheduledReminders.times.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Today's Reminders</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {scheduledReminders.times.length} scheduled
              </span>
            </div>
            <div className="space-y-2">
              {scheduledReminders.times.map((reminder, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <span className="text-lg">
                    {reminder.type === 'wash' ? '🧼' : reminder.type === 'moisturize' ? '🧴' : '✨'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{reminder.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{reminder.type}</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatTimeForDisplay(reminder.time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Tip Card (even without tattoo) */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground">Daily Tip</h3>
          </div>
          <p className="text-sm text-muted-foreground">{dailyTip}</p>
        </div>
      </div>
    );
  }

  const dayNumber = getDayNumber(tattoo.tattooDate);
  const phase = getHealingPhase(dayNumber);
  const progress = getHealingProgress(dayNumber);
  const baseContent = getDayContent(dayNumber);
  const content = getAdjustedContent(baseContent, tattoo.sizeTier, tattoo.inkType);
  const phaseOneLiner = getPhaseOneLiner(phase.name);

  const todayDate = new Date().toISOString().split('T')[0];
  const existingCheckin = getCheckinForDay(tattoo.id, dayNumber);
  const photos = getPhotosForTattoo(tattoo.id);
  const hasPhotos = photos.length > 0;

  // Show start here card if: not dismissed AND (just saved reminders OR first time with no photos)
  const shouldShowStartHere = !settings.todayStartHereDismissed && 
    (settings.remindersJustSaved || !hasPhotos);

  // Show notifications banner if permission denied
  const showNotificationsBanner = settings.notificationPermissionStatus === 'denied';

  // Show safe to submerge countdown if within 14 days and activity reminders enabled
  const showSubmergeCountdown = settings.activityRemindersEnabled && dayNumber < 14;

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

  const handleDismissStartHere = () => {
    updateSettings({ todayStartHereDismissed: true });
  };

  const handleScrollToChecklist = () => {
    checklistRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleOpenAddPhoto = () => {
    navigate('/photos');
  };

  const handleOpenWhatsNormal = () => {
    whatsNormalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenIOSSettings = () => {
    // For web, we can only show a message. On native iOS, this would open system settings
    alert('Please open your device Settings app and enable notifications for Budder Buddy.');
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header with mascot */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img 
              src={mascotImage} 
              alt="Budder Buddy" 
              className="w-12 h-12 rounded-xl shadow-md"
            />
            <div>
              <p className="text-sm text-muted-foreground">{tattoo.bodyLocation}</p>
              <h1 className="text-3xl font-bold text-foreground">Day {dayNumber}</h1>
            </div>
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
        {/* Notifications Banner */}
        {showNotificationsBanner && (
          <div className="animate-fade-in">
            <EnableNotificationsBanner onOpenSettings={handleOpenIOSSettings} />
          </div>
        )}

        {/* Start Here Card */}
        {shouldShowStartHere && (
          <div className="animate-fade-in">
            <StartHereCard
              dayNumber={dayNumber}
              phaseOneLiner={phaseOneLiner}
              onScrollToChecklist={handleScrollToChecklist}
              onOpenAddPhoto={handleOpenAddPhoto}
              onOpenWhatsNormal={handleOpenWhatsNormal}
              onDismiss={handleDismissStartHere}
              isHighlighted={showStartHereHighlight}
            />
          </div>
        )}

        {/* Sun Guard Card */}
        <SunGuardCard />

        {/* Safe to Submerge Countdown */}
        {showSubmergeCountdown && (
          <SafeToSubmergeCard tattooDate={tattoo.tattooDate} />
        )}

        {/* Today's Reminders Card */}
        {settings.notificationsEnabled && scheduledReminders.times.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-border animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Today's Reminders</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {scheduledReminders.times.length} scheduled
              </span>
            </div>
            <div className="space-y-2">
              {scheduledReminders.times.map((reminder, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <span className="text-lg">
                    {reminder.type === 'wash' ? '🧼' : reminder.type === 'moisturize' ? '🧴' : '✨'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{reminder.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{reminder.type}</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatTimeForDisplay(reminder.time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Tip Card */}
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-5 border border-amber-500/20 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <h3 className="font-semibold text-foreground">Daily Tip</h3>
          </div>
          <p className="text-sm text-muted-foreground">{dailyTip}</p>
        </div>

        {/* What's Normal */}
        <div 
          ref={whatsNormalRef}
          className="bg-card rounded-2xl p-5 border border-border animate-fade-in"
        >
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
        <div 
          ref={checklistRef}
          className="bg-card rounded-2xl p-5 border border-border animate-fade-in" 
          style={{ animationDelay: '0.3s' }}
        >
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
