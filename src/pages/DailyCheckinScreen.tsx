import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, Droplet, Sun, Hand, GlassWater, Sparkles, ArrowLeft, MessageCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useAppData } from '@/contexts/AppDataContext';
import { getDayNumber, getHealingPhase, getHealingProgress, DailyChecklist, DailyCheckin } from '@/types';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/mascot.png';
import { generateId } from '@/hooks/useStorage';
import FirstCheckinSuccess from '@/components/checkin/FirstCheckinSuccess';
import { analytics } from '@/lib/analyticsService';

const CHECKLIST_ITEMS = [
  { key: 'washed', label: 'Washed gently', icon: Droplet, emoji: '🧼' },
  { key: 'moisturized', label: 'Applied moisturizer', icon: Sparkles, emoji: '🧴' },
  { key: 'avoidedSun', label: 'Avoided sun exposure', icon: Sun, emoji: '☀️' },
  { key: 'didNotScratch', label: "Didn't scratch or pick", icon: Hand, emoji: '🙌' },
  { key: 'drankWater', label: 'Stayed hydrated', icon: GlassWater, emoji: '💧' },
] as const;

const OBSERVATION_TAGS = [
  { key: 'sore', label: 'Sore', emoji: '😣' },
  { key: 'really_sore', label: 'Really sore', emoji: '😖' },
  { key: 'hot', label: 'Hot to touch', emoji: '🔥' },
  { key: 'swelling', label: 'Swelling', emoji: '🫧' },
  { key: 'redness', label: 'Redness', emoji: '🔴' },
  { key: 'tight', label: 'Tight skin', emoji: '🤏' },
  { key: 'itchy', label: 'Itchy', emoji: '🐜' },
  { key: 'hard_scab', label: 'Hard scabbing', emoji: '🪨' },
  { key: 'light_peel', label: 'Light peeling', emoji: '🍂' },
  { key: 'heavy_peel', label: 'Heavy peeling', emoji: '🍁' },
  { key: 'cloudy', label: 'Cloudy/milky', emoji: '☁️' },
  { key: 'dry_flaky', label: 'Dry/flaky', emoji: '🏜️' },
  { key: 'looks_great', label: 'Looks great!', emoji: '✨' },
  { key: 'healing_well', label: 'Healing nicely', emoji: '💚' },
];

function getConsistencyLabel(score: number): { label: string; emoji: string; color: string } {
  if (score >= 80) return { label: 'Strong', emoji: '🏆', color: 'text-success' };
  if (score >= 50) return { label: 'On Track', emoji: '⭐', color: 'text-primary' };
  return { label: 'Needs Attention', emoji: '💪', color: 'text-amber-500' };
}

function calculateStreak(checkins: DailyCheckin[], tattooDate: string): { current: number; max: number } {
  if (checkins.length === 0) return { current: 0, max: 0 };

  // Build a set of checked-in day numbers
  const checkedDays = new Set(checkins.map(c => c.dayNumber));
  const today = getDayNumber(tattooDate);

  let current = 0;
  // Count backwards from today
  for (let d = today; d >= 0; d--) {
    if (checkedDays.has(d)) current++;
    else break;
  }

  // Max streak
  const sortedDays = [...checkedDays].sort((a, b) => a - b);
  let max = 0;
  let run = 0;
  let prev = -2;
  for (const d of sortedDays) {
    if (d === prev + 1) run++;
    else run = 1;
    if (run > max) max = run;
    prev = d;
  }

  return { current, max };
}

export default function DailyCheckinScreen() {
  const navigate = useNavigate();
  const {
    tattoos,
    settings,
    getTattoo,
    getCheckinForDay,
    getCheckinsForTattoo,
    addCheckin,
    updateCheckin,
  } = useAppData();

  const [checklist, setChecklist] = useState<DailyChecklist>({
    washed: false,
    moisturized: false,
    avoidedSun: false,
    didNotScratch: false,
    drankWater: false,
  });
  const [noteText, setNoteText] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [selectedObs, setSelectedObs] = useState<string[]>([]);
  const [showFirstCheckinSuccess, setShowFirstCheckinSuccess] = useState(false);

  const tattoo = settings.selectedTattooId ? getTattoo(settings.selectedTattooId) : tattoos[0];

  const dayNumber = tattoo ? getDayNumber(tattoo.tattooDate) : 0;
  const phase = tattoo ? getHealingPhase(dayNumber) : null;
  const progress = tattoo ? getHealingProgress(dayNumber) : 0;
  const todayDate = new Date().toISOString().split('T')[0];

  const existingCheckin = tattoo ? getCheckinForDay(tattoo.id, dayNumber) : undefined;

  // Healing consistency score: average of all check-in scores
  const healingScore = useMemo(() => {
    if (!tattoo) return 0;
    const allCheckins = getCheckinsForTattoo(tattoo.id);
    if (allCheckins.length === 0) return 0;

    const totalScore = allCheckins.reduce((sum, c) => {
      const items = Object.values(c.checklist);
      const checked = items.filter(Boolean).length;
      return sum + (checked / items.length) * 100;
    }, 0);

    return Math.round(totalScore / allCheckins.length);
  }, [tattoo, getCheckinsForTattoo]);

  const consistency = getConsistencyLabel(healingScore);

  // Streak calculation
  const streak = useMemo(() => {
    if (!tattoo) return { current: 0, max: 0 };
    const allCheckins = getCheckinsForTattoo(tattoo.id);
    return calculateStreak(allCheckins, tattoo.tattooDate);
  }, [tattoo, getCheckinsForTattoo]);

  // Total check-in count
  const totalCheckins = useMemo(() => {
    if (!tattoo) return 0;
    return getCheckinsForTattoo(tattoo.id).length;
  }, [tattoo, getCheckinsForTattoo]);

  // Sync state from existing checkin
  useEffect(() => {
    if (existingCheckin) {
      setChecklist(existingCheckin.checklist);
      setNoteText(existingCheckin.userNotes || '');
      setSelectedObs(existingCheckin.observations || []);
    }
  }, [existingCheckin]);

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const todayScore = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  const handleChecklistChange = (key: keyof DailyChecklist, checked: boolean) => {
    if (!tattoo) return;
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

  const handleObservationToggle = (tagKey: string) => {
    if (!tattoo) return;
    const newObs = selectedObs.includes(tagKey)
      ? selectedObs.filter(t => t !== tagKey)
      : [...selectedObs, tagKey];
    setSelectedObs(newObs);

    if (existingCheckin) {
      updateCheckin(existingCheckin.id, { observations: newObs });
    } else {
      addCheckin({
        id: generateId(),
        tattooId: tattoo.id,
        dayNumber,
        date: todayDate,
        checklist,
        observations: newObs,
      });
    }
  };

  const handleSaveNote = () => {
    if (!tattoo) return;
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
        observations: selectedObs,
      });
    }
    setShowNotes(false);
  };

  if (!tattoo) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background safe-area-top safe-area-bottom px-6">
        <img src={mascotImage} alt="Budder Buddy" className="w-24 h-24 rounded-2xl shadow-lg mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">No Tattoo Added</h2>
        <p className="text-muted-foreground mb-6 text-center">Add a tattoo first to start your daily check-ins.</p>
        <Button onClick={() => navigate('/ink-vault')} className="liquid-glass-primary text-primary-foreground">
          Go to Ink Vault
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background safe-area-top safe-area-bottom overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full liquid-glass-light flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{tattoo.bodyLocation}</p>
          <h1 className="text-lg font-bold text-foreground">Day {dayNumber} Check-in</h1>
        </div>
        {phase && (
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            phase.color === 'phase-initial' && "bg-phase-initial/20 text-phase-initial",
            phase.color === 'phase-peeling' && "bg-phase-peeling/20 text-phase-peeling",
            phase.color === 'phase-settling' && "bg-phase-settling/20 text-phase-settling",
            phase.color === 'phase-healed' && "bg-phase-healed/20 text-phase-healed",
          )}>
            {phase.name}
          </div>
        )}
      </div>

      <div className="px-4 space-y-4 pb-8">
        {/* Healing Consistency Card */}
        <div className="liquid-glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Healing Consistency</h3>
            </div>
            <span className="text-2xl">{consistency.emoji}</span>
          </div>

          <div className="flex items-end gap-4">
            {/* Contextual state */}
            <div className="flex-1">
              <div className={cn("text-2xl font-bold", consistency.color)}>{consistency.label}</div>
              <p className="text-xs text-muted-foreground mt-1">{healingScore}% average completion</p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-foreground">🔥 {streak.current}</div>
                <p className="text-[10px] text-muted-foreground">Streak</p>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{totalCheckins}</div>
                <p className="text-[10px] text-muted-foreground">Check-ins</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-muted-foreground">Day 0</span>
              <span className="text-[10px] text-muted-foreground">Day 30</span>
            </div>
          </div>
        </div>

        {/* Today's Checklist — shown first so notification taps land here */}
        <div className="liquid-glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-success" />
              <h3 className="font-semibold text-foreground">Today's Aftercare</h3>
            </div>
            <div className={cn(
              "px-2.5 py-1 rounded-full text-xs font-bold",
              todayScore === 100
                ? "bg-success/20 text-success"
                : todayScore >= 60
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            )}>
              {completedCount}/{CHECKLIST_ITEMS.length}
            </div>
          </div>

          <div className="space-y-1">
            {CHECKLIST_ITEMS.map((item) => {
              const isChecked = checklist[item.key as keyof DailyChecklist];
              return (
                <label
                  key={item.key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                    isChecked
                      ? "bg-success/10 border border-success/20"
                      : "bg-muted/30 border border-transparent hover:bg-muted/50"
                  )}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleChecklistChange(item.key as keyof DailyChecklist, !!checked)
                    }
                    className={cn(
                      "w-5 h-5 rounded-md border-2",
                      isChecked
                        ? "bg-success border-success text-success-foreground"
                        : "border-muted-foreground/40"
                    )}
                  />
                  <span className="text-lg">{item.emoji}</span>
                  <span className={cn(
                    "text-sm font-medium flex-1",
                    isChecked ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                  {isChecked && (
                    <Check className="w-4 h-4 text-success" />
                  )}
                </label>
              );
            })}
          </div>

          {/* Today's score bar */}
          <div className="mt-4 pt-3 border-t border-border/50">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Today's Score</span>
              <span className="font-bold text-foreground">{todayScore}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  todayScore === 100 ? "bg-success" : "gradient-primary"
                )}
                style={{ width: `${todayScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Observations */}
        <div className="liquid-glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👀</span>
            <h3 className="font-semibold text-foreground">What do you notice?</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {OBSERVATION_TAGS.map((tag) => {
              const isSelected = selectedObs.includes(tag.key);
              return (
                <button
                  key={tag.key}
                  onClick={() => handleObservationToggle(tag.key)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                    isSelected
                      ? "liquid-glass-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {tag.emoji} {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="liquid-glass-card rounded-2xl p-5">
          {!showNotes ? (
            <button
              onClick={() => setShowNotes(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                {noteText ? 'Edit note' : 'Add a note...'}
              </span>
              {noteText && (
                <span className="text-xs text-primary ml-auto">Saved ✓</span>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-foreground" />
                <h3 className="font-semibold text-foreground text-sm">Journal Note</h3>
              </div>
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="How does your tattoo feel today? Any changes you've noticed?"
                className="liquid-glass-input border-0 text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(false)}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveNote}
                  className="liquid-glass-primary text-primary-foreground"
                >
                  Save Note
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Done button */}
        {completedCount > 0 && (
          <Button
            onClick={() => {
              // If first ever checkin, show success modal
              if (totalCheckins <= 1) {
                analytics.trackOnce('first_checkin_completed');
                setShowFirstCheckinSuccess(true);
              } else {
                navigate('/');
              }
            }}
            className="w-full h-12 text-base font-semibold liquid-glass-primary text-primary-foreground"
          >
            Done — {getConsistencyLabel(todayScore).label} {getConsistencyLabel(todayScore).emoji}
          </Button>
        )}
      </div>

      {/* First Checkin Success */}
      <FirstCheckinSuccess
        open={showFirstCheckinSuccess}
        onClose={() => setShowFirstCheckinSuccess(false)}
      />
    </div>
  );
}
