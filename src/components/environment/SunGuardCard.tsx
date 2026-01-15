import { useState, useEffect } from 'react';
import { Sun, RefreshCw, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { environmentService, type UVData } from '@/lib/environmentService';
import { useSettings } from '@/hooks/useStorage';
import { cn } from '@/lib/utils';

interface SunGuardCardProps {
  onUVDataChange?: (data: UVData | null) => void;
}

export default function SunGuardCard({ onUVDataChange }: SunGuardCardProps) {
  const { settings } = useSettings();
  const [uvData, setUVData] = useState<UVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUV = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await environmentService.checkUVAndNotify(settings);
      setUVData(data);
      onUVDataChange?.(data);
      
      if (!data) {
        setError('Could not get UV data. Please enable location access.');
      }
    } catch (err) {
      setError('Failed to check UV index');
    } finally {
      setLoading(false);
    }
  };

  // Auto-check on mount if Sun Guard is enabled
  useEffect(() => {
    if (settings.sunGuardEnabled) {
      fetchUV();
    }
  }, [settings.sunGuardEnabled]);

  if (!settings.sunGuardEnabled) {
    return null;
  }

  const getUVColor = (level: UVData['uvLevel']) => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-500/20';
      case 'moderate': return 'text-yellow-500 bg-yellow-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/20';
      case 'very_high': return 'text-red-500 bg-red-500/20';
      case 'extreme': return 'text-purple-500 bg-purple-500/20';
    }
  };

  const getUVLevelLabel = (level: UVData['uvLevel']) => {
    switch (level) {
      case 'low': return 'Low';
      case 'moderate': return 'Moderate';
      case 'high': return 'High';
      case 'very_high': return 'Very High';
      case 'extreme': return 'Extreme';
    }
  };

  return (
    <div className={cn(
      "rounded-2xl p-5 border animate-fade-in",
      uvData && (uvData.uvLevel === 'high' || uvData.uvLevel === 'very_high' || uvData.uvLevel === 'extreme')
        ? "bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30"
        : "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="font-semibold text-foreground">Sun Guard</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={fetchUV}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive mb-3">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading && !uvData && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Getting your location...</span>
        </div>
      )}

      {uvData && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "px-3 py-2 rounded-lg flex items-center gap-2",
              getUVColor(uvData.uvLevel)
            )}>
              <span className="text-2xl font-bold">{uvData.uvIndex}</span>
              <span className="text-sm font-medium">{getUVLevelLabel(uvData.uvLevel)}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{uvData.message}</p>
          <p className="text-xs text-muted-foreground/70">
            Last checked: {new Date(uvData.lastChecked).toLocaleTimeString()}
          </p>
        </div>
      )}

      {!uvData && !loading && !error && (
        <Button variant="outline" size="sm" onClick={fetchUV} className="mt-2">
          <MapPin className="w-4 h-4 mr-2" />
          Check UV Index
        </Button>
      )}
    </div>
  );
}
