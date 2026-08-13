import { AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HEAL_AID_URL, HealAidWarningReason } from '@/lib/healAid';

interface HealAidWarningDialogProps {
  open: boolean;
  reason: HealAidWarningReason;
  dayNumber: number;
  onClose: () => void;
}

/**
 * Shared "check it out with Heal Aid" prompt, triggered either by symptom tags
 * (a week+ into healing) or by the user self-flagging as concerned (day 2+).
 * Rendered identically from TodayScreen and DailyCheckinScreen — keep it here
 * so the two don't drift out of sync with each other.
 */
export default function HealAidWarningDialog({ open, reason, dayNumber, onClose }: HealAidWarningDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl p-6 animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning icon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-500/15 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-amber-500" />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-foreground text-center mb-2">
          {reason === 'concern' ? 'Trust Your Gut' : 'Heads Up — Check Your Healing'}
        </h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground text-center mb-4 leading-relaxed">
          {reason === 'concern' ? (
            "You flagged that you're feeling a little concerned about your tattoo today. That's worth listening to — a quick photo check can help put your mind at ease or catch something early."
          ) : (
            <>It's day {dayNumber} — a week or more into healing — and you're noticing soreness, heat, swelling, or redness.
            Symptoms like this showing up (or sticking around) this far along can be a sign of abnormal healing or infection.</>
          )}
        </p>

        <div className="bg-muted/50 rounded-xl p-3 mb-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">When in doubt:</span>{' '}
            Reach out to your tattoo artist or a medical professional.
            You can also use our AI-powered Heal Aid tool to analyze a photo of your tattoo for signs of concern.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => {
              onClose();
              window.open(HEAL_AID_URL, '_blank');
            }}
            className="w-full h-12 text-base font-semibold liquid-glass-primary text-white gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Try Heal Aid Tool
          </Button>
          <button
            onClick={onClose}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
}
