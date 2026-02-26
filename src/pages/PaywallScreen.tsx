import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Camera, MessageCircle, Film, Star, Check, ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/contexts/AppDataContext';
import { purchaseService } from '@/lib/purchaseService';
import type { PlanType, PlanOfferings } from '@/lib/purchaseService';
import mascotImage from '@/assets/mascot.png';

const PRO_FEATURES = [
  { icon: Camera, label: 'Ghost Camera overlay' },
  { icon: MessageCircle, label: 'AI Healing Guide' },
  { icon: Film, label: 'Timelapse exports' },
  { icon: Star, label: 'Unlimited tattoos' },
];

export default function PaywallScreen() {
  const navigate = useNavigate();
  const { purchase, restore, isPro } = useAppData();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [offerings, setOfferings] = useState<PlanOfferings | null>(null);

  useEffect(() => {
    purchaseService.getProducts().then(setOfferings);
  }, []);

  // If already Pro, redirect back
  useEffect(() => {
    if (isPro) navigate(-1);
  }, [isPro, navigate]);

  const monthlyPrice = offerings?.monthly.price ?? '$3.99/mo';
  const annualPrice = offerings?.annual.price ?? '$24.99/yr';

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await purchase(selectedPlan);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restore();
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 px-6 pb-8 flex flex-col">
        {/* Hero */}
        <div className="text-center mb-6">
          <img src={mascotImage} alt="Budder Buddy" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-lg" />
          <h1 className="text-2xl font-bold text-foreground mb-1">Unlock Budder Buddy Pro</h1>
          <p className="text-sm text-muted-foreground">Get the full tattoo care experience</p>
        </div>

        {/* Features */}
        <div className="liquid-glass-card rounded-2xl p-5 mb-6">
          <div className="space-y-3">
            {PRO_FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{label}</span>
                <Check className="w-4 h-4 text-success ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Monthly */}
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`relative rounded-xl p-4 text-left transition-all border-2 ${
              selectedPlan === 'monthly'
                ? 'liquid-glass-light border-primary shadow-lg shadow-primary/20'
                : 'liquid-glass-card border-transparent'
            }`}
          >
            <p className="text-sm font-semibold text-foreground mb-1">Monthly</p>
            <p className="text-lg font-bold text-foreground">{monthlyPrice}</p>
            <p className="text-xs text-muted-foreground mt-1">Billed monthly</p>
          </button>

          {/* Annual */}
          <button
            onClick={() => setSelectedPlan('annual')}
            className={`relative rounded-xl p-4 text-left transition-all border-2 ${
              selectedPlan === 'annual'
                ? 'liquid-glass-light border-primary shadow-lg shadow-primary/20'
                : 'liquid-glass-card border-transparent'
            }`}
          >
            <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-success text-success-foreground text-[10px] font-bold uppercase">
              Save 30%
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Yearly</p>
            <p className="text-lg font-bold text-foreground">{annualPrice}</p>
            <p className="text-xs text-muted-foreground mt-1">Billed annually</p>
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA */}
        <Button
          onClick={handlePurchase}
          disabled={purchasing}
          variant="glassPrimary"
          size="lg"
          className="w-full mb-3"
        >
          <Crown className="w-5 h-5 mr-2" />
          {purchasing ? 'Processing…' : `Continue — ${selectedPlan === 'annual' ? annualPrice : monthlyPrice}`}
        </Button>

        {/* Restore */}
        <Button
          onClick={handleRestore}
          disabled={restoring}
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-muted-foreground mb-4"
        >
          <RotateCcw className="w-4 h-4" />
          {restoring ? 'Restoring…' : 'Restore Purchases'}
        </Button>

        {/* Disclaimer */}
        <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
          Payment will be charged to your Apple ID account at confirmation. Subscription automatically renews unless
          canceled at least 24 hours before the end of the current period. Manage or cancel anytime in{' '}
          <strong>Settings → Subscriptions</strong> on your iPhone.{' '}
          <button onClick={() => navigate('/privacy')} className="underline">Privacy Policy</button>{' · '}
          <button onClick={() => navigate('/terms')} className="underline">Terms of Service</button>
        </p>
      </div>
    </div>
  );
}
