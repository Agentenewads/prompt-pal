import { Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ObjectiveInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ObjectiveInput({ value, onChange, className }: ObjectiveInputProps) {
  return (
    <div className={cn("glass-card glow-border p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-primary" />
        <label className="text-sm font-medium text-foreground">
          Objetivo do Prompt
        </label>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Descreva o que você espera que este prompt faça. Ex: 'O agente deve responder de forma concisa e técnica, chamando tools específicas quando necessário...'"
        className="w-full min-h-[80px] bg-secondary/50 rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/50 border border-border/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none transition-all"
      />
    </div>
  );
}
