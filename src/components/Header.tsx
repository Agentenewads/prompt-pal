import { Sparkles, Wand2 } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Wand2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              PromptForge
            </h1>
            <p className="text-xs text-muted-foreground">
              Editor de Engenharia de Prompts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>IA-Powered</span>
        </div>
      </div>
    </header>
  );
}
