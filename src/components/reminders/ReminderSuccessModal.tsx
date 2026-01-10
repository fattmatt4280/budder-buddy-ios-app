import { CheckCircle, Clock, Moon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatTimeForDisplay } from '@/lib/reminderScheduler';

interface ReminderSuccessModalProps {
  open: boolean;
  onContinue: () => void;
  quietHoursRange: string;
  frequencyLabel: string;
  nextReminderTime: string;
  totalReminders: number;
}

export default function ReminderSuccessModal({
  open,
  onContinue,
  quietHoursRange,
  frequencyLabel,
  nextReminderTime,
  totalReminders,
}: ReminderSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="bg-card border-border max-w-sm" hideCloseButton>
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4 animate-scale-in">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <DialogTitle className="text-xl text-center">Reminders set ✅</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {/* Quiet Hours */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Moon className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Quiet hours</p>
              <p className="text-sm font-medium text-foreground">{quietHoursRange}</p>
            </div>
          </div>

          {/* Frequency */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Daily reminders</p>
              <p className="text-sm font-medium text-foreground">{totalReminders} reminders ({frequencyLabel})</p>
            </div>
          </div>

          {/* Next Reminder */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Next reminder</p>
              <p className="text-sm font-medium text-foreground">{formatTimeForDisplay(nextReminderTime)}</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onContinue}
          size="lg"
          className="w-full h-12 text-base font-semibold rounded-xl gradient-primary"
        >
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
}
