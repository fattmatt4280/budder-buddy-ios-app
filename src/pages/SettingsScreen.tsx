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
  Trash2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTattoos, useSettings } from '@/hooks/useStorage';
import { getDayNumber, getHealingPhase } from '@/types';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/mascot.png';
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

export default function SettingsScreen() {
  const navigate = useNavigate();
  const { tattoos, deleteTattoo } = useTattoos();
  const { settings, updateSettings, resetSettings } = useSettings();

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [tempSchedule, setTempSchedule] = useState(settings.notifSchedule);

  const selectedTattoo = tattoos.find(t => t.id === settings.selectedTattooId) || tattoos[0];

  const handleSaveSchedule = () => {
    updateSettings({ notifSchedule: tempSchedule });
    setScheduleDialogOpen(false);
  };

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

        {/* Notifications */}
        <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">NOTIFICATIONS</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">Push Notifications</span>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
              />
            </div>
            {settings.notificationsEnabled && (
              <button
                onClick={() => {
                  setTempSchedule(settings.notifSchedule);
                  setScheduleDialogOpen(true);
                }}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Schedule</p>
                    <p className="text-sm text-muted-foreground">
                      {settings.notifSchedule.morningTime} & {settings.notifSchedule.eveningTime}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
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

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Notification Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="morningTime" className="text-muted-foreground">Morning Reminder</Label>
              <Input
                id="morningTime"
                type="time"
                value={tempSchedule.morningTime}
                onChange={(e) => setTempSchedule({ ...tempSchedule, morningTime: e.target.value })}
                className="mt-2 bg-muted border-border"
              />
            </div>
            <div>
              <Label htmlFor="eveningTime" className="text-muted-foreground">Evening Reminder</Label>
              <Input
                id="eveningTime"
                type="time"
                value={tempSchedule.eveningTime}
                onChange={(e) => setTempSchedule({ ...tempSchedule, eveningTime: e.target.value })}
                className="mt-2 bg-muted border-border"
              />
            </div>
            <Button onClick={handleSaveSchedule} className="w-full gradient-primary">
              Save Schedule
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
