import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Cloud, 
  Shield, 
  ExternalLink, 
  ChevronRight,
  Clock,
  Droplet,
  Trash2,
  Moon,
  Sun,
  RefreshCw
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTattoos, useSettings } from '@/hooks/useStorage';
import { getDayNumber, getHealingPhase } from '@/types';
import type { FrequencyPreset, SnoozeDuration } from '@/types';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/mascot.png';
import { generateReminderTimes, formatTimeForDisplay, getFrequencyLabel } from '@/lib/reminderScheduler';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

const FREQUENCY_OPTIONS: { value: FrequencyPreset; label: string }[] = [
  { value: '2_per_day', label: '2x/day' },
  { value: '3_per_day', label: '3x/day' },
  { value: '4_per_day', label: '4x/day' },
];

const SNOOZE_OPTIONS: { value: SnoozeDuration; label: string }[] = [
  { value: '30', label: '30 min' },
  { value: '60', label: '60 min' },
  { value: '120', label: '2 hrs' },
];

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { tattoos, deleteTattoo } = useTattoos();
  const { settings, updateSettings, resetSettings } = useSettings();

  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const selectedTattoo = tattoos.find(t => t.id === settings.selectedTattooId) || tattoos[0];

  // Generate current reminder schedule for display
  const scheduledReminders = generateReminderTimes(
    settings.wakeTime,
    settings.bedTime,
    settings.notifSchedule.frequencyPreset,
    settings.reminderTypesEnabled,
    settings.quietHoursEnabled
  );

  const handleDeleteTattoo = () => {
    if (deleteConfirm) {
      deleteTattoo(deleteConfirm);
      if (settings.selectedTattooId === deleteConfirm) {
        const remaining = tattoos.filter(t => t.id !== deleteConfirm);
        updateSettings({ selectedTattooId: remaining[0]?.id || null });
      }
      setDeleteConfirm(null);
    }
  };

  const handleResetOnboarding = () => {
    resetSettings();
    navigate('/');
  };

  const handleRescheduleReminders = () => {
    // In a real app with Capacitor, this would cancel and reschedule notifications
    // For now, we just close the dialog as settings are already saved
    setReminderDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background safe-area-top">
      {/* Header with mascot */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <img 
            src={mascotImage} 
            alt="Budder Buddy" 
            className="w-12 h-12 rounded-xl shadow-md"
          />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="px-6 pb-8 space-y-6">
        {/* Current Tattoo */}
        {selectedTattoo && (
          <section className="animate-fade-in">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">CURRENT TATTOO</h2>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <Droplet className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedTattoo.bodyLocation}</p>
                    <p className="text-sm text-muted-foreground">
                      Day {getDayNumber(selectedTattoo.tattooDate)} • {getHealingPhase(getDayNumber(selectedTattoo.tattooDate)).name}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="px-2 py-1 bg-muted rounded-md">{selectedTattoo.sizeTier}</span>
                <span className="px-2 py-1 bg-muted rounded-md">{selectedTattoo.inkType === 'BlackGrey' ? 'Black & Grey' : 'Color'}</span>
                {selectedTattoo.artistName && (
                  <span className="px-2 py-1 bg-muted rounded-md">by {selectedTattoo.artistName}</span>
                )}
              </div>
            </div>
          </section>
        )}

        {/* All Tattoos */}
        {tattoos.length > 1 && (
          <section className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">ALL TATTOOS</h2>
            <div className="space-y-2">
              {tattoos.map((tattoo) => (
                <div
                  key={tattoo.id}
                  className={cn(
                    "bg-card rounded-xl border p-4 flex items-center justify-between",
                    tattoo.id === settings.selectedTattooId
                      ? "border-primary"
                      : "border-border"
                  )}
                >
                  <button
                    onClick={() => updateSettings({ selectedTattooId: tattoo.id })}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <div>
                      <p className="font-medium text-foreground">{tattoo.bodyLocation}</p>
                      <p className="text-sm text-muted-foreground">
                        Day {getDayNumber(tattoo.tattooDate)}
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(tattoo.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reminders Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">REMINDERS</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {/* Enable Notifications */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Enable reminders</span>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
              />
            </div>

            {settings.notificationsEnabled && (
              <>
                {/* Reminder Types */}
                <div className="p-4 space-y-3">
                  <Label className="text-sm text-muted-foreground">Reminder types</Label>
                  <div className="space-y-2">
                    {[
                      { key: 'wash' as const, label: 'Wash reminders', icon: '🧼' },
                      { key: 'moisturize' as const, label: 'Moisturize reminders', icon: '🧴' },
                      { key: 'checkin' as const, label: 'Daily check-in', icon: '✨' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{item.icon} {item.label}</span>
                        <Switch
                          checked={settings.reminderTypesEnabled[item.key]}
                          onCheckedChange={(checked) => 
                            updateSettings({ 
                              reminderTypesEnabled: { 
                                ...settings.reminderTypesEnabled, 
                                [item.key]: checked 
                              } 
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wake/Bed Time */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-foreground">Wake time</span>
                    </div>
                    <input
                      type="time"
                      value={settings.wakeTime}
                      onChange={(e) => updateSettings({ wakeTime: e.target.value })}
                      className="bg-muted border border-border rounded-lg px-2 py-1 text-foreground text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-foreground">Bed time</span>
                    </div>
                    <input
                      type="time"
                      value={settings.bedTime}
                      onChange={(e) => updateSettings({ bedTime: e.target.value })}
                      className="bg-muted border border-border rounded-lg px-2 py-1 text-foreground text-sm"
                    />
                  </div>
                </div>

                {/* Quiet Hours */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-foreground">Quiet Hours</span>
                      <p className="text-xs text-muted-foreground">No notifications while sleeping</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.quietHoursEnabled}
                    onCheckedChange={(checked) => updateSettings({ quietHoursEnabled: checked })}
                  />
                </div>

                {/* Frequency */}
                <div className="p-4 space-y-3">
                  <Label className="text-sm text-muted-foreground">Frequency</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {FREQUENCY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateSettings({ 
                          notifSchedule: { ...settings.notifSchedule, frequencyPreset: option.value } 
                        })}
                        className={cn(
                          "py-2 px-3 rounded-lg border transition-all text-sm font-medium",
                          settings.notifSchedule.frequencyPreset === option.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Snooze Duration */}
                <div className="p-4 space-y-3">
                  <Label className="text-sm text-muted-foreground">Snooze duration</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SNOOZE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateSettings({ snoozeMinutes: option.value })}
                        className={cn(
                          "py-2 px-3 rounded-lg border transition-all text-sm font-medium",
                          settings.snoozeMinutes === option.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule Preview & Reschedule */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Current schedule</Label>
                    <span className="text-xs text-muted-foreground">
                      {getFrequencyLabel(settings.notifSchedule.frequencyPreset)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scheduledReminders.times.map((reminder, index) => (
                      <div
                        key={index}
                        className="bg-muted border border-border rounded-lg px-2 py-1 text-xs"
                      >
                        <span className="font-medium text-foreground">
                          {formatTimeForDisplay(reminder.time)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={() => setReminderDialogOpen(true)}
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reschedule reminders
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Privacy */}
        <section className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">PRIVACY</h2>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cloud className="w-5 h-5 text-muted-foreground" />
              <div>
                <span className="font-medium text-foreground">Cloud Backup</span>
                <p className="text-sm text-muted-foreground">Coming soon</p>
              </div>
            </div>
            <Switch
              checked={settings.cloudSyncEnabled}
              onCheckedChange={(checked) => updateSettings({ cloudSyncEnabled: checked })}
              disabled
            />
          </div>
        </section>

        {/* Aftercare Recommendation */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">RECOMMENDED</h2>
          <a
            href="https://bluedreambudder.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Droplet className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Learn About Aftercare</p>
                  <p className="text-sm text-muted-foreground">Quality aftercare products</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
            </div>
          </a>
        </section>

        {/* Legal */}
        <section className="animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">LEGAL</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Terms of Service</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Disclaimer:</span> Budder Buddy 
              is for educational purposes only and does not provide medical advice. If you have 
              concerns about your healing tattoo, please contact your tattoo artist or a medical professional.
            </p>
          </div>
        </section>

        {/* Dev options */}
        <section>
          <Button
            onClick={handleResetOnboarding}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            Reset Onboarding (Dev)
          </Button>
        </section>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Reschedule Reminders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will update your reminder schedule based on your current settings.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wake time:</span>
                <span className="text-foreground font-medium">{formatTimeForDisplay(settings.wakeTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Bed time:</span>
                <span className="text-foreground font-medium">{formatTimeForDisplay(settings.bedTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frequency:</span>
                <span className="text-foreground font-medium">{getFrequencyLabel(settings.notifSchedule.frequencyPreset)}</span>
              </div>
            </div>
            <Button onClick={handleRescheduleReminders} className="w-full gradient-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Apply Schedule
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tattoo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the tattoo and all associated check-ins and photos. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTattoo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
