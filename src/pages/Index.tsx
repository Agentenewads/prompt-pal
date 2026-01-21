import { useState, useCallback } from "react";
import { Header } from "@/components/Header";
import { PromptEditor } from "@/components/PromptEditor";
import { ObjectiveInput } from "@/components/ObjectiveInput";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { analyzePrompt, applyIndividualSuggestion } from "@/lib/promptAnalyzer";
import type { Suggestion } from "@/components/SuggestionCard";
import { Sparkles, RotateCcw, ArrowRight, Code2 } from "lucide-react";

const Index = () => {
  const [prompt, setPrompt] = useState("");
  const [objective, setObjective] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const handleAnalyze = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsAnalyzing(true);
    setSuggestions([]);
    setAppliedIds(new Set());
    setShowOutput(false);

    // Simulate analysis delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = analyzePrompt(prompt, objective);
    setSuggestions(result.suggestions);
    setOptimizedPrompt(result.optimizedPrompt);
    setIsAnalyzing(false);
  }, [prompt, objective]);

  const handleApplySuggestion = useCallback((id: string) => {
    const suggestion = suggestions.find((s) => s.id === id);
    if (suggestion) {
      setPrompt((prev) => applyIndividualSuggestion(prev, suggestion));
      setAppliedIds((prev) => new Set([...prev, id]));
    }
  }, [suggestions]);

  const handleDismissSuggestion = useCallback((id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleApplyAll = useCallback(() => {
    const pendingSuggestions = suggestions.filter((s) => !appliedIds.has(s.id));
    let newPrompt = prompt;
    const newAppliedIds = new Set(appliedIds);

    pendingSuggestions.forEach((suggestion) => {
      newPrompt = applyIndividualSuggestion(newPrompt, suggestion);
      newAppliedIds.add(suggestion.id);
    });

    setPrompt(newPrompt);
    setAppliedIds(newAppliedIds);
  }, [suggestions, appliedIds, prompt]);

  const handleReset = useCallback(() => {
    setPrompt("");
    setObjective("");
    setSuggestions([]);
    setOptimizedPrompt("");
    setAppliedIds(new Set());
    setShowOutput(false);
  }, []);

  const handleFinalize = useCallback(() => {
    const result = analyzePrompt(prompt, objective);
    setOptimizedPrompt(result.optimizedPrompt);
    setShowOutput(true);
  }, [prompt, objective]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
        {/* Top Section - Objective */}
        <div className="mb-6">
          <ObjectiveInput value={objective} onChange={setObjective} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Prompt Original</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleAnalyze}
                  disabled={!prompt.trim() || isAnalyzing}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Analisar
                </Button>
              </div>
            </div>
            <div className="glass-card glow-border overflow-hidden" style={{ height: "400px" }}>
              <PromptEditor
                value={prompt}
                onChange={setPrompt}
                placeholder="Cole seu prompt aqui...

Exemplo:
Você é um assistente de IA que ajuda desenvolvedores.

<tools>
{
  &quot;name&quot;: &quot;search_docs&quot;,
  &quot;description&quot;: &quot;Busca na documentação&quot;
}
</tools>

Quando o usuário perguntar sobre código..."
                className="h-full border-0"
              />
            </div>

            {/* Finalize Button */}
            {suggestions.length > 0 && !showOutput && (
              <div className="flex justify-end animate-fade-in">
                <Button variant="success" size="lg" onClick={handleFinalize}>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Gerar Prompt Otimizado
                </Button>
              </div>
            )}
          </div>

          {/* Right Column - Analysis or Output */}
          <div className="glass-card overflow-hidden" style={{ height: showOutput ? "auto" : "480px" }}>
            {showOutput ? (
              <OutputPanel prompt={optimizedPrompt} />
            ) : (
              <AnalysisPanel
                suggestions={suggestions}
                onApplySuggestion={handleApplySuggestion}
                onDismissSuggestion={handleDismissSuggestion}
                onApplyAll={handleApplyAll}
                appliedIds={appliedIds}
                isAnalyzing={isAnalyzing}
              />
            )}
          </div>
        </div>

        {/* Output Section - Full Width when visible */}
        {showOutput && (
          <div className="mt-6 animate-slide-up">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOutput(false)}
              className="mb-4"
            >
              ← Voltar para Análise
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>PromptForge — Editor de Engenharia de Prompts para Agentes de IA</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
