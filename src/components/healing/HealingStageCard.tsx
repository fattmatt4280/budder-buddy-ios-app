import { HealingStageInfo } from "@/data/healingStages";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Eye } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface HealingStageCardProps {
  stage: HealingStageInfo;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function HealingStageCard({ stage, isExpanded: controlledExpanded, onToggle }: HealingStageCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const severityColors = {
    normal: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    monitor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    concern: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const severityIcons = {
    normal: <CheckCircle className="w-4 h-4" />,
    monitor: <Eye className="w-4 h-4" />,
    concern: <AlertTriangle className="w-4 h-4" />,
  };

  const severityLabels = {
    normal: 'Normal',
    monitor: 'Monitor',
    concern: 'Seek Care',
  };

  return (
    <Card 
      className={cn(
        "border-border/50 transition-all cursor-pointer hover:border-border",
        stage.severity === 'concern' && "border-red-500/30 bg-red-500/5",
        stage.severity === 'monitor' && "border-amber-500/30 bg-amber-500/5"
      )}
      onClick={handleToggle}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{stage.emoji}</span>
            <div>
              <h3 className="font-semibold text-foreground">{stage.name}</h3>
              <p className="text-xs text-muted-foreground">{stage.dayRange}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn("text-xs", severityColors[stage.severity])}
            >
              {severityIcons[stage.severity]}
              <span className="ml-1">{severityLabels[stage.severity]}</span>
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{stage.description}</p>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4 animate-fade-in">
          {/* Visual Signs */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              What It Looks Like
            </h4>
            <ul className="space-y-1">
              {stage.visualSigns.map((sign, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {sign}
                </li>
              ))}
            </ul>
          </div>

          {/* What to Expect */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">What to Expect</h4>
            <ul className="space-y-1">
              {stage.whatToExpect.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <div className={cn(
            "p-3 rounded-lg",
            stage.severity === 'normal' && "bg-primary/5",
            stage.severity === 'monitor' && "bg-amber-500/10",
            stage.severity === 'concern' && "bg-red-500/10"
          )}>
            <h4 className="text-sm font-medium text-foreground mb-2">
              {stage.severity === 'concern' ? '⚠️ Important' : '💡 Tips'}
            </h4>
            <ul className="space-y-1">
              {stage.tips.map((tip, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
