import { supabase } from "@/integrations/supabase/client";
import type { Suggestion } from "@/components/SuggestionCard";

export interface AIAnalysisResult {
  suggestions: Suggestion[];
  optimizedPrompt: string;
  score: number;
  summary: string;
}

export async function analyzePromptWithAI(
  prompt: string,
  objective: string
): Promise<AIAnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-prompt", {
    body: { prompt, objective },
  });

  if (error) {
    console.error("AI analysis error:", error);
    throw new Error(error.message || "Failed to analyze prompt");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    suggestions: data.suggestions || [],
    optimizedPrompt: data.optimizedPrompt || prompt,
    score: data.score || 0,
    summary: data.summary || "",
  };
}
