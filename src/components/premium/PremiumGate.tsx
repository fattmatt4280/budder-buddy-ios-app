import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/contexts/AppDataContext';
import { UpgradeCard } from './UpgradeCard';
import { Loader2 } from 'lucide-react';

interface PremiumGateProps {
  children: ReactNode;
  featureName?: string;
  /** If true, renders a compact inline card instead of full-page gate */
  compact?: boolean;
  /** If true, the gate is only active (useful for conditional gating like 2nd+ tattoo) */
  active?: boolean;
}

export function PremiumGate({ children, featureName, compact, active = true }: PremiumGateProps) {
  const { isPro, premiumLoading } = useAppData();
  const navigate = useNavigate();

  // If gate is not active or user is Pro, render children
  if (!active || isPro) {
    return <>{children}</>;
  }

  if (premiumLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'flex items-center justify-center px-6 py-8'}>
      <UpgradeCard
        featureName={featureName}
        onUpgrade={() => navigate('/upgrade')}
        compact={compact}
      />
    </div>
  );
}
