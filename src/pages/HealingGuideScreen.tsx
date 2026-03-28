import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { HealingStageCard } from "@/components/healing/HealingStageCard";
import { HealingGuideChat } from "@/components/healing/HealingGuideChat";
import { HEALING_STAGES, getNormalStages, getConcerningStages } from "@/data/healingStages";
import { BookOpen, MessageCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { PremiumGate } from "@/components/premium/PremiumGate";

export default function HealingGuideScreen() {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'normal' | 'concern'>('all');

  const filteredStages = activeFilter === 'all' 
    ? HEALING_STAGES 
    : activeFilter === 'normal' 
      ? getNormalStages() 
      : getConcerningStages();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground mb-1">Healing Guide</h1>
        <p className="text-muted-foreground text-sm">Identify stages & get expert guidance</p>
      </div>

      {/* Disclaimer */}
      <div className="px-6 mb-4">
        <div className="liquid-glass-card rounded-xl p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-200">
              <span className="font-semibold">Not Medical Advice:</span> This guide is for educational purposes only. 
              For medical concerns, please contact a healthcare professional.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="library" className="flex-1 px-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Visual Library
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Ask Guide
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-0">
          {/* Filter buttons */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Badge
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setActiveFilter('all')}
            >
              All Stages ({HEALING_STAGES.length})
            </Badge>
            <Badge
              variant={activeFilter === 'normal' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap flex items-center gap-1"
              onClick={() => setActiveFilter('normal')}
            >
              <CheckCircle className="w-3 h-3" />
              Normal ({getNormalStages().length})
            </Badge>
            <Badge
              variant={activeFilter === 'concern' ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap flex items-center gap-1 border-amber-500/30 text-amber-400"
              onClick={() => setActiveFilter('concern')}
            >
              <AlertTriangle className="w-3 h-3" />
              Watch For ({getConcerningStages().length})
            </Badge>
          </div>

          {/* Stages list */}
          <ScrollArea className="h-[calc(100vh-320px)]">
            <div className="space-y-3 pb-8">
              {filteredStages.map((stage) => (
                <HealingStageCard
                  key={stage.id}
                  stage={stage}
                  isExpanded={expandedStage === stage.id}
                  onToggle={() => setExpandedStage(
                    expandedStage === stage.id ? null : stage.id
                  )}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="chat" className="mt-0 h-[calc(100vh-280px)]">
          <PremiumGate featureName="AI Healing Guide" compact>
            <HealingGuideChat />
          </PremiumGate>
        </TabsContent>
      </Tabs>
    </div>
  );
}
