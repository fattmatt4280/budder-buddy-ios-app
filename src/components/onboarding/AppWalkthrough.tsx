import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Sparkles, CheckSquare, Camera, Trophy,
  Clock, BookOpen, Rocket, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import mascotImage from '@/assets/mascot.png';

interface AppWalkthroughProps {
  onComplete: () => void;
}

interface WalkthroughStep {
  icon?: React.ComponentType<{ className?: string }>;
  imageSrc?: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  emoji: string;
}

const STEPS: WalkthroughStep[] = [
  {
    imageSrc: mascotImage,
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    title: 'Welcome to Budder Buddy',
    description: 'Your personal tattoo healing companion. Let us show you around — it only takes a moment.',
    emoji: '👋',
  },
  {
    icon: CheckSquare,
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-500',
    title: 'Daily Check-In',
    description: 'Check off your aftercare tasks each day — wash, moisturize, avoid sun, and more. Build a streak and stay on track.',
    emoji: '✅',
  },
  {
    icon: Camera,
    iconBg: 'bg-sky-500/20',
    iconColor: 'text-sky-500',
    title: 'Ghost Camera',
    description: 'Overlay your previous photo to line up comparison shots perfectly. Watch your tattoo heal day by day.',
    emoji: '👻',
  },
  {
    icon: Trophy,
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-500',
    title: 'Ink Vault',
    description: 'Store all your tattoo details in one place — dates, artists, body locations, and healing progress.',
    emoji: '🏆',
  },
  {
    icon: Clock,
    iconBg: 'bg-teal-500/20',
    iconColor: 'text-teal-500',
    title: '30-Day Healing Timeline',
    description: "See exactly what to expect each day. We'll tell you what's normal and what to watch for.",
    emoji: '📅',
  },
  {
    icon: BookOpen,
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-500',
    title: 'Learn & Explore',
    description: 'Read expert articles on tattoo care, skin health, and when to seek professional advice.',
    emoji: '📚',
  },
  {
    icon: Rocket,
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    title: "You're All Set!",
    description: "Start by adding your tattoo in the Ink Vault. We'll guide you through every step of your healing journey.",
    emoji: '🚀',
  },
];

export default function AppWalkthrough({ onComplete }: AppWalkthroughProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Track current slide
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const isLastStep = currentIndex === STEPS.length - 1;

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onComplete(), 300);
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      handleDismiss();
    } else {
      emblaApi?.scrollNext();
    }
  }, [emblaApi, isLastStep, handleDismiss]);

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex flex-col transition-opacity duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />

      {/* Skip button */}
      <div className="relative z-10 flex justify-end px-6 pt-4 safe-area-top">
        <button
          onClick={handleDismiss}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-full bg-muted/30"
        >
          Skip
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Carousel */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {STEPS.map((step, index) => (
              <div key={index} className="min-w-0 shrink-0 grow-0 basis-full px-2">
                <WalkthroughSlide step={step} isActive={index === currentIndex} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-6 pb-8 safe-area-bottom space-y-6">
        {/* Dot indicators */}
        <div className="flex justify-center gap-2">
          {STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Action button */}
        <Button
          onClick={handleNext}
          className="w-full h-14 text-base font-semibold rounded-xl liquid-glass-primary text-white"
        >
          {isLastStep ? "Get Started" : "Next"}
        </Button>
      </div>
    </div>
  );
}

function WalkthroughSlide({ step, isActive }: { step: WalkthroughStep; isActive: boolean }) {
  return (
    <div className={cn(
      "flex flex-col items-center text-center transition-all duration-500",
      isActive ? "opacity-100 scale-100" : "opacity-50 scale-95"
    )}>
      {/* Icon / Image */}
      <div className="relative mb-8">
        {/* Glow */}
        <div
          className={cn("absolute inset-0 rounded-3xl blur-2xl opacity-30", step.iconBg)}
          style={{ transform: 'scale(1.5)' }}
        />
        <div className={cn(
          "relative w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden",
          "liquid-glass-card border-2 border-white/15"
        )}>
          {step.imageSrc ? (
            <img src={step.imageSrc} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          ) : step.icon ? (
            <step.icon className={cn("w-12 h-12", step.iconColor)} />
          ) : null}
        </div>
      </div>

      {/* Emoji */}
      <span className="text-3xl mb-3">{step.emoji}</span>

      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground mb-3 px-4">
        {step.title}
      </h2>

      {/* Description */}
      <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
        {step.description}
      </p>
    </div>
  );
}
