import { useTattoos, useSettings, useCheckins } from '@/hooks/useStorage';
import { getDayNumber, getHealingPhase, HEALING_PHASES } from '@/types';
import { getDayContent } from '@/data/healingTimeline';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function TimelineScreen() {
  const { tattoos, getTattoo } = useTattoos();
  const { settings } = useSettings();
  const { getCheckinsForTattoo } = useCheckins();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const tattoo = settings.selectedTattooId ? getTattoo(settings.selectedTattooId) : tattoos[0];

  if (!tattoo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <p className="text-muted-foreground">No tattoo to display timeline for.</p>
      </div>
    );
  }

  const currentDay = getDayNumber(tattoo.tattooDate);
  const checkins = getCheckinsForTattoo(tattoo.id);
  const checkinDays = new Set(checkins.map(c => c.dayNumber));

  const selectedDayContent = selectedDay !== null ? getDayContent(selectedDay) : null;

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground mb-1">Healing Timeline</h1>
        <p className="text-muted-foreground text-sm">
          {tattoo.bodyLocation} • Day {currentDay}
        </p>
      </div>

      {/* Phase sections */}
      <div className="px-6 space-y-6 pb-8">
        {HEALING_PHASES.map((phase) => (
          <div key={phase.name} className="animate-fade-in">
            {/* Phase header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "w-3 h-3 rounded-full",
                phase.color === 'phase-initial' && "bg-phase-initial",
                phase.color === 'phase-peeling' && "bg-phase-peeling",
                phase.color === 'phase-settling' && "bg-phase-settling",
                phase.color === 'phase-healed' && "bg-phase-healed",
              )} />
              <h2 className="font-semibold text-foreground">{phase.name}</h2>
              <span className="text-sm text-muted-foreground">
                Days {phase.dayRange[0]}-{phase.dayRange[1]}
              </span>
            </div>

            {/* Day chips */}
            <div className="flex flex-wrap gap-2">
              {Array.from(
                { length: phase.dayRange[1] - phase.dayRange[0] + 1 },
                (_, i) => phase.dayRange[0] + i
              ).map((day) => {
                const isToday = day === currentDay;
                const isPast = day < currentDay;
                const hasCheckin = checkinDays.has(day);
                const isFuture = day > currentDay;

                return (
                  <button
                    key={day}
                    onClick={() => !isFuture && setSelectedDay(day)}
                    disabled={isFuture}
                    className={cn(
                      "relative w-11 h-11 rounded-xl flex items-center justify-center text-sm font-medium transition-all",
                      isToday && "gradient-primary text-primary-foreground ring-2 ring-primary/30",
                      isPast && hasCheckin && "bg-success/20 text-success border border-success/30",
                      isPast && !hasCheckin && "bg-muted text-muted-foreground",
                      isFuture && "bg-muted/50 text-muted-foreground/50 cursor-not-allowed",
                      !isToday && !isFuture && "hover:ring-2 hover:ring-primary/20"
                    )}
                  >
                    {day}
                    {isPast && hasCheckin && (
                      <Check className="absolute -top-1 -right-1 w-3.5 h-3.5 text-success bg-background rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Post-30 days */}
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full bg-phase-healed" />
            <h2 className="font-semibold text-foreground">Healed</h2>
            <span className="text-sm text-muted-foreground">Day 31+</span>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">
              After 30 days, your tattoo's surface should be healed. Continue moisturizing 
              and always protect with SPF when exposed to sun.
            </p>
          </div>
        </div>
      </div>

      {/* Day detail dialog */}
      <Dialog open={selectedDay !== null} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="bg-card border-border max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Day {selectedDay}
              {selectedDay !== null && (
                <span className={cn(
                  "text-sm font-normal px-2 py-0.5 rounded-full",
                  getHealingPhase(selectedDay).color === 'phase-initial' && "bg-phase-initial/20 text-phase-initial",
                  getHealingPhase(selectedDay).color === 'phase-peeling' && "bg-phase-peeling/20 text-phase-peeling",
                  getHealingPhase(selectedDay).color === 'phase-settling' && "bg-phase-settling/20 text-phase-settling",
                  getHealingPhase(selectedDay).color === 'phase-healed' && "bg-phase-healed/20 text-phase-healed",
                )}>
                  {getHealingPhase(selectedDay).name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedDayContent && (
            <div className="space-y-4 mt-2">
              <div>
                <h4 className="text-sm font-medium text-success mb-2">What's Normal</h4>
                <ul className="space-y-1">
                  {selectedDayContent.whatsNormal.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-primary mb-2">What To Do</h4>
                <ul className="space-y-1">
                  {selectedDayContent.whatToDo.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-destructive mb-2">What To Avoid</h4>
                <ul className="space-y-1">
                  {selectedDayContent.whatToAvoid.map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
