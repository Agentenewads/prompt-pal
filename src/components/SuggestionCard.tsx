import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info, Lightbulb } from "lucide-react";

type SuggestionType = "improvement" | "warning" | "info" | "critical";

interface Suggestion {
  id: string;
  type: SuggestionType;
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  onApply?: () => void;
  onDismiss?: () => void;
  applied?: boolean;
}

const typeConfig = {
  improvement: {
    icon: Lightbulb,
    bgClass: "bg-primary/10 border-primary/30",
    iconClass: "text-primary",
    label: "Melhoria",
  },
  warning: {
    icon: AlertCircle,
    bgClass: "bg-warning/10 border-warning/30",
    iconClass: "text-warning",
    label: "Atenção",
  },
  info: {
    icon: Info,
    bgClass: "bg-accent/10 border-accent/30",
    iconClass: "text-accent",
    label: "Informação",
  },
  critical: {
    icon: AlertCircle,
    bgClass: "bg-destructive/10 border-destructive/30",
    iconClass: "text-destructive",
    label: "Crítico",
  },
};

export function SuggestionCard({
  suggestion,
  onApply,
  onDismiss,
  applied = false,
}: SuggestionCardProps) {
  const config = typeConfig[suggestion.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all duration-200 animate-slide-up",
        config.bgClass,
        applied && "opacity-50"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", config.iconClass)}>
          {applied ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded", config.bgClass, config.iconClass)}>
              {config.label}
            </span>
          </div>
          <h4 className="font-medium text-foreground mb-1">{suggestion.title}</h4>
          <p className="text-sm text-muted-foreground">{suggestion.description}</p>

          {suggestion.originalText && suggestion.suggestedText && (
            <div className="mt-3 space-y-2">
              <div className="diff-removed px-3 py-2 rounded text-sm font-mono bg-destructive/5">
                {suggestion.originalText}
              </div>
              <div className="diff-added px-3 py-2 rounded text-sm font-mono bg-success/5">
                {suggestion.suggestedText}
              </div>
            </div>
          )}

          {!applied && (onApply || onDismiss) && (
            <div className="flex gap-2 mt-3">
              {onApply && (
                <button
                  onClick={onApply}
                  className="text-xs font-medium px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Aplicar
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="text-xs font-medium px-3 py-1.5 rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                >
                  Ignorar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { Suggestion, SuggestionType };
