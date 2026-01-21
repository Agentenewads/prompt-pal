import { useState } from "react";
import { SuggestionCard, type Suggestion } from "./SuggestionCard";
import { Button } from "./ui/button";
import { CheckCheck, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisPanelProps {
  suggestions: Suggestion[];
  onApplySuggestion: (id: string) => void;
  onDismissSuggestion: (id: string) => void;
  onApplyAll: () => void;
  appliedIds: Set<string>;
  isAnalyzing: boolean;
  className?: string;
}

export function AnalysisPanel({
  suggestions,
  onApplySuggestion,
  onDismissSuggestion,
  onApplyAll,
  appliedIds,
  isAnalyzing,
  className,
}: AnalysisPanelProps) {
  const pendingSuggestions = suggestions.filter((s) => !appliedIds.has(s.id));
  const appliedCount = appliedIds.size;
  const totalCount = suggestions.length;

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Análise</h3>
          {totalCount > 0 && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              {appliedCount}/{totalCount}
            </span>
          )}
        </div>
        {pendingSuggestions.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onApplyAll}>
            <CheckCheck className="h-4 w-4 mr-1" />
            Aplicar Todas
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Analisando seu prompt...</p>
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Clique em "Analisar" para receber sugestões de melhoria
            </p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              applied={appliedIds.has(suggestion.id)}
              onApply={() => onApplySuggestion(suggestion.id)}
              onDismiss={() => onDismissSuggestion(suggestion.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
