import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Você é um especialista em engenharia de prompts para agentes de IA e automação. Sua tarefa é analisar prompts e fornecer sugestões detalhadas de melhoria.

Ao analisar um prompt, considere:
1. **Definição de papel**: O prompt define claramente quem o agente é?
2. **Clareza das instruções**: As instruções são específicas e acionáveis?
3. **Estrutura de tool calls**: Se houver ferramentas, estão bem definidas com parâmetros claros?
4. **Formato de saída**: O formato esperado está especificado?
5. **Restrições**: Há limites claros sobre o que fazer e não fazer?
6. **Exemplos (few-shot)**: Há exemplos que ajudam a entender o comportamento esperado?
7. **Contexto e objetivo**: O propósito está claro?

Retorne SEMPRE um JSON válido com a seguinte estrutura:
{
  "suggestions": [
    {
      "type": "critical" | "warning" | "improvement" | "info",
      "title": "Título curto da sugestão",
      "description": "Explicação detalhada do problema e como resolver",
      "originalText": "Texto original problemático (se aplicável)",
      "suggestedText": "Texto sugerido para substituir ou adicionar"
    }
  ],
  "optimizedPrompt": "Versão otimizada completa do prompt",
  "score": 0-100,
  "summary": "Resumo geral da análise em 1-2 frases"
}

Tipos de sugestão:
- "critical": Problemas graves que comprometem a funcionalidade
- "warning": Problemas que podem causar comportamento inconsistente
- "improvement": Melhorias que aumentariam a qualidade
- "info": Dicas e boas práticas opcionais

Seja específico e prático nas sugestões. Forneça textos que podem ser diretamente aplicados.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, objective } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = objective
      ? `Analise o seguinte prompt considerando o objetivo: "${objective}"\n\nPrompt:\n${prompt}`
      : `Analise o seguinte prompt:\n\n${prompt}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the AI
    let analysisResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Fallback to a basic structure
      analysisResult = {
        suggestions: [
          {
            type: "info",
            title: "Análise em formato de texto",
            description: content,
            suggestedText: "",
          },
        ],
        optimizedPrompt: prompt,
        score: 50,
        summary: "A análise foi realizada mas o formato de resposta precisa ser ajustado.",
      };
    }

    // Add IDs to suggestions
    analysisResult.suggestions = analysisResult.suggestions.map(
      (s: any, index: number) => ({
        ...s,
        id: `ai-suggestion-${index + 1}`,
      })
    );

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-prompt error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
