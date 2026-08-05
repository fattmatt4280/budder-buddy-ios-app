import { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAppData } from '@/contexts/AppDataContext';
import { useToast } from '@/hooks/use-toast';
import { getDayNumber } from '@/types';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD, local-ish is fine for a once-a-day gate
}

export default function DailyFeedbackPrompt() {
  const { userId, settings, updateSettings, tattoos } = useAppData();
  const { toast } = useToast();

  const [rating, setRating] = useState<'up' | 'down' | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(true);

  const currentTattoo = tattoos.find(t => t.id === settings.selectedTattooId) || tattoos[0];
  const dayNumber = currentTattoo ? getDayNumber(currentTattoo.tattooDate) : undefined;

  const dismissForToday = async () => {
    setOpen(false);
    await updateSettings({ lastBetaFeedbackPromptDate: todayStr() });
  };

  const handleSubmit = async () => {
    if (!userId) {
      await dismissForToday();
      return;
    }
    setSubmitting(true);
    try {
      await supabase.from('beta_feedback').insert({
        user_id: userId,
        rating,
        message: message.trim() || null,
        day_number: dayNumber ?? null,
      });
      toast({ title: 'Thanks for the feedback! 🙏', description: 'It genuinely helps us improve the beta.' });
    } catch {
      // Feedback is best-effort — don't block the user over a failed insert
    } finally {
      setSubmitting(false);
      await dismissForToday();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) dismissForToday(); }}>
      <DialogContent className="liquid-glass-card border-0 max-w-sm">
        <DialogHeader>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <MessageCircle className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>Quick beta check-in 👋</DialogTitle>
          <DialogDescription>
            Budder Buddy is in beta and free while we test it. Is it helping, and does it feel smooth to use so far?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 justify-center py-2">
          <button
            onClick={() => setRating('up')}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 border transition-colors',
              rating === 'up'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                : 'border-border text-muted-foreground hover:border-emerald-500/50'
            )}
          >
            <ThumbsUp className="w-5 h-5" />
            <span className="text-xs font-medium">Yes, it helps</span>
          </button>
          <button
            onClick={() => setRating('down')}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 border transition-colors',
              rating === 'down'
                ? 'border-destructive bg-destructive/10 text-destructive'
                : 'border-border text-muted-foreground hover:border-destructive/50'
            )}
          >
            <ThumbsDown className="w-5 h-5" />
            <span className="text-xs font-medium">Not really</span>
          </button>
        </div>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything feel clunky, confusing, or missing? (optional)"
          className="min-h-[70px] resize-none bg-muted border-border text-sm"
        />

        <div className="flex gap-2 pt-1">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={dismissForToday}
            disabled={submitting}
          >
            Maybe later
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting || (!rating && !message.trim())}
          >
            {submitting ? 'Sending...' : 'Send feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
