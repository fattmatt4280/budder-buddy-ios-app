import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Moon, Sun, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useStorage';
import { cn } from '@/lib/utils';
import type { FrequencyPreset } from '@/types';
import { generateReminderTimes, formatTimeForDisplay } from '@/lib/reminderScheduler';
import mascotImage from '@/assets/mascot.png';

const FREQUENCY_OPTIONS: { value: FrequencyPreset; label: string; recommended?: boolean }[] = [
  { value: '2_per_day', label: '+2/day', recommended: true },
  { value: '3_per_day', label: '+3/day' },
  { value: '4_per_day', label: '+4/day' },
];

export default function ReminderSetupScreen() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  
  const [wakeTime, setWakeTime] = useState(settings.wakeTime);
  const [bedTime, setBedTime] = useState(settings.bedTime);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(settings.quietHoursEnabled);
  const [frequencyPreset, setFrequencyPreset] = useState<FrequencyPreset>(
    settings.notifSchedule.frequencyPreset
  );

  // Preview scheduled times
  const scheduledReminders = generateReminderTimes(
    wakeTime,
    bedTime,
    frequencyPreset,
    settings.reminderTypesEnabled,
    quietHoursEnabled
  );

  const handleSave = () => {
    updateSettings({
      wakeTime,
      bedTime,
      quietHoursEnabled,
      notifSchedule: {
        ...settings.notifSchedule,
        frequencyPreset,
      },
      hasCompletedOnboarding: true,
      hasCompletedReminderSetup: true,
    });
    navigate('/');
  };

  const handleSkip = () => {
    updateSettings({
      hasCompletedOnboarding: true,
      hasCompletedReminderSetup: false,
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="flex-1 px-6 pt-8 pb-4 overflow-auto">
        {/* Mascot and Title */}
        <div className="text-center mb-6 animate-fade-in">
          <img 
            src={mascotImage} 
            alt="Budder Buddy" 
            className="w-20 h-20 mx-auto rounded-2xl shadow-lg mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Set Your Reminder Schedule
          </h1>
          <p className="text-muted-foreground text-sm">
            We'll remind you to care for your tattoo during your awake hours only.
          </p>
        </div>

        {/* Wake/Bed Time Pickers */}
        <div className="space-y-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Wake Time */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <Label className="text-foreground font-medium">I usually wake up around</Label>
                </div>
              </div>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-foreground text-center font-medium"
              />
            </div>
          </div>

          {/* Bed Time */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Moon className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <Label className="text-foreground font-medium">I usually go to bed around</Label>
                </div>
              </div>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-foreground text-center font-medium"
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours Toggle */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Moon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <Label className="text-foreground font-medium">Quiet Hours</Label>
                <p className="text-xs text-muted-foreground">No notifications while sleeping</p>
              </div>
            </div>
            <Switch
              checked={quietHoursEnabled}
              onCheckedChange={setQuietHoursEnabled}
            />
          </div>
        </div>

        {/* Frequency Selector */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Label className="text-sm text-muted-foreground mb-3 block">Extra reminders between wake & bed</Label>
          <div className="grid grid-cols-3 gap-2">
            {FREQUENCY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setFrequencyPreset(option.value)}
                className={cn(
                  "relative py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm",
                  frequencyPreset === option.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                )}
              >
                {option.label}
                {option.recommended && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Plus morning &amp; bedtime application reminders included automatically.
          </p>
        </div>

        {/* Schedule Preview */}
        <div className="bg-muted/50 rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Your reminder schedule</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {scheduledReminders.times.map((reminder, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">
                  {formatTimeForDisplay(reminder.time)}
                </span>
                <span className="text-muted-foreground ml-1 text-xs">
                  ({reminder.type})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-8 pt-4 space-y-3">
        <Button
          onClick={handleSave}
          size="lg"
          className="w-full h-14 text-lg font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity"
        >
          <Clock className="w-5 h-5 mr-2" />
          Save & Schedule Reminders
        </Button>
        <Button
          onClick={handleSkip}
          variant="ghost"
          size="lg"
          className="w-full h-12 text-muted-foreground hover:text-foreground"
        >
          Set Up Later
        </Button>
      </div>
    </div>
  );
}
